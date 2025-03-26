import { Box, DialogTitle, Paper } from "@mui/material";
import { useTranslations } from "next-intl";
import { RecoverForm } from "@/components/auth/recover-form";

export default async function RecoverPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }> | undefined;
}) {
  const t = useTranslations();
  const email = (await searchParams)?.email;
  return (
    <Paper>
      <DialogTitle>{t("recover.title")}</DialogTitle>
      <RecoverForm email={email} />
    </Paper>
  );
}
