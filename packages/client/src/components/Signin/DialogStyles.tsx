import { createStyles, Theme } from '@material-ui/core/styles';

export const dialogStyles = ({spacing}: Theme) => createStyles({
  input: { display: 'flex', flex: 1, margin: spacing.unit }
});