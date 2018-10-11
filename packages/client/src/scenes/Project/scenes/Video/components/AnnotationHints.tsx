import { AnnotationRecord } from '@celluloid/types';
import {
  createStyles,
  Paper,
  Theme,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core';
import * as classNames from 'classnames';
import * as React from 'react';
import { getUserColor } from 'utils/UserUtils';

const styles = (theme: Theme) => createStyles({
  visible: {
    opacity: 1
  },
  hidden: {
    opacity: 0,
  },
  hint: {
    cursor: 'pointer',
    position: 'absolute' as 'absolute',
    zIndex: 6,
    height: 10,
    minWidth: 10,
    margin: 0,
    padding: 0,
    borderRadius: 2,
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    '&:hover': {
      filter: 'brightness(85%)'
    }
  },
  container: {
    position: 'relative' as 'relative',
    margin: 24,
    height: 'calc(100% - 48px)',
    width: 'calc(100% - 48px)',
  },
  title: {
    color: theme.palette.text.disabled,
    top: 0,
    left: 0,
  }
});

interface Props extends WithStyles<typeof styles> {
  duration: number;
  position: number;
  annotations: AnnotationRecord[];
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
        <Typography className={classes.title} align="left" variant="h5">
          {annotations.length > 0
            ? `${annotations.length} annotations`
            : `Aucune annotation`
          }
        </Typography>
        {annotations.map((annotation, index) => {
            return (
              <Paper
                key={annotation.id}
                className={classNames(
                  classes.hint,
                  visible ? classes.visible : classes.hidden
                )}
                style={{
                  color: 'white',
                  top: visible ? 48 + (index * 24) : 0,
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
