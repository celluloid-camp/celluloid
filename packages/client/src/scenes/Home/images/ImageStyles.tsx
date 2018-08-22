import { createStyles, Theme } from '@material-ui/core';

export const styles = ({palette}: Theme) => createStyles({
  icon: {
    fill: palette.text.disabled
  }
});