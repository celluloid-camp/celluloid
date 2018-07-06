import * as express from 'express';

import {isLoggedIn} from '../auth/Utils';
import * as AnnotationsData from '../data/Annotations';
import * as ProjectsData from '../data/Projects';

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => {
  const projectId = req.params.projectId;
  const user = req.user;

  ProjectsData.getOne(projectId, user)
      .then(() => AnnotationsData.getAll(projectId, user))
      .then(annotations => res.status(200).json(annotations))
      .catch(
          error => error.message === 'ProjectNotFound' ?
              res.status(404).json({error: error.message}) :
              res.status(500).json({error: error.message}));
});

router.post('/', isLoggedIn, (req, res) => {
  const projectId = req.params.projectId;
  const annotation = req.body;
  const user = req.user;

  ProjectsData.getOne(projectId, user)
      .then(
          project => project.authorId !== user.id && !project.collaborative ?
              Promise.reject(new Error('ProjectNotCollaborative')) :
              Promise.resolve())
      .then(AnnotationsData.create(annotation, user, projectId))
      .then(res.status(201).json)
      .catch(error => {
        console.error('Failed to create annotation', error);
        if (error.message === 'ProjectNotFound') {
          res.status(404).json({error: error.message});
        } else if (error.message === 'ProjectNotCollaborative') {
          res.status(500).json({error: error.message});
        }
      });
});

router.put('/:annotationId', isLoggedIn, (req, res) => {
  const annotationId = req.params.annotationId;
  const updated = req.body;
  const user = req.user;

  AnnotationsData.getOne(annotationId, req.user)
      .then(
          old => old.teacherId !== user.id ?
              Promise.reject(new Error('TeacherNotAnnotationOwner')) :
              Promise.resolve())
      .then(AnnotationsData.update(annotationId, updated))
      .then(result => res.status(200).json(result[0]))
      .catch(error => {
        console.error('Failed to update annotation', error);
        if (error.message === 'AnnotationNotFound') {
          res.status(404).json({error: error.message});
        } else {
          res.status(500).json({error: 'AnnotationUpdateError'});
        }
      });
});

export default router;