import { Box, DialogTitle, Paper } from "@mui/material";
import { JoinForm } from "@/components/auth/join-form";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations();
  return (
    <Paper>
      <DialogTitle>{t("join.title")}</DialogTitle>
      <JoinForm />
    </Paper>
  );
}
