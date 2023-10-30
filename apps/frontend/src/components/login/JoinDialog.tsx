import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  Stack,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import * as Yup from "yup";

import { StyledDialog } from "~components/Dialog";
import { isTRPCClientError, trpc } from "~utils/trpc";

export const JoinDialog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const utils = trpc.useContext();
  const mutation = trpc.user.join.useMutation();

  const validationSchema = Yup.object().shape({
    shareCode: Yup.string().required(),
  });

  const formik = useFormik({
    initialValues: {
      shareCode: "",
      error: null,
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        const data = await mutation.mutateAsync({
          shareCode: values.shareCode,
        });

        formik.setStatus("submited");
        utils.user.me.invalidate();

        if (data.projectId) {
          navigate(`/project/${data.projectId}`);
        } else {
          navigate("/");
        }
      } catch (e) {
        if (isTRPCClientError(e)) {
          // `cause` is now typed as your router's `TRPCClientError`
          formik.setFieldError(
            "error",
            t("join.error.project-not-found", "Code invalide")
          );
        }

        formik.setFieldError("error", e.message);
        console.log(e);
      }
    },
  });

  return (
    <StyledDialog
      title={t("join.title", "Rejoindre un projet")}
      onClose={() => navigate(-1)}
      error={formik.errors.error}
      open={true}
      loading={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <TextField
            id="shareCode"
            name="shareCode"
            margin="dense"
            fullWidth={true}
            label={t("join.shareCode.label", "Code du projet")}
            required={true}
            value={formik.values.shareCode}
            placeholder={
              t("join.shareCode.placeholder", "Code du projet") || ""
            }
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            onBlur={formik.handleBlur}
            error={formik.touched.shareCode && Boolean(formik.errors.shareCode)}
            helperText={formik.touched.shareCode && formik.errors.shareCode}
            inputProps={{
              "data-testid": "shareCode",
            }}
          />
        </DialogContent>
        <DialogActions>
          <LoadingButton
            variant="contained"
            color="primary"
            type="submit"
            data-testid="submit"
            loading={mutation.isLoading}
            disabled={mutation.isLoading}
          >
            <Trans i18nKey="join.button.submit">Rejoindre</Trans>
          </LoadingButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};
