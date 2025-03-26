"use client";

import { StyledDialog } from "@/components/common/styled-dialog";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { OtpForm } from "@/components/auth/otp-form";

export default async function OTPDialog({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const t = useTranslations();
  const router = useRouter();

  return (
    <StyledDialog
      title={t("signin.title")}
      onClose={() => router.back()}
      open={true}
    >
      <OtpForm email={email} />
    </StyledDialog>
  );
}
