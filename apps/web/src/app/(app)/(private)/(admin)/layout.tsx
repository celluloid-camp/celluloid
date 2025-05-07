import { auth } from "@celluloid/auth";
import { ChildCareTwoTone } from "@mui/icons-material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Box, Container, IconButton, Typography } from "@mui/material";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "admin") {
    redirect("/");
  }

  return (
    <Box sx={{ backgroundColor: "brand.orange" }}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 4, minHeight: "100vh" }}>
        <Typography variant="h4" marginBottom={2} component="h1">
          Admin Dashboard
        </Typography>

        {children}
      </Container>
    </Box>
  );
}
