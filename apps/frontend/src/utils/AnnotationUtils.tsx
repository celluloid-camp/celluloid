import { AnnotationRecord, CommentRecord, UserRecord } from '@celluloid/types';

export function visible(
  annotation: AnnotationRecord,
  position: number
) {
  return (
    position >= annotation.startTime
    && position <= annotation.stopTime
  );
}

const DEFAULT_ANNOTATION_DURATION = 60;

export function maxAnnotationDuration(startTime: number, duration: number) {
  const stopTime = startTime + DEFAULT_ANNOTATION_DURATION;
  return (stopTime < duration ? stopTime : duration);
}

export function canEditAnnotation(
  annotation: AnnotationRecord,
  user: UserRecord
) {
  return user.id === annotation.userId;
}

export function canEditComment(
  comment: CommentRecord,
  user: UserRecord
) {
  return user.id === comment.userId;
}

export const canDeleteComment = canEditComment;
export const canDeleteAnnotation = canEditAnnotation;