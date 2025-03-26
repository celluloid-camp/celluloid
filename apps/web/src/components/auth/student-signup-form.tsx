"use client";
import { LoadingButton } from "@mui/lab";
import { Box, Button, DialogActions, DialogContent } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authClient } from "@/lib/auth-client";

import { isTRPCClientError, trpc } from "@/lib/trpc/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function StudentSignupForm() {
  const t = useTranslations();
  const router = useRouter();

  // const utils = trpc.useContext();
  const mutation = trpc.user.joinProject.useMutation();

  const validationSchema = Yup.object().shape({
    shareCode: Yup.string().required(),
    username: Yup.string().min(4).required(),
    password: Yup.string().min(8).required(),
  });

  const handleSignin = () => {
    router.push("/login");
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      shareCode: "",
      error: null,
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        formik.setSubmitting(true);
        const { error } = await authClient.signUpAsStudent({
          username: values.username,
          password: values.password,
        });

        if (error) {
          if (error.code === "USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER") {
            formik.setFieldError("username", t("join.error.username-taken"));
          }
          return;
        }
        const { projectId } = await mutation.mutateAsync({
          shareCode: values.shareCode,
        });

        if (projectId) {
          router.push(`/project/${projectId}`);
        } else {
          router.push("/");
        }
        formik.setStatus("submited");
        // utils.user.me.invalidate();
      } catch (e) {
        if (isTRPCClientError(e)) {
          // `cause` is now typed as your router's `TRPCClientError`
          if (e.message === "PROJECT_OWNER_CANNOT_JOIN") {
            // `cause` is now typed as your router's `TRPCClientError`
            formik.setFieldError(
              "shareCode",
              t("join.error.project-owner-cannot-join")
            );
          } else if (e.message === "CODE_NOT_FOUND") {
            formik.setFieldError(
              "shareCode",
              t("join.error.project-not-found")
            );
            router.replace("/join");
          }
        } else {
          formik.setFieldError("error", t("join.error.project-not-found"));
        }
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent sx={{ mt: 0 }}>
        <TextField
          id="shareCode"
          name="shareCode"
          margin="dense"
          fullWidth={true}
          label={t("student-student-signup.shareCode.label")}
          required={true}
          value={formik.values.shareCode}
          placeholder={t("student-signup.shareCode.placeholder")}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.shareCode && Boolean(formik.errors.shareCode)}
          helperText={formik.touched.shareCode && formik.errors.shareCode}
          inputProps={{
            "data-testid": "shareCode",
          }}
        />

        <TextField
          id="username"
          name="username"
          margin="dense"
          fullWidth={true}
          label={t("student-student-signup.username.label")}
          required={true}
          value={formik.values.username}
          placeholder={t("student-student-signup.username.paceholder")}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
          inputProps={{
            "data-testid": "username",
          }}
        />

        <TextField
          id="password"
          name="password"
          margin="dense"
          type="password"
          fullWidth={true}
          label={t("student-signup.password.label")}
          required={true}
          value={formik.values.password}
          placeholder={t("student-signup.password.placeholder")}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          inputProps={{
            "data-testid": "password",
          }}
        />
      </DialogContent>
      <DialogActions sx={{ mx: 2, mt: 2 }}>
        <Box display="flex" justifyContent={"space-between"} flex={1}>
          <Box>
            <Button
              color="primary"
              onClick={handleSignin}
              data-testid="login-button"
              size="small"
              variant="outlined"
              sx={{ textTransform: "uppercase", color: "text.secondary" }}
            >
              {t("student-signup.login.button")}
            </Button>
          </Box>

          <LoadingButton
            variant="contained"
            color="primary"
            type="submit"
            data-testid="submit-button"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            {t("student-signup.button.submit")}
          </LoadingButton>
        </Box>
      </DialogActions>
    </form>
  );
}
