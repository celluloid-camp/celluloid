import { Box, DialogTitle, Paper } from "@mui/material";
import { LoginForm } from "@/components/auth/login-form";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations();
  return (
    <Paper>
      <DialogTitle>{t("signin.title")}</DialogTitle>
      <LoginForm />
    </Paper>
  );
}
