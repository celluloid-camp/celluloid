"use client";

import { useRouter } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { StyledDialog } from "@/components/common/styled-dialog";

export default function SignupDialog() {
  const router = useRouter();

  return (
    <StyledDialog onClose={() => router.back()} open={true}>
      <SignupForm />
    </StyledDialog>
  );
}
