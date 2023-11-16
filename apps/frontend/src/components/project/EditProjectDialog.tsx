import DeleteIcon from "@mui/icons-material/Delete";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  DialogActions,
  Grid,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useConfirm } from "material-ui-confirm";
import { useSnackbar } from "notistack";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router";
import * as Yup from "yup";

import { AutoCompleteTags } from "~components/AutoComleteTags";
import { StyledDialog } from "~components/Dialog";
import { ERR_ALREADY_EXISTING_PROJECT } from "~utils/Constants";
import { humanizeError } from "~utils/errors";
import { ProjectById, trpc } from "~utils/trpc";

type EditProjectDialogProps = {
  open: boolean;
  project: ProjectById;
  onClose: () => void;
};

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  open,
  project,
  onClose,
}) => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const utils = trpc.useUtils();

  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = () => {
    // deleteMutation.mutate({
    //   projectId: project.id,
    // });
  };

  const confirmDelete = () => {
    confirm({
      title: t("project.confirm-delete.title", "Delete project"),
      description: t("project.confirm-delete.description", "Are you sure ?"),
      confirmationText: t("deleteAction"),
      cancellationText: t("cancelAction"),
      confirmationButtonProps: {
        variant: "contained",
        color: "error",
      },
    }).then(() => {
      // handleDelete();
    });
  };

  const mutation = trpc.project.update.useMutation({
    onSuccess: () => {
      utils.project.byId.invalidate({ id: project.id });
      enqueueSnackbar(t("project.edit.success", "Project a été mise à jour"), {
        variant: "success",
        key: "project.edit.success",
      });
    },
    onError: (e) => {
      console.log(e);
      enqueueSnackbar(
        t("project.edit.error", "Project n'a pas été mise à jour"),
        { variant: "error", key: "project.edit.error" }
      );
    },
  });

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .min(5, "Le titre doit comporter au moins 5 caractères.")
      .required("Le titre est requis."),
    description: Yup.string().required("La description est requise."),
    keywords: Yup.array().of(Yup.string()),
    public: Yup.bool(),
    collaborative: Yup.bool(),
  });

  const formik = useFormik({
    initialValues: {
      title: project.title,
      description: project.description,
      public: project.public,
      collaborative: project.collaborative,
      shared: project.shared,
      keywords: [],
      error: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const project = await mutation.mutateAsync({
          title: values.title,
          description: values.description,
          public: values.public,
          collaborative: values.collaborative,
          shared: values.shared,
        });
        if (project) {
          formik.resetForm();
          onClose();
        }
      } catch (e) {
        if (e.message == ERR_ALREADY_EXISTING_PROJECT) {
          formik.setFieldError(
            "title",
            humanizeError("ERR_ALREADY_EXISTING_PROJECT")
          );
        } else {
          formik.setFieldError("title", humanizeError("ERR_UNKOWN"));
        }
      }
    },
  });

  return (
    <StyledDialog
      title={t("edit-project-dialog.title", "Modifer le projet")}
      onClose={onClose}
      error={formik.errors.error}
      maxWidth="md"
      open={open}
      loading={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <TextField
          id="title"
          name="title"
          label={t("project.title")}
          fullWidth
          autoFocus
          autoComplete="none"
          spellCheck={false}
          margin="normal"
          inputProps={{
            "data-testid": "title",
          }}
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
          disabled={formik.isSubmitting}
        />
        <TextField
          id="description"
          name="description"
          label={t("project.description")}
          multiline
          rows={3}
          fullWidth
          autoComplete="none"
          inputProps={{
            "data-testid": "description",
          }}
          spellCheck={false}
          margin="normal"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.description && Boolean(formik.errors.description)
          }
          helperText={formik.touched.description && formik.errors.description}
          disabled={formik.isSubmitting}
        />
        <AutoCompleteTags
          id="keywords"
          options={[""]}
          onChange={(_event, newValue) => {
            formik.setFieldValue("keywords", newValue);
          }}
          disabled={formik.isSubmitting}
          value={formik.values.keywords}
          textFieldProps={{
            margin: "normal",
            inputProps: {
              "data-testid": "keywords",
            },
            label: t("project.keywords"),
          }}
          limitTags={10}
        />

        <Typography
          variant="h6"
          sx={{
            paddingTop: 4,
          }}
          gutterBottom={true}
        >
          <Trans i18nKey="project.visibilitySection" />
        </Typography>
        <Grid container={true} direction="row" alignItems="flex-start">
          <Grid item={true} xs={2}>
            <Typography
              variant="subtitle1"
              align="right"
              sx={{
                paddingTop: 1,
              }}
            >
              <Trans i18nKey="project.public" />
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Switch
              data-testid="public-switch"
              checked={formik.values.public}
              onChange={(_, value) => {
                formik.setFieldValue("public", value);
              }}
            />
          </Grid>
          <Grid item xs={8}>
            <Typography
              gutterBottom
              variant="body2"
              sx={{
                paddingTop: 1,
              }}
            >
              <Trans i18nKey="project.publicHelper" />
            </Typography>
          </Grid>
        </Grid>

        <Grid container direction="row">
          <Grid item xs={2}>
            <Typography
              variant="subtitle1"
              align="right"
              sx={{
                paddingTop: 1,
              }}
            >
              <Trans i18nKey="project.collaborative" />
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Switch
              checked={formik.values.collaborative}
              data-testid="collaborative-switch"
              onChange={(_, value) => {
                formik.setFieldValue("collaborative", value);
              }}
            />
          </Grid>
          <Grid item xs={8}>
            <Typography
              variant="body2"
              gutterBottom
              sx={{
                paddingTop: 1,
              }}
            >
              <Trans i18nKey="project.collaborativeHelper" />
            </Typography>
          </Grid>
        </Grid>

        <Grid container direction="row">
          <Grid item xs={2}>
            <Typography
              variant="subtitle1"
              align="right"
              sx={{
                paddingTop: 1,
              }}
            >
              <Trans i18nKey="project.share" />
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Switch
              checked={formik.values.shared}
              data-testid="shared-switch"
              onChange={(_, value) => {
                formik.setFieldValue("shared", value);
              }}
            />
          </Grid>
          <Grid item xs={8}>
            <Typography
              variant="body2"
              gutterBottom
              sx={{
                paddingTop: 1,
              }}
            >
              <Trans i18nKey="project.collaborativeHelper" />
            </Typography>
          </Grid>
        </Grid>

        <DialogActions>
          <LoadingButton
            variant="contained"
            data-testid="submit"
            size="large"
            color="primary"
            type="submit"
            loading={mutation.isLoading}
            disabled={mutation.isLoading}
          >
            <Trans i18nKey="project.editAction">Modifier le projet</Trans>
          </LoadingButton>

          {project.deletable && (
            <LoadingButton
              variant="contained"
              color="error"
              size="small"
              fullWidth={true}
              // loading={deleteLoading}
              onClick={confirmDelete}
            >
              <DeleteIcon fontSize="inherit" sx={{ marginRight: 2 }} />
              {t("deleteAction")}
            </LoadingButton>
          )}
        </DialogActions>
      </form>
    </StyledDialog>
  );
};
