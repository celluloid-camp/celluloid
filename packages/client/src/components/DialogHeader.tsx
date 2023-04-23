import CloseIcon from "@mui/icons-material/Close";
import { Box, DialogTitle, IconButton, LinearProgress } from "@mui/material";
import * as React from "react";

// const styles = ({ palette, spacing }: Theme) =>
//   createStyles({
//     closeIcon: {
//       position: "absolute",
//       right: spacing.unit,
//       top: spacing.unit,
//     },
//     progress: {
//       flexGrow: 1,
//     },
//     title: {
//       backgroundColor: palette.primary.main,
//       textAlign: "center",
//     },
//     titleTypo: {
//       color: palette.primary.contrastText,
//     },
//   });

interface Props {
  title: string;
  loading: boolean;
  children?: React.ReactNode;
  onClose(): void;
}

export default ({ onClose, title, loading, children }: Props) => (
  <>
    <DialogTitle sx={{ backgroundColor: "primary", textAlign: "center" }}>
      <span>
        <IconButton onClick={() => onClose()}>
          <CloseIcon sx={{ color: "white" }} />
        </IconButton>
      </span>
      <span>{title}</span>
    </DialogTitle>
    {children}
    <Box sx={{ flexGrow: 1 }}>
      {loading ? (
        <LinearProgress variant="query" />
      ) : (
        <LinearProgress variant="determinate" value={0} />
      )}
    </Box>
  </>
);
