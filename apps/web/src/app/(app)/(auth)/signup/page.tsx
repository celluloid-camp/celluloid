import { Box, DialogTitle, Paper } from "@mui/material";
import { useTranslations } from "next-intl";
import SignupForm from "@/components/auth/signup-form";

export default function SignupPage() {
  const t = useTranslations();
  return (
    <Paper>
      <DialogTitle>{t("signup.title")}</DialogTitle>
      <SignupForm />
    </Paper>
  );
}
