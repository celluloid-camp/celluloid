import { Box, Paper } from "@mui/material";
import { OtpForm } from "@/components/auth/otp-form";

export default async function OTPPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <Paper>
      <OtpForm email={email} />
    </Paper>
  );
}
