import { DialogTitle, Paper } from "@mui/material";
import { useTranslations } from "next-intl";
import { ForgotForm } from "@/components/auth/forgot-form";

export default function ForgotPage() {
  const t = useTranslations();
  return (
    <Paper>
      <ForgotForm />
    </Paper>
  );
}
