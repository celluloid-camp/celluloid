"use client";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { StyledDialog } from "@/components/common/styled-dialog";

export default function LoginDialog() {
  const router = useRouter();
  return (
    <StyledDialog onClose={() => router.back()} open={true}>
      <LoginForm />
    </StyledDialog>
  );
}
