"use client";
import { StyledDialog } from "@/components/common/styled-dialog";
import { LoginForm } from "@/components/auth/login-form";
import { useRouter } from "next/navigation";
import { OtpForm } from "@/components/auth/otp-form";

export default function OtpPage() {
	const router = useRouter();
	return (
		<StyledDialog onClose={() => router.back()} open={true}>
			<OtpForm />
		</StyledDialog>
	);
}
