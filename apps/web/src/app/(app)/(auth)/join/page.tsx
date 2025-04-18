import { JoinForm } from "@/components/auth/join-form";
import { Box, DialogTitle, Divider, Paper } from "@mui/material";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  return (
    <Paper sx={{ minWidth: 400 }}>
      <JoinForm />
    </Paper>
  );
}
