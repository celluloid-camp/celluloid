import * as express from 'express';

import {isLoggedIn} from '../auth/Utils';
import * as ProjectsData from '../data/Projects';

import ApiAnnotations from './Annotations'

const router = express.Router();

router.use('/:projectId/annotations', ApiAnnotations)

router.get('/', (req, res) => {
  ProjectsData.getAll(req.user)
      .then(result => {
        return res.json(result);
      })
      .catch(error => {
        console.error('Failed to fetch projects from database', error);
        res.status(500).json({error: error.message});
      });
});

function isOwner(req, res, next) {
  return ProjectsData.isOwner(req.params.projectId, req.user)
      .then(
          isOwner => isOwner ?
              next() :
              res.status(403).json({error: 'ProjectOwnershipRequired'}))
      .catch(() => res.status(500).json({error: 'ProjectFetchFailed'}));
}

router.get('/:projectId', (req, res) => {
  const projectId = req.params.projectId;

  ProjectsData.getOne(projectId, req.user)
      .then(project => {
        res.json(project);
      })
      .catch(error => {
        console.error(`Failed to fetch project ${projectId}:`, error);
        if (error.message === 'ProjectNotFound') {
          res.status(404).json({error: error.message});
        } else {
          res.status(500).json({error: error.message});
        }
      });
});

router.put(
    '/:projectId', isLoggedIn, isOwner,
    (req, res) => {ProjectsData.update(req.body, req.params.projectId)
                       .then(result => res.status(200).json(result))
                       .catch(error => {
                         console.error('Failed to update project', error);
                         return res.status(500).json(
                             {error: 'ProjectUpdateFailed'});
                       })});

router.post('/', isLoggedIn, (req, res) => {
  ProjectsData.create(req.body, req.user)
      .then(result => {
        res.status(201).json(result[0]);
      })
      .catch(error => {
        console.error('Failed to create project', error);
        res.status(500).json({error: 'ProjectInsertionFailed'});
      });
});

export default router;