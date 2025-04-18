import { RecoverForm } from "@/components/auth/recover-form";
import { Paper } from "@mui/material";

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
