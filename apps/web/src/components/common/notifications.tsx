import { NotificationsInbox } from "@celluloid/notifications/components/inbox";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";

export const Notifications = () => {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering on client
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const api = useTRPC();

  const { data: subscriber } = useQuery({
    ...api.notification.subscriber.queryOptions(),
    enabled: Boolean(session?.user),
    staleTime: Number.POSITIVE_INFINITY,
  });

  if (!mounted || isPending) {
    return null;
  }

  if (!(session?.user && subscriber)) {
    return null;
  }

  return (
    <Box
      sx={{
        marginX: 1,
      }}
    >
      <NotificationsInbox
        subscriberId={subscriber.subscriberId}
        subscriberHash={subscriber.subscriberHash}
        routerPush={(path) => router.push(path)}
      />
    </Box>
  );
};
