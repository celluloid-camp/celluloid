import { AnnotationRecord } from '@celluloid/types';
import {
  createStyles,
  Paper,
  Theme,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core';
import classNames from 'classnames';
import * as React from 'react';
import { getUserColor } from 'utils/UserUtils';
import { withI18n, WithI18n } from 'react-i18next';

const styles = (theme: Theme) => createStyles({
  visible: {
    opacity: 1
  },
  hidden: {
    opacity: 0,
  },
  hint: {
    cursor: 'pointer',
    position: 'absolute',
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
    position: 'relative',
    margin: 24,
    height: `calc(100% - ${theme.spacing.unit * 6}px)`,
    width: `calc(100% - ${theme.spacing.unit * 6}px)`,
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
  withStyles(styles)(withI18n()((props: Props & WithI18n) => {
    const {
      duration,
      annotations,
      visible,
      onClick,
      classes,
      t
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
            ? t('annotation.hintLabel', { count: annotations.length })
            : t('annotation.hintLabelNone')
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
  }));
