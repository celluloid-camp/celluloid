import { CommentRecord } from '@celluloid/types';
import {
  isLoggedIn,
  isProjectOwnerOrCollaborativeMember
} from 'auth/Utils';
import * as express from 'express';
import * as AnnotationStore from 'store/AnnotationStore';
import * as CommentStore from 'store/CommentStore';

const router = express.Router({ mergeParams: true });

router.get('/', isLoggedIn, isProjectOwnerOrCollaborativeMember, (req, res) => {
  const annotationId = req.params.annotationId;
  const user = req.user;

  AnnotationStore.selectOne(annotationId, user)
    .then(() => CommentStore.selectByAnnotation(annotationId, user))
    .then((comments: CommentRecord[]) =>
      res.status(200).json(comments))
    .catch((error: Error) => {
      console.error('Failed to list comments:', error);
      if (error.message === 'AnnotationNotFound') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).send();
      }
    });
});

router.post('/', isLoggedIn, isProjectOwnerOrCollaborativeMember, (req, res) => {
  const annotationId = req.params.annotationId;
  const user = req.user;
  const comment = req.body.text;

  AnnotationStore.selectOne(annotationId, user)
    .then(() => CommentStore.insert(annotationId, comment, user))
    .then(result => res.status(201).json(result))
    .catch((error: Error) => {
      console.error('Failed to create comment:', error);
      if (error.message === 'AnnotationNotFound') {
        return res.status(404).json({ error: error.message });
      } else {
        return res.status(500).send();
      }
    });
});

router.put('/:commentId', isLoggedIn, isProjectOwnerOrCollaborativeMember, (req, res) => {
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
      console.error('Failed to update comment:', error);
      if (error.message === 'CommentNotFound') {
        return res.status(404).json({ error: error.message });
      } else if (error.message === 'UserNotCommentOwner') {
        return res.status(403).send({ error: error.message });
      } else {
        return res.status(500).send();
      }
    });
});

router.delete('/:commentId', isLoggedIn, isProjectOwnerOrCollaborativeMember, (req, res) => {
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
      console.error('Failed to delete comment:', error);
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