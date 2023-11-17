import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  Switch,
  Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useConfirm } from "material-ui-confirm";
import { useSnackbar } from "notistack";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import * as Yup from "yup";

import { AutoCompleteTags } from "~components/AutoComleteTags";
import { StyledDialog } from "~components/Dialog";
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
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
      navigate("/");
    },
    onError: (e) => {
      console.log(e);
      enqueueSnackbar(
        t("project.delete.error", "Project n'a pas pu être supprimé", {
          variant: "error",
          key: "project.delete.error",
        })
      );
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({
      projectId: project.id,
    });
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
      handleDelete();
    });
  };

  const mutation = trpc.project.update.useMutation({
    onSuccess: () => {
      utils.project.byId.invalidate({ id: project.id });
      enqueueSnackbar(t("project.edit.success"), {
        variant: "success",
        key: "project.edit.success",
      });
    },
    onError: (e) => {
      console.log(e);
      enqueueSnackbar(t("project.edit.error"), {
        variant: "error",
        key: "project.edit.error",
      });
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
      keywords: project.keywords,
      error: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await mutation.mutateAsync({
          projectId: project.id,
          title: values.title,
          description: values.description,
          public: values.public,
          collaborative: values.collaborative,
          shared: values.shared,
          keywords: values.keywords,
        });
        formik.resetForm();
        onClose();
      } catch (e) {
        formik.setFieldError("title", humanizeError("ERR_UNKOWN"));
      }
    },
  });

  return (
    <StyledDialog
      title={t("project.edit.dialog.title")}
      onClose={onClose}
      error={formik.errors.error}
      maxWidth="md"
      open={open}
      loading={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ flexGrow: 1 }}>
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
              pt: 1,
            }}
            gutterBottom={true}
          >
            {t("project.visibilitySection")}
          </Typography>

          <Box sx={{ maxWidth: "50%", ml: 2, pt: 2 }}>
            <FormGroup sx={{ mb: 1 }}>
              <FormControlLabel
                sx={{ fontSize: 10 }}
                control={
                  <Switch
                    checked={formik.values.public}
                    size="small"
                    data-testid="collaborative-switch"
                    onChange={(_, value) => {
                      formik.setFieldValue("public", value);
                    }}
                  />
                }
                label={t("project.public")}
              />
              <FormHelperText>{t("project.publicHelper")}</FormHelperText>
            </FormGroup>

            <FormGroup sx={{ mb: 1 }}>
              <FormControlLabel
                sx={{ fontSize: 10 }}
                control={
                  <Switch
                    checked={formik.values.collaborative}
                    size="small"
                    data-testid="collaborative-switch"
                    onChange={(_, value) => {
                      formik.setFieldValue("collaborative", value);
                    }}
                  />
                }
                label={t("project.collaborative")}
              />
              <FormHelperText>
                {t("project.collaborativeHelper")}
              </FormHelperText>
            </FormGroup>

            <FormGroup sx={{ mb: 1 }}>
              <FormControlLabel
                sx={{ fontSize: 10 }}
                control={
                  <Switch
                    checked={formik.values.shared}
                    size="small"
                    data-testid="shared-switch"
                    onChange={(_, value) => {
                      formik.setFieldValue("shared", value);
                    }}
                  />
                }
                label={t("project.shared")}
              />
              <FormHelperText>{t("project.shareHelper")}</FormHelperText>
            </FormGroup>
          </Box>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={4}>
              {project.deletable && (
                <LoadingButton
                  variant="outlined"
                  color="error"
                  size="medium"
                  disabled={mutation.isLoading}
                  onClick={confirmDelete}
                  startIcon={<DeleteIcon />}
                >
                  {t("project.edit.delete.button")}
                </LoadingButton>
              )}
            </Grid>

            <Grid item xs={8} display={"flex"} justifyContent={"flex-end"}>
              <LoadingButton
                variant="contained"
                size="medium"
                data-testid="submit"
                color="primary"
                type="submit"
                loading={mutation.isLoading}
                startIcon={<EditIcon />}
                disabled={mutation.isLoading}
              >
                {t("project.edit.submit.button")}
              </LoadingButton>
            </Grid>
          </Grid>
        </Box>
      </form>
    </StyledDialog>
  );
};
