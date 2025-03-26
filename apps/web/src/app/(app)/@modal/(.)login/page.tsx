"use client";

import { StyledDialog } from "@/components/common/styled-dialog";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginDialog() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <StyledDialog
      title={t("signin.title")}
      onClose={() => router.back()}
      open={true}
    >
      <LoginForm />
    </StyledDialog>
  );
}
