import { auth } from "@celluloid/auth";
import { Box, DialogTitle, Divider, Paper } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { SearchParams } from "nuqs/server";
import { JoinForm } from "@/components/auth/join-form";
import { loadSearchParams } from "../searchParams";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function JoinPage({ searchParams }: PageProps) {
  const { code } = await loadSearchParams(searchParams);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect(`/student-signup?code=${code}`);
  }

  return (
    <Paper sx={{ minWidth: 400 }}>
      <JoinForm />
    </Paper>
  );
}
