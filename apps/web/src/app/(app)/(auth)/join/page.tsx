import { Box, DialogTitle, Divider, Paper } from "@mui/material";
import { JoinForm } from "@/components/auth/join-form";
import { useTranslations } from "next-intl";

export default function LoginPage() {
	return (
		<Paper sx={{ minWidth: 400 }}>
			<JoinForm />
		</Paper>
	);
}
