import { ProjectCreateData, ProjectGraphRecord, ProjectRecord, UserRecord } from '@celluloid/types';
import { isProjectOwner, isTeacher } from 'auth/Utils';
import { Router } from 'express';
import * as ProjectStore from 'store/ProjectStore';

import AnnotationsApi from './AnnotationApi';

const router = Router({ mergeParams: true });

router.use('/:projectId/annotations', AnnotationsApi);

function fetchMembers(project: ProjectRecord, user?: UserRecord):
  PromiseLike<UserRecord[]> {
  if (project.collaborative || (user && user.id === project.userId)) {
    return ProjectStore.selectProjectMembers(project.id);
  } else if (user) {
    return ProjectStore.isMember(project.id, user)
      .then(member => member
        ? Promise.resolve([user])
        : Promise.resolve([]));
  } else {
    return Promise.resolve([]);
  }
}

router.get(
  '/',
  (req, res) => {
    return ProjectStore.selectAll(req.user as UserRecord)
      .then((projects: ProjectGraphRecord[]) =>
        Promise.all(projects.map(project =>
          fetchMembers(project, req.user)
            .then((members: UserRecord[]) =>
              ({ ...project, members })
            )
        ))
      )
      .then((result: ProjectGraphRecord[]) => {
        console.log(result.map(proj => proj.members));
        return res.json(result);
      })
      .catch((error: Error) => {
        // tslint:disable-next-line:no-console
        console.error('Failed to fetch projects from database:', error);
        return res.status(500).send();
      });
  });

router.get(
  '/:projectId',
  (req, res) => {
    const projectId = req.params.projectId;
    const user = req.user as UserRecord;

    ProjectStore.selectOne(projectId, user)
      .then((project: ProjectGraphRecord) => {
        return res.json(project);
      })
      .catch((error: Error) => {
        // tslint:disable-next-line:no-console
        console.error(`Failed to fetch project ${projectId}:`, error);
        if (error.message === 'ProjectNotFound') {
          return res.status(404).json({ error: error.message });
        } else {
          return res.status(500).send();
        }
      });
  });

router.post(
  '/',
  isTeacher,
  (req, res) => {
    const user = req.user as UserRecord;
    const project = req.body as ProjectCreateData;

    ProjectStore.insert(project, user)
      .then(result => {
        return res.status(201).json(result);
      })
      .catch((error: Error) => {
        // tslint:disable-next-line:no-console
        console.error('Failed to create project:', error);
        return res.status(500).send();
      });
  });

router.put(
  '/:projectId',
  isTeacher,
  isProjectOwner,
  (req, res) => {
    ProjectStore.update(req.body, req.params.projectId)
      .then(result => res.status(200).json(result))
      .catch(error => {
        // tslint:disable-next-line:no-console
        console.error('Failed to update project:', error);
        return res.status(500).send();
      });
  });

router.delete(
  '/:projectId',
  isTeacher,
  isProjectOwner,
  (req, res) => {
    ProjectStore.del(req.params.projectId)
      .then(() => res.status(204).send())
      .catch(error => {
        console.error('Failed to delete project:', error);
        return res.status(500).send();
      });
  });

router.get(
  '/:projectId/members',
  (req, res) => {
    const projectId = req.params.projectId;
    const user = req.user;

    ProjectStore.selectOne(projectId, user)
      .then((project: ProjectGraphRecord) =>
        fetchMembers(project, req.user)
      )
      .then(members => res.status(200).json(members))
      .catch(error => {
        console.error('Failed to list project members:', error);
        if (error.message === 'ProjectNotFound') {
          return res.status(404).json({ error: error.message });
        } else {
          return res.status(500).send();
        }
      });
  });

router.put(
  '/:projectId/share',
  isTeacher,
  isProjectOwner,
  (req, res) => {
    const projectId = req.params.projectId;
    ProjectStore.shareById(projectId, req.body)
      .then(() => ProjectStore.selectOne(projectId, req.user))
      .then(project => res.status(200).json(project))
      .catch(error => {
        console.error(`Failed to share project with id ${projectId}:`, error);
        return res.status(500).send();
      });
  });

router.delete(
  '/:projectId/share',
  isTeacher,
  isProjectOwner,
  (req, res) => {
    const projectId = req.params.projectId;
    ProjectStore.unshareById(projectId)
      .then(() => ProjectStore.selectOne(projectId, req.user))
      .then(project => res.status(200).json(project))
      .catch(error => {
        console.error(`Failed to unshare project with id ${projectId}:`, error);
        return res.status(500).send();
      });
  });

router.put(
  '/:projectId/public',
  isTeacher,
  isProjectOwner,
  (req, res) => {
    const projectId = req.params.projectId;
    ProjectStore.setPublicById(projectId, true)
      .then(() => ProjectStore.selectOne(projectId, req.user))
      .then(project => res.status(200).json(project))
      .catch(error => {
        console.error(`Failed to set project public with id ${projectId}:`, error);
        return res.status(500).send();
      });
  });

router.delete(
  '/:projectId/public',
  isTeacher,
  isProjectOwner,
  (req, res) => {
    const projectId = req.params.projectId;
    ProjectStore.setPublicById(projectId, false)
      .then(() => ProjectStore.selectOne(projectId, req.user))
      .then(project => res.status(200).json(project))
      .catch(error => {
        console.error(`Failed to unset public on project with id ${projectId}:`, error);
        return res.status(500).send();
      });
  });

router.put(
  '/:projectId/collaborative',
  isTeacher,
  isProjectOwner,
  (req, res) => {
    const projectId = req.params.projectId;
    return ProjectStore.setCollaborativeById(projectId, true)
      .then(() => ProjectStore.selectOne(projectId, req.user))
      .then(project => res.status(200).json(project))
      .catch(error => {
        console.error(`Failed to unset collaborative on project with id ${projectId}:`, error);
        return res.status(500).send();
      });
  });

router.delete(
  '/:projectId/collaborative',
  isTeacher,
  isProjectOwner,
  (req, res) => {
    const projectId = req.params.projectId;
    return ProjectStore.setCollaborativeById(projectId, false)
      .then(() => ProjectStore.selectOne(projectId, req.user))
      .then(project => res.status(200).json(project))
      .catch(error => {
        console.error(`Failed to unset collaborative on project with id ${projectId}:`, error);
        return res.status(500).send();
      });
  });

export default router;