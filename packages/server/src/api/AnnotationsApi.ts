import { isLoggedIn } from 'auth/Utils';
import * as express from 'express';
import * as AnnotationStore from 'store/AnnotationStore';
import * as ProjectStore from 'store/ProjectStore';
import { TeacherServerRecord } from 'types/TeacherTypes';
import { AnnotationData, AnnotationRecord } from '@celluloid/commons';
import { ProjectData } from '@celluloid/commons';

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => {
  const projectId = req.params.projectId;
  const user = req.user as TeacherServerRecord;

  ProjectStore.getOne(projectId, user)
    .then(() => AnnotationStore.getAll(projectId, user))
    .then((annotations: AnnotationRecord[]) =>
      res.status(200).json(annotations))
    .catch((error: Error) =>
      error.message === 'ProjectNotFound'
        ? res.status(404).json({ error: error.message })
        : res.status(500).json({ error: error.message })
    );
});

router.post('/', isLoggedIn, (req, res) => {
  const projectId = req.params.projectId;
  const annotation = req.body as AnnotationData;
  const user = req.user as TeacherServerRecord;

  ProjectStore.getOne(projectId, user)
    .then((project: ProjectData) =>
      project.userId !== user.id && !project.collaborative
        ? Promise.reject(new Error('ProjectNotCollaborative'))
        : Promise.resolve()
    )
    .then(AnnotationStore.create(annotation, user, projectId))
    .then(res.status(201).json)
    .catch((error: Error) => {
      // tslint:disable-next-line:no-console
      console.error('Failed to create annotation', error);
      if (error.message === 'ProjectNotFound') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'ProjectNotCollaborative') {
        res.status(500).json({ error: error.message });
      }
    });
});

router.put('/:annotationId', isLoggedIn, (req, res) => {
  const annotationId = req.params.annotationId;
  const updated = req.body;
  const user = req.user as TeacherServerRecord;

  AnnotationStore.getOne(annotationId, user)
    .then((old: AnnotationRecord) =>
      old.userId !== user.id
        ? Promise.reject(new Error('UserNotAnnotationOwner'))
        : Promise.resolve()
    )
    .then(AnnotationStore.update(annotationId, updated))
    .then(res.status(200).json)
    .catch((error: Error) => {
      // tslint:disable-next-line:no-console
      console.error('Failed to update annotation', error);
      if (error.message === 'AnnotationNotFound') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'AnnotationUpdateError' });
      }
    });
});

export default router;
