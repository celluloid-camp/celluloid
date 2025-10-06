"use client";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { OtpForm } from "@/components/auth/otp-form";
import { StyledDialog } from "@/components/common/styled-dialog";

export default function OtpPage() {
  const router = useRouter();
  return (
    <StyledDialog onClose={() => router.back()} open={true}>
      <OtpForm />
    </StyledDialog>
  );
}
