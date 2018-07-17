import * as React from 'react';
import * as classNames from 'classnames';
import { WithStyles, createStyles, withStyles } from '@material-ui/core';
import { getTeacherColor } from 'types/Teacher';

import { AnnotationRecord } from '../../../../../../../common/src/types/AnnotationTypes';
import * as AnnotationUtils from 'utils/AnnotationUtils';

const styles = createStyles({
  visible: {
    opacity: 1
  },
  hidden: {
    opacity: 0,
  },
  hint: {
    cursor: 'pointer' as 'pointer',
    opacity: 0,
    position: 'absolute' as 'absolute',
    zIndex: 6,
    top: 0,
    height: 10,
    minWidth: 10,
    margin: 0,
    padding: 0,
    borderRadius: 8,
    backgroundColor: 'white',
    transition: 'all 0.5s ease',
    '&:hover': {
      border: '2px solid white !important'
    }
  },
  container: {
    position: 'relative' as 'relative',
    margin: 24,
    height: 'calc(100% - 48px)',
    width: 'calc(100% - 48px)',
  },
});

interface Props extends WithStyles<typeof styles> {
  duration: number;
  position: number;
  annotations: Set<AnnotationRecord>;
  visible: boolean;
  onClick: Function;
}

export default
  withStyles(styles)((props: Props) => {
    const {
      duration,
      position,
      annotations,
      visible,
      onClick,
      classes,
    } = props;

    const getAnnotationPosition = (annotation: AnnotationRecord) =>
      `${(annotation.startTime * 100 / duration)}%`;
    const getAnnotationWidth = (annotation: AnnotationRecord) =>
      `${((annotation.stopTime - annotation.startTime) * 100
        / duration
      )}%`;

    return (
      <div
        className={classes.container}
      >
        {Array.from(annotations)
          .map((annotation, index) =>
            <div
              key={annotation.id}
              className={classNames(
                classes.hint,
                visible ? classes.visible : classes.hidden
              )}
              style={{
                top: visible ? index * 24 : 0,
                left: getAnnotationPosition(annotation),
                width: getAnnotationWidth(annotation),
                backgroundColor:
                  AnnotationUtils.visible(annotation, position) ?
                    'white' :
                    getTeacherColor(annotation.userId),
                border: `2px solid ${getTeacherColor(annotation.userId)}`
              }}
              onClick={onClick(annotation)}
            />
          )}
      </div>
    );
  });
