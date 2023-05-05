import CloseIcon from "@mui/icons-material/Close";
import {
  DialogTitle,
  DialogTitleProps,
  IconButton,
  LinearProgress,
} from "@mui/material";
import * as React from "react";

export type BootstrapDialogTitleProps = DialogTitleProps & {
  loading?: boolean;
  onClose: () => void;
};

const BootstrapDialogTitle: React.FC<BootstrapDialogTitleProps> = ({
  children,
  onClose,
  loading,
  ...other
}) => {
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
};

export default BootstrapDialogTitle;
