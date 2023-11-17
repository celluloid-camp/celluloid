import { LoadingButton } from "@mui/lab";
import { Alert, Box, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { Trans, useTranslation } from "react-i18next";
import * as Yup from "yup";

import { isTRPCClientError, trpc } from "~utils/trpc";

import SettingsTabPanel from "./SettingsTabPanel";
import UploadAvatar from "./UploadAvatar";

export default function EditProfileTabForm({
  value,
  index,
}: {
  value: number;
  index: number;
}) {
  const utils = trpc.useUtils();

  const { t } = useTranslation();
  const mutation = trpc.user.update.useMutation();
  const { enqueueSnackbar } = useSnackbar();

  const [user] = trpc.user.me.useSuspenseQuery();

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(),
    firstname: Yup.string().nullable(),
    lastname: Yup.string().nullable(),
    bio: Yup.string().nullable(),
    avatarStorageId: Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      username: user?.username,
      firstname: user?.firstname,
      lastname: user?.lastname,
      bio: user?.bio,
      avatarStorageId: user?.avatar?.id,
      error: null,
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        await mutation.mutateAsync({
          username: values.username,
          firstname: values.firstname,
          lastname: values.lastname,
          bio: values.bio,
          avatarStorageId: values.avatarStorageId,
        });

        utils.user.me.invalidate();
        enqueueSnackbar(t("user.update.success"), {
          variant: "success",
          key: "user.update.success",
        });
      } catch (e) {
        if (isTRPCClientError(e)) {
          console.log(e.message);
          formik.setFieldError(
            "error",
            t(
              "profile.update.username-already-used",
              "Nom d'utilisateur déjà utilisé"
            )
          );
        } else {
          formik.setFieldError("error", e.message);
        }
      }
    },
  });

  return (
    <SettingsTabPanel value={value} index={index}>
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h5">
          <Trans i18nKey="profile.update.title">Modifier le profil</Trans>
        </Typography>

        {formik.errors.error ? (
          <Alert severity="error" sx={{ borderRadius: 0, mt: 0 }}>
            {formik.errors.error}
          </Alert>
        ) : null}
        <Box
          sx={{
            width: "50%",
            justifyContent: "flex-start",
            alignContent: "flex-start",
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "column",
            py: 2,
          }}
        >
          <UploadAvatar
            color={user?.color}
            initial={user?.initial}
            url={user?.avatar?.publicUrl}
            onChance={(id) => {
              formik.setFieldValue("avatarStorageId", id);
            }}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={user?.email}
            disabled
          />
          <TextField
            id="username"
            name="username"
            value={formik.values.username}
            placeholder={t("profile.update.username") || ""}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            inputProps={{
              "data-testid": "username",
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            label={t("profile.update.username")}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            id="firstname"
            name="firstname"
            value={formik.values.firstname}
            placeholder={t("profile.update.firstname") || ""}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            inputProps={{
              "data-testid": "firstname",
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.firstname && Boolean(formik.errors.firstname)}
            helperText={formik.touched.firstname && formik.errors.firstname}
            label={t("profile.update.firstname")}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            id="lastname"
            name="lastname"
            value={formik.values.lastname}
            placeholder={t("profile.update.lastname") || ""}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            inputProps={{
              "data-testid": "lastname",
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.lastname && Boolean(formik.errors.lastname)}
            helperText={formik.touched.lastname && formik.errors.lastname}
            label={t("profile.update.lastname")}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            id="bio"
            name="bio"
            value={formik.values.bio}
            placeholder={t("profile.update.bio") || ""}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            inputProps={{
              "data-testid": "bio",
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.bio && Boolean(formik.errors.bio)}
            helperText={formik.touched.bio && formik.errors.bio}
            label={t("profile.update.bio")}
            fullWidth
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
        </Box>

        <LoadingButton
          variant="contained"
          size="small"
          color="primary"
          type="submit"
          data-testid="submit"
          loading={mutation.isLoading}
          disabled={mutation.isLoading}
          sx={{ textTransform: "uppercase" }}
        >
          <Trans i18nKey={"profile.update.submit"}>Enregistrer</Trans>
        </LoadingButton>
      </form>
    </SettingsTabPanel>
  );
}
