import { auth } from "@celluloid/auth";
import { Box } from "@mui/material";
import { headers } from "next/headers";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { NotificationsProvider } from "@/components/common/notifications-provider";

export default async function Layout({
  modal,
  children,
}: {
  modal: React.ReactNode;
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: {
      disableCookieCache: true,
    },
  });
  return (
    <NotificationsProvider userId={session?.user?.id}>
      <Box
        sx={{
          minHeight: "100vh",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {modal}
        <Header />
        <Box sx={{ flexGrow: 1, pt: 8 }}>{children}</Box>
        <Footer />
      </Box>
    </NotificationsProvider>
  );
}
