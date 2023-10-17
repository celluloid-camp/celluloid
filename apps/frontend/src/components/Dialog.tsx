import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  DialogTitle,
  DialogTitleProps,
  IconButton,
  LinearProgress,
  styled,
  Typography,
} from "@mui/material";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(0),
  },
}));

type StyledDialogProps = DialogProps & {
  loading: boolean;
  title: string;
  error?: string | undefined;
  onClose: () => void;
};

type BootstrapDialogTitleProps = DialogTitleProps & {
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
      <BootstrapDialogTitle loading={loading} onClose={onClose}>
        {title}
      </BootstrapDialogTitle>
      {error ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            paddingTop: 1,
            paddingBottom: 2,
            justifyContent: "left",
          }}
        >
          <Typography align={"left"} color="error" variant={"caption"}>
            {error}
          </Typography>
        </Box>
      ) : null}

      <DialogContent sx={{ margin: 1, padding: 2 }}>{children}</DialogContent>
    </BootstrapDialog>
  );
};
