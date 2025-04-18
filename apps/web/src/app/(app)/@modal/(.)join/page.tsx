"use client";
import { JoinForm } from "@/components/auth/join-form";
import { StyledDialog } from "@/components/common/styled-dialog";
import { useRouter } from "next/navigation";

export default function JoinModal() {
  const router = useRouter();
  return (
    <StyledDialog onClose={() => router.back()} open={true}>
      <JoinForm />
    </StyledDialog>
  );
}
