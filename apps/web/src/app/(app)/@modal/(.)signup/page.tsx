"use client";

import { StyledDialog } from "@/components/common/styled-dialog";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import SignupForm from "@/components/auth/signup-form";

export default function SignupDialog() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <StyledDialog
      title={t("signup.title")}
      onClose={() => router.back()}
      open={true}
    >
      <SignupForm />
    </StyledDialog>
  );
}
