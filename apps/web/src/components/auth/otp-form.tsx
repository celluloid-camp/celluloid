"use client";
import { LoadingButton } from "@mui/lab";
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import * as Yup from "yup";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { StyledDialogTitle } from "../common/styled-dialog";

export function OtpForm() {
	const t = useTranslations();
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const searchParams = useSearchParams();
	const email = searchParams.get("email") as string;

	const validationSchema = Yup.object().shape({
		email: Yup.string(),
		code: Yup.string()
			.min(4, t("recover.code.short"))
			.required(t("recover.code.required")),
	});

	const handleResendCode = async () => {
		if (email) {
			await authClient.emailOtp.sendVerificationOtp({
				email: email,
				type: "sign-in",
			});

			enqueueSnackbar(t("confirm.resend.success"), {
				variant: "success",
			});
		}
	};

	const formik = useFormik({
		initialValues: {
			email: email ?? "",
			code: "",
			error: null,
		},
		validateOnMount: false,
		validationSchema: validationSchema,
		validateOnBlur: true,
		validateOnChange: true,
		onSubmit: async (values) => {
			formik.setSubmitting(true);

			try {
				const { error } = await authClient.signIn.emailOtp({
					email: values.email,
					otp: values.code,
				});

				if (error?.code === "INVALID_OTP") {
					formik.setFieldError("error", t("otp.form.invalid-code"));
					formik.setSubmitting(false);
					return;
				}
				enqueueSnackbar(t("otp.form.success"), {
					variant: "success",
				});
				router.back();
			} catch (e) {
				formik.setFieldError(
					"error",
					e instanceof Error ? e.message : "An unknown error occurred",
				);
				console.log(e);
			} finally {
				formik.setSubmitting(false);
			}
		},
	});

	return (
		<>
			<StyledDialogTitle
				loading={formik.isSubmitting}
				error={formik.errors.error}
				onClose={() => router.back()}
			>
				{t("otp.form.title")}
			</StyledDialogTitle>
			<Typography variant="body1" sx={{ padding: 3, color: "gray" }}>
				{t("otp.form.description")}
			</Typography>
			<form onSubmit={formik.handleSubmit}>
				<DialogContent sx={{ margin: 1, padding: 2, width: 400 }}>
					<TextField
						id="email"
						name="email"
						margin="dense"
						fullWidth={true}
						label={t("confirm.username.label")}
						value={formik.values.email}
						disabled={true}
						slotProps={{
							htmlInput: {
								"data-testid": "email",
							},
						}}
						placeholder={t("confirm.username.placeholder") || ""}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.email && Boolean(formik.errors.email)}
						helperText={formik.touched.email && formik.errors.email}
					/>
					<TextField
						id="code"
						name="code"
						margin="dense"
						fullWidth={true}
						label={t("confirm.code.label")}
						value={formik.values.code}
						slotProps={{
							htmlInput: {
								"data-testid": "code",
							},
						}}
						placeholder={t("confirm.code.placeholder") || ""}
						onChange={formik.handleChange}
						disabled={formik.isSubmitting}
						onBlur={formik.handleBlur}
						error={formik.touched.code && Boolean(formik.errors.code)}
						helperText={formik.touched.code && formik.errors.code}
					/>
				</DialogContent>
				<Divider />
				<DialogActions sx={{ marginY: 1, marginX: 2 }}>
					<Button
						variant="text"
						disabled={formik.isSubmitting}
						onClick={handleResendCode}
					>
						{t("confirm.button.resend")}
					</Button>
					<LoadingButton
						variant="contained"
						size="large"
						color="primary"
						type="submit"
						data-testid="submit"
						loading={formik.isSubmitting}
						disabled={formik.isSubmitting}
					>
						{t("confirm.button.submit")}
					</LoadingButton>
				</DialogActions>
			</form>
		</>
	);
}
