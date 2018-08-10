import { AnnotationData } from '@celluloid/commons';

export function visible(annotation: AnnotationData, position: number) {
  return (
    position >= annotation.startTime
    && position <= annotation.stopTime
  );
}