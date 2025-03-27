"use client";

import { StyledDialog } from "@/components/common/styled-dialog";
import { useRouter } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupDialog() {
  const router = useRouter();

  return (
    <StyledDialog onClose={() => router.back()} open={true}>
      <SignupForm onClose={() => router.back()} />
    </StyledDialog>
  );
}
