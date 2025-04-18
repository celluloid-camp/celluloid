"use client";
import { StyledDialog } from "@/components/common/styled-dialog";
import { useRouter } from "next/navigation";
import { JoinForm } from "@/components/auth/join-form";

export default function JoinModal() {
	const router = useRouter();
	return (
		<StyledDialog onClose={() => router.back()} open={true}>
			<JoinForm />
		</StyledDialog>
	);
}
