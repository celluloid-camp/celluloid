import { AnnotationData, AnnotationRecord, UserRecord } from '@celluloid/types';
import { isProjectOwner, isTeacher } from 'auth/Utils';
import * as express from 'express';
import * as AnnotationStore from 'store/AnnotationStore';
import * as ProjectStore from 'store/ProjectStore';

const router = express.Router({ mergeParams: true });

router.get('/', (req, res) => {
  const projectId = req.params.projectId;
  const user = req.user as UserRecord;

  ProjectStore.selectOne(projectId, user)
    .then(() => AnnotationStore.selectByProject(projectId, user))
    .then((annotations: AnnotationRecord[]) =>
      res.status(200).json(annotations))
    .catch((error: Error) => {
      console.error('Failed to list annotations:', error);
      if (error.message === 'ProjectNotFound') {
        return res.status(404).json({ error: error.message });
      } else {
        return res.status(500).send();
      }
    });
});

router.post('/', isTeacher, isProjectOwner, (req, res) => {
  const projectId = req.params.projectId;
  const annotation = req.body as AnnotationData;
  const user = req.user as UserRecord;

  AnnotationStore.insert(annotation, user, projectId)
    .then(result => {
      res.status(201).json(result);
    })
    .catch((error: Error) => {
      console.error('Failed to create annotation:', error);
      return res.status(500).send();
    });
});

router.put('/:annotationId', isTeacher, (req, res) => {
  const annotationId = req.params.annotationId;
  const updated = req.body;
  const user = req.user as UserRecord;

  AnnotationStore.selectOne(annotationId, user)
    .then((old: AnnotationRecord) =>
      old.userId !== user.id
        ? Promise.reject(new Error('UserNotAnnotationOwner'))
        : Promise.resolve()
    )
    .then(() => AnnotationStore.update(annotationId, updated))
    .then(result => res.status(200).json(result))
    .catch((error: Error) => {
      console.error('Failed to update annotation:', error);
      if (error.message === 'AnnotationNotFound') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'UserNotAnnotationOwner') {
        return res.status(403).json({ error: error.message });
      } else {
        res.status(500).send();
      }
    });
});

router.delete('/:annotationId', isTeacher, (req, res) => {
  const annotationId = req.params.annotationId;
  const user = req.user as UserRecord;

  AnnotationStore.selectOne(annotationId, user)
    .then((old: AnnotationRecord) =>
      old.userId !== user.id
        ? Promise.reject(new Error('UserNotAnnotationOwner'))
        : Promise.resolve()
    )
    .then(() => AnnotationStore.del(annotationId))
    .then(() => res.status(204).send())
    .catch((error: Error) => {
      console.error('Failed to delete annotation:', error);
      if (error.message === 'AnnotationNotFound') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'UserNotAnnotationOwner') {
        return res.status(403).json({ error: error.message });
      } else {
        res.status(500).send();
      }
    });
});
export default router;
