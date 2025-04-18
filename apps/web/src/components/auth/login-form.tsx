"use client";

import { LoadingButton } from "@mui/lab";
import {
	Box,
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/lib/trpc/client";
import { signIn } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PasswordInput } from "../common/password-input";
import { StyledDialogTitle } from "../common/styled-dialog";
import Link from "next/link";
export function LoginForm() {
	const t = useTranslations();
	const router = useRouter();
	const utils = trpc.useUtils();

	const loginSchema = z.object({
		username: z.string().min(1, t("signin.usernameRequired")),
		password: z.string().min(1, t("signin.passwordRequired")),
	});

	type LoginFormData = z.infer<typeof loginSchema>;

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const handlePasswordReset = () => {
		router.replace("/forgot");
	};

	const handleSignup = () => {
		router.replace("/signup");
	};

	const onSubmit = async (values: LoginFormData) => {
		const isEmail = values.username.includes("@");
		let loginResult: {
			data: Record<string, any> | null;
			error: Record<string, any> | null;
		} = {
			data: null,
			error: null,
		};
		if (isEmail) {
			loginResult = await signIn.email({
				email: values.username,
				password: values.password,
			});
		} else {
			loginResult = await signIn.username({
				username: values.username,
				password: values.password,
			});
		}
		const { error } = loginResult;

		if (error?.code === "EMAIL_NOT_VERIFIED") {
			await authClient.emailOtp.sendVerificationOtp({
				email: values.username,
				type: "sign-in",
			});

			router.replace(`/otp?email=${values.username}`);
			return;
		}
		if (
			error?.code === "INVALID_USERNAME_OR_PASSWORD" ||
			error?.code === "INVALID_EMAIL_OR_PASSWORD"
		) {
			setError("root", { message: t("signin.error.user-not-found") });
			return;
		}
		router.back();
	};

	return (
		<>
			<StyledDialogTitle
				loading={isSubmitting}
				error={errors.root?.message}
				onClose={() => router.back()}
			>
				{t("signin.title")}
			</StyledDialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent sx={{ margin: 1, padding: 2, width: 400 }}>
					<TextField
						{...register("username")}
						margin="dense"
						fullWidth={true}
						label={t("signin.login")}
						placeholder={t("signin.login")}
						disabled={isSubmitting}
						slotProps={{
							htmlInput: {
								"data-testid": "username",
							},
						}}
						error={!!errors.username}
						helperText={errors.username?.message}
					/>
					<PasswordInput
						{...register("password")}
						margin="dense"
						fullWidth={true}
						label={t("signin.password")}
						placeholder={t("signin.password")}
						disabled={isSubmitting}
						slotProps={{
							htmlInput: {
								"data-testid": "password",
							},
						}}
						error={!!errors.password}
						helperText={errors.password?.message}
					/>
					<Box display={"flex"} flex={1} justifyContent={"flex-end"}>
						<Button
							onClick={handlePasswordReset}
							data-testid="forgot-button"
							size="small"
							sx={{ textTransform: "uppercase", color: "text.secondary" }}
						>
							{t("signin.forgotPasswordAction")}
						</Button>
					</Box>
				</DialogContent>
				<Divider />
				<DialogActions sx={{ marginY: 1, marginX: 2 }}>
					<Box display="flex" justifyContent={"space-between"} flex={1}>
						<Box>
							<Button
								color="primary"
								data-testid="signup"
								variant="outlined"
								onClick={handleSignup}
								size="small"
								sx={{ textTransform: "uppercase", color: "text.secondary" }}
							>
								{t("signin.signupAction")}
							</Button>
						</Box>

						<LoadingButton
							variant="contained"
							size="small"
							color="primary"
							type="submit"
							data-testid="submit"
							loading={isSubmitting}
							disabled={isSubmitting}
							sx={{ textTransform: "uppercase" }}
						>
							{t("signin.loginAction")}
						</LoadingButton>
					</Box>
				</DialogActions>
			</form>
		</>
	);
}
