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

const CustomDialogTitle: React.FC<Props> = ({
  onClose,
  title,
  loading,
  children,
}) => (
  <>
    <DialogTitle sx={{ backgroundColor: "primary", textAlign: "left" }}>
      <span>
        <IconButton onClick={() => onClose()}>
          <CloseIcon sx={{ color: "white" }} />
        </IconButton>
      </span>
      <span>{title}</span>
    </DialogTitle>
    {children}
    <Box sx={{ flexGrow: 1 }}>
      <LinearProgress
        variant="query"
        sx={{ display: loading ? "block" : "none" }}
      />
    </Box>
  </>
);

export interface DialogTitleProps {
  children?: React.ReactNode;
  loading?: boolean;
  onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, loading, ...other } = props;

  return (
    <>
      <DialogTitle
        sx={{ m: 0, p: 2, borderBottom: 1, borderBottomColor: "neutral.200" }}
        {...other}
      >
        {children}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <LinearProgress
        variant="query"
        sx={{ visibility: loading ? "visible" : "hidden", flexGrow: 1 }}
      />
    </>
  );
}

export default BootstrapDialogTitle;
