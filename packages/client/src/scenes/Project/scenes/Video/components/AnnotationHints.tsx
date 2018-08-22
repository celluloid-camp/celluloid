import { AnnotationRecord } from '@celluloid/types';
import { createStyles, WithStyles, withStyles } from '@material-ui/core';
import * as classNames from 'classnames';
import * as React from 'react';
import { getUserColor } from 'utils/UserUtils';

const styles = createStyles({
  visible: {
    opacity: 1
  },
  hidden: {
    opacity: 0,
  },
  hint: {
    cursor: 'pointer' as 'pointer',
    position: 'absolute' as 'absolute',
    zIndex: 6,
    top: 0,
    height: 10,
    minWidth: 10,
    margin: 0,
    padding: 0,
    borderRadius: 2,
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
      annotations,
      visible,
      onClick,
      classes,
    } = props;

    const getHintStartPosition = (annotation: AnnotationRecord) =>
      `${(annotation.startTime * 100 / duration)}%`;
    const getHintWidth = (annotation: AnnotationRecord) =>
      `${((annotation.stopTime - annotation.startTime) * 100
        / duration
      )}%`;

    return (
      <div
        className={classes.container}
      >
        {Array.from(annotations)
          .map((annotation, index) => {
            return (
              <div
                key={annotation.id}
                className={classNames(
                  classes.hint,
                  visible ? classes.visible : classes.hidden
                )}
                style={{
                  color: 'white',
                  top: visible ? index * 24 : 0,
                  left: getHintStartPosition(annotation),
                  width: getHintWidth(annotation),
                  backgroundColor: getUserColor(annotation.user),
                  border: `2px solid ${getUserColor(annotation.user)}`
                }}
                onClick={() => onClick(annotation)}
              />
            );
          })
        }
      </div>
    );
  });
