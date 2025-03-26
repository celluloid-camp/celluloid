import { Box, DialogTitle, Paper } from "@mui/material";
import { useTranslations } from "next-intl";
import { StudentSignupForm } from "@/components/auth/student-signup-form";

export default function LoginPage() {
  const t = useTranslations();
  return (
    <Paper>
      <DialogTitle>{t("student-signup.title")}</DialogTitle>
      <StudentSignupForm />
    </Paper>
  );
}
