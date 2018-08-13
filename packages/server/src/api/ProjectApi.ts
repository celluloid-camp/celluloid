import { Router, Request, Response, NextFunction } from 'express';

import { isLoggedIn } from 'auth/Utils';
import * as ProjectStore from 'store/ProjectStore';

import AnnotationsApi from './AnnotationApi';
import { TeacherServerRecord } from 'types/UserTypes';
import { ProjectData } from '@celluloid/commons';

const router = Router({ mergeParams: true });

router.use('/:projectId/annotations', AnnotationsApi);

router.get('/', (req, res) => {
  return ProjectStore.getAll(req.user as TeacherServerRecord)
    .then((result: ProjectData[]) => {
      return res.json(result);
    })
    .catch((error: Error) => {
      // tslint:disable-next-line:no-console
      console.error('Failed to fetch projects from database:', error);
      return res.status(500).send();
    });
});

function isOwner(req: Request, res: Response, next: NextFunction) {
  const projectId = req.params.projectId;
  const user = req.user as TeacherServerRecord;

  ProjectStore.isOwner(projectId, user)
    .then((result: boolean) =>
      result ?
        next() :
        res.status(403).json({
          error: 'ProjectOwnershipRequired'
        }))
    .catch(() =>
      res.status(500).send()
    );
}

router.get('/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const user = req.user as TeacherServerRecord;

  ProjectStore.getOne(projectId, user)
    .then((project: ProjectData) => {
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

router.post('/', isLoggedIn, (req, res) => {
  const user = req.user as TeacherServerRecord;
  const project = req.body as ProjectData;
  ProjectStore.create(project, user)
    .then(result => {
      console.log(result);
      res.status(201).json(result);
    })
    .catch((error: Error) => {
      // tslint:disable-next-line:no-console
      console.error('Failed to create project:', error);
      return res.status(500).send();
    });
});

router.put('/:projectId', isLoggedIn, isOwner, (req, res) => {
  ProjectStore.update(req.body, req.params.projectId)
    .then(result => res.status(200).json(result))
    .catch(error => {
      // tslint:disable-next-line:no-console
      console.error('Failed to update project:', error);
      return res.status(500).send();
    });
});

router.delete('/:projectId', isLoggedIn, isOwner, (req, res) => {
  ProjectStore.del(req.params.projectId)
    .then(result => res.status(204).send())
    .catch(error => {
      console.error('Failed to delete project:', error);
      return res.status(500).send();
    });
});

export default router;