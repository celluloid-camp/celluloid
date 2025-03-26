import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  DialogTitle,
  type DialogTitleProps,
  IconButton,
  LinearProgress,
  styled,
} from "@mui/material";
import Dialog, { type DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

export const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(0),
  },
}));

type StyledDialogProps = DialogProps & {
  loading?: boolean;
  title: string;
  error?: string | undefined;
  onClose: () => void;
};

type BootstrapDialogTitleProps = DialogTitleProps & {
  loading?: boolean;
  error?: string | undefined;
  onClose: () => void;
};

export const BootstrapDialogTitle: React.FC<BootstrapDialogTitleProps> = ({
  children,
  onClose,
  loading,
  error,
  ...other
}) => {
  return (
    <>
      <DialogTitle
        sx={{ m: 0, py: 2, borderBottom: 1, borderBottomColor: "neutral.100" }}
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
      {error ? (
        <Alert severity="error" sx={{ borderRadius: 0, mt: 0 }}>
          {error}
        </Alert>
      ) : null}
      {loading ? (
        <LinearProgress
          variant="query"
          sx={{ visibility: loading ? "visible" : "hidden", flexGrow: 1 }}
        />
      ) : null}
    </>
  );
};

export const StyledDialog: React.FC<StyledDialogProps> = ({
  loading,
  title,
  onClose,
  children,
  error,
  ...props
}) => {
  return (
    <BootstrapDialog
      scroll="body"
      maxWidth="xs"
      fullWidth={true}
      onClose={onClose}
      {...props}
    >
      <BootstrapDialogTitle loading={loading} error={error} onClose={onClose}>
        {title}
      </BootstrapDialogTitle>

      <DialogContent sx={{ margin: 1, padding: 2 }}>{children}</DialogContent>
    </BootstrapDialog>
  );
};
