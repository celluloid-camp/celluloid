"use client";

import { useRouter } from "next/navigation";
import { StudentSignupForm } from "@/components/auth/student-signup-form";
import { StyledDialog } from "@/components/common/styled-dialog";

export default function StudentSignupModal() {
  const router = useRouter();

  return (
    <StyledDialog onClose={() => router.back()} open={true}>
      <StudentSignupForm />
    </StyledDialog>
  );
}
