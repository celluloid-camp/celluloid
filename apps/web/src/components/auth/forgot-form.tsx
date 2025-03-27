"use client";

import { LoadingButton } from "@mui/lab";
import { Box, DialogActions, DialogContent, Divider } from "@mui/material";
import TextField from "@mui/material/TextField";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { StyledDialogTitle } from "../common/styled-dialog";

export function ForgotForm() {
  const t = useTranslations();
  const router = useRouter();

  const forgotSchema = z.object({
    email: z.string().min(1, t("forgot.email.required")),
  });

  type ForgotFormData = z.infer<typeof forgotSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const handleRecover = (email?: string) => {
    router.replace(`/recover?email=${email}`);
  };

  const onSubmit = async (values: ForgotFormData) => {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: values.email,
      type: "forget-password",
    });

    if (error) {
      setError("root", { message: error.message });
      return;
    }

    handleRecover(values.email);
  };

  return (
    <>
      <StyledDialogTitle loading={isSubmitting} error={errors.root?.message}>
        {t("forgot.title")}
      </StyledDialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ margin: 1, padding: 2, width: 400 }}>
          <TextField
            {...register("email")}
            margin="dense"
            fullWidth={true}
            required={true}
            placeholder={t("forgot.email.placeholder")}
            disabled={isSubmitting}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ marginY: 1, marginX: 2 }}>
          <Box display="flex" justifyContent={"flex-end"} flex={1}>
            <LoadingButton
              variant="contained"
              size="small"
              color="primary"
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {t("forgot.button.submit")}
            </LoadingButton>
          </Box>
        </DialogActions>
      </form>
    </>
  );
}
