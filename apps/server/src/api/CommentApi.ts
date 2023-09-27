import { CommentRecord, UserRecord } from '@celluloid/types';
import * as express from 'express';

import {
  isLoggedIn,
  isProjectOwnerOrCollaborativeMember
} from '../auth/Utils';
import { logger } from '../backends/Logger';
import * as AnnotationStore from '../store/AnnotationStore';
import * as CommentStore from '../store/CommentStore';


const log = logger('api/CommentApi');

const router = express.Router({ mergeParams: true });

router.get('/', isLoggedIn, isProjectOwnerOrCollaborativeMember, (req, res) => {
  const annotationId = req.params.annotationId;
  const user = req.user;

  AnnotationStore.selectOne(annotationId, user)
    .then(() => CommentStore.selectByAnnotation(annotationId, user as UserRecord))
    .then((comments: CommentRecord[]) =>
      res.status(200).json(comments))
    .catch((error: Error) => {
      log.error('Failed to list comments:', error);
      if (error.message === 'AnnotationNotFound') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).send();
      }
    });
});

router.post('/', isLoggedIn, isProjectOwnerOrCollaborativeMember, async (req, res) => {
  const annotationId = req.params.annotationId;
  const user = req.user;
  const comment = req.body.text;

  try {
    await AnnotationStore.selectOne(annotationId, user);
    const result =  await CommentStore.insert(annotationId, comment, user as UserRecord);
  
    log.debug(result, "resutl");
    return res.status(201).json(result)
  }catch(error){
    if (error.message === 'AnnotationNotFound') {
      return res.status(404).json({ error: error.message });
    }
      return res.status(500).send();
    
  }
});

router.put('/:commentId', isLoggedIn, isProjectOwnerOrCollaborativeMember, (req:any, res) => {
  const commentId = req.params.commentId;
  const updated = req.body;
  const user = req.user;

  CommentStore.selectOne(commentId)
    .then((old: CommentRecord) =>
      old.userId !== user.id
        ? Promise.reject(new Error('UserNotCommentOwner'))
        : Promise.resolve()
    )
    .then(() => CommentStore.update(commentId, updated.text))
    .then(result => res.status(200).json(result))
    .catch((error: Error) => {
      log.error('Failed to update comment:', error);
      if (error.message === 'CommentNotFound') {
        return res.status(404).json({ error: error.message });
      } else if (error.message === 'UserNotCommentOwner') {
        return res.status(403).send({ error: error.message });
      } else {
        return res.status(500).send();
      }
    });
});

router.delete('/:commentId', isLoggedIn, isProjectOwnerOrCollaborativeMember, (req:any, res) => {
  const commentId = req.params.commentId;
  const user = req.user;

  CommentStore.selectOne(commentId)
    .then((comment: CommentRecord) =>
      comment.userId !== user.id
        ? Promise.reject(new Error('UserNotCommentOwner'))
        : Promise.resolve()
    )
    .then(() => CommentStore.del(commentId))
    .then(() => res.status(204).send())
    .catch((error: Error) => {
      log.error('Failed to delete comment:', error);
      if (error.message === 'CommentNotFound') {
        return res.status(404).json({ error: error.message });
      } else if (error.message === 'UserNotCommentOwner') {
        return res.status(403).send({ error: error.message });
      } else {
        return res.status(500).send();
      }
    });
});

export default router;