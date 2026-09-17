import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PasswordInput } from "@/components/common/password-input";
import { changePassword } from "@/lib/auth-client";
import SettingsTabPanel from "./settings-tab-panel";

export default function SecurityTabForm({
  value,
  index,
}: {
  value: number;
  index: number;
}) {
  const t = useTranslations();
  const { enqueueSnackbar } = useSnackbar();

  const securitySchema = z
    .object({
      oldPassword: z.string().min(1, t("profile.security.password-required")),
      newPassword: z
        .string()
        .min(8, t("profile.security.password-min-length"))
        .min(1, t("profile.security.password-required")),
      passwordConfirmation: z
        .string()
        .min(1, t("profile.security.password-required")),
    })
    .refine((data) => data.passwordConfirmation === data.newPassword, {
      path: ["passwordConfirmation"],
      message: t("password.unmatch"),
    });

  type SecurityFormValues = z.infer<typeof securitySchema>;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      passwordConfirmation: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: SecurityFormValues) => {
    try {
      const { error } = await changePassword({
        newPassword: values.newPassword,
        currentPassword: values.oldPassword,
      });

      if (error && error.code === "INVALID_PASSWORD") {
        setError("oldPassword", {
          type: "server",
          message: t("profile.security.password-incorrect"),
        });
        return;
      }

      if (error) {
        setError("root.serverError", {
          type: "server",
          message: error.message ?? t("errors.UNKNOWN"),
        });
        return;
      }

      enqueueSnackbar(t("profile.security.change-password.success"), {
        variant: "success",
        key: "user.update.password.success",
      });
      reset();
    } catch (e) {
      setError("root.serverError", {
        type: "server",
        message: e instanceof Error ? e.message : t("errors.UNKNOWN"),
      });
    }
  };

  return (
    <SettingsTabPanel value={value} index={index}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h5">
          {t("profile.security.change-password.title")}
        </Typography>

        {errors.root?.serverError?.message ? (
          <Alert severity="error" sx={{ borderRadius: 0, mt: 0 }}>
            {errors.root.serverError.message}
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
          <PasswordInput
            variant="outlined"
            fullWidth
            margin="normal"
            id="oldPassword"
            {...register("oldPassword")}
            placeholder={t("profile.security.old-password.label")}
            disabled={isSubmitting}
            error={Boolean(errors.oldPassword)}
            helperText={errors.oldPassword?.message}
            label={t("profile.security.old-password.label")}
          />
          <PasswordInput
            variant="outlined"
            fullWidth
            margin="normal"
            id="newPassword"
            {...register("newPassword")}
            placeholder={t("profile.security.new-password.label")}
            disabled={isSubmitting}
            error={Boolean(errors.newPassword)}
            helperText={errors.newPassword?.message}
            label={t("profile.security.new-password.label")}
          />
          <PasswordInput
            variant="outlined"
            fullWidth
            margin="normal"
            id="passwordConfirmation"
            {...register("passwordConfirmation")}
            placeholder={t("profile.security.confirmation-password.label")}
            disabled={isSubmitting}
            error={Boolean(errors.passwordConfirmation)}
            helperText={errors.passwordConfirmation?.message}
            label={t("profile.security.confirmation-password.label")}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          data-testid="submit"
          loading={isSubmitting}
        >
          {t("profile.security.change-password.button")}
        </Button>
      </form>
    </SettingsTabPanel>
  );
}
