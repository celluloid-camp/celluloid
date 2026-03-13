"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Divider,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useMutation } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import { PasswordInput } from "../common/password-input";
import { StyledDialogTitle } from "../common/styled-dialog";

export function StudentSignupForm() {
  const t = useTranslations();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [shareCodeQuery] = useQueryState("code");

  const api = useTRPC();

  // const utils = trpc.useContext();
  const mutation = useMutation(api.user.joinProject.mutationOptions());

  const signupSchema = z.object({
    shareCode: z.string().min(1, t("student-signup.sharecode-required")),
    username: z.string().min(1, t("student-signup.username-required")),
    password: z.string().min(8, t("student-signup.password-length-validation")),
  });
  type SignupFormValues = z.infer<typeof signupSchema>;

  const handleSignin = () => {
    router.push("/login");
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      shareCode: shareCodeQuery ?? "",
    },
  });

  useEffect(() => {
    if (shareCodeQuery) {
      reset((values) => ({ ...values, shareCode: shareCodeQuery }));
    }
  }, [shareCodeQuery, reset]);

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const { error } = await authClient.signUpAsStudent({
        username: values.username,
        password: values.password,
      });

      if (error) {
        if (error.code === "USERNAME_IS_ALREADY_TAKEN") {
          setError("username", { message: t("join.error.username-taken") });
        } else {
          setError("root", { message: t("errors.UNKNOWN") });
        }
        return;
      }

      const { projectId } = await mutation.mutateAsync({
        shareCode: values.shareCode,
      });

      if (projectId) {
        router.push(`/project/${projectId}`);
        enqueueSnackbar(t("join.message.success"), {
          variant: "success",
        });
      } else {
        router.push("/");
      }
    } catch (e) {
      if (e instanceof TRPCClientError) {
        if (e.message === "PROJECT_OWNER_CANNOT_JOIN") {
          setError("shareCode", {
            message: t("join.error.project-owner-cannot-join"),
          });
        } else if (e.message === "CODE_NOT_FOUND") {
          setError("shareCode", {
            message: t("join.error.project-not-found"),
          });
          router.replace("/join");
        }
      } else {
        setError("root", { message: t("join.error.project-not-found") });
      }
    }
  };

  return (
    <>
      <StyledDialogTitle
        loading={isSubmitting}
        error={errors.root?.message}
        onClose={() => router.back()}
      >
        {t("student-signup.title")}
      </StyledDialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ margin: 1, padding: 2, width: 400 }}>
          <TextField
            id="shareCode"
            margin="dense"
            fullWidth={true}
            label={t("student-student-signup.shareCode.label")}
            placeholder={t("student-signup.shareCode.placeholder")}
            disabled={isSubmitting}
            error={Boolean(errors.shareCode)}
            helperText={errors.shareCode?.message}
            {...register("shareCode")}
            inputProps={{
              "data-testid": "shareCode",
            }}
          />

          <TextField
            id="username"
            margin="dense"
            fullWidth={true}
            label={t("student-student-signup.username.label")}
            required={true}
            placeholder={t("student-student-signup.username.paceholder")}
            disabled={isSubmitting}
            error={Boolean(errors.username)}
            helperText={errors.username?.message}
            {...register("username")}
            inputProps={{
              "data-testid": "username",
            }}
          />

          <PasswordInput
            id="password"
            margin="dense"
            fullWidth={true}
            label={t("student-signup.password.label")}
            required={true}
            placeholder={t("student-signup.password.placeholder")}
            disabled={isSubmitting}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register("password")}
            inputProps={{
              "data-testid": "password",
            }}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ mx: 2, my: 2 }}>
          <Box display="flex" justifyContent={"space-between"} flex={1}>
            <Box>
              <Button
                color="primary"
                onClick={handleSignin}
                data-testid="login-button"
                disabled={isSubmitting}
                size="small"
                variant="outlined"
                sx={{ textTransform: "uppercase", color: "text.secondary" }}
              >
                {t("student-signup.login.button")}
              </Button>
            </Box>

            <Button
              variant="contained"
              color="primary"
              type="submit"
              data-testid="submit-button"
              loading={isSubmitting}
            >
              {t("student-signup.button.submit")}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </>
  );
}
