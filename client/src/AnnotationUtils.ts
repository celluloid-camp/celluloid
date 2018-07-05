import { AnnotationData } from '../../common/src/types/Annotation';

export function visible(annotation: AnnotationData, position: number) {
  return (position >= annotation.startTime && position <= annotation.stopTime);
}