import { AnnotationData } from '../../../common/src/types/AnnotationTypes';

export function visible(annotation: AnnotationData, position: number) {
  return (
    position >= annotation.startTime
    && position <= annotation.stopTime
  );
}