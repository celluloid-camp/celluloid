import { Paper } from "@mui/material";
import { RecoverForm } from "@/components/auth/recover-form";

export default async function RecoverPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }> | undefined;
}) {
  const email = (await searchParams)?.email;
  return (
    <Paper>
      <RecoverForm email={email} />
    </Paper>
  );
}
