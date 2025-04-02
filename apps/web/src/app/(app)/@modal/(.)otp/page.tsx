"use client";

import { StyledDialog } from "@/components/common/styled-dialog";
import { useRouter } from "next/navigation";
import { OtpForm } from "@/components/auth/otp-form";

export default async function OTPDialog({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const router = useRouter();

  return (
    <StyledDialog onClose={() => router.back()} open={true}>
      <OtpForm email={email} onClose={() => router.back()} />
    </StyledDialog>
  );
}
