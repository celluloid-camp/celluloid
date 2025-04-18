"use client";

import { StudentSignupForm } from "@/components/auth/student-signup-form";
import { StyledDialog } from "@/components/common/styled-dialog";
import { useRouter } from "next/navigation";

export default function StudentSignupModal() {
  const router = useRouter();

  return (
    <StyledDialog onClose={() => router.back()} open={true}>
      <StudentSignupForm />
    </StyledDialog>
  );
}
