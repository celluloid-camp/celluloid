import { createStyles, Theme } from "@mui/material";

export const styles = ({ palette }: Theme) =>
  createStyles({
    icon: {
      fill: palette.grey[600],
    },
  });
