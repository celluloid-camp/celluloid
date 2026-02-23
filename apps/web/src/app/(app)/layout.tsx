import { auth } from "@celluloid/auth";
import { prefetchSession } from "@daveyplate/better-auth-tanstack/server";
import { Box } from "@mui/material";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
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
  const queryClient = new QueryClient();

  const { data, session, user } = await prefetchSession(auth, queryClient, {
    headers: await headers(),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsProvider>
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
    </HydrationBoundary>
  );
}
