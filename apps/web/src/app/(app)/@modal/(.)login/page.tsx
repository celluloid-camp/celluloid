"use client";
import { StyledDialog } from "@/components/common/styled-dialog";
import { LoginForm } from "@/components/auth/login-form";
import { useRouter } from "next/navigation";

export default function LoginDialog() {
  const router = useRouter();
  return (
    <StyledDialog onClose={() => router.back()} open={true}>
      <LoginForm onClose={() => router.back()} />
    </StyledDialog>
  );
}
