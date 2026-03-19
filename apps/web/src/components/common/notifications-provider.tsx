"use client";

import { NotificationsProvider as RawNotificationsProvider } from "@celluloid/notifications/components/provider";
import type { ReactNode } from "react";
import { useSession } from "@/lib/auth-client";

type NotificationsProviderProperties = {
  children: ReactNode;
  userId?: string;
};

export const NotificationsProvider = ({
  children,
  userId,
}: NotificationsProviderProperties) => {
  const { data: session } = useSession();
  return (
    <RawNotificationsProvider theme="light" userId={session?.user?.id ?? ""}>
      {children}
    </RawNotificationsProvider>
  );
};
