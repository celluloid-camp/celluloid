"use client";
import { LoginForm } from "@/components/auth/login-form";
import { StyledDialog } from "@/components/common/styled-dialog";
import { useRouter } from "next/navigation";

export default function LoginDialog() {
  const router = useRouter();
  return (
    <StyledDialog onClose={() => router.back()} open={true}>
      <LoginForm />
    </StyledDialog>
  );
}
