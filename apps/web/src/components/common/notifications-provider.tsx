"use client";

import { NotificationsProvider as RawNotificationsProvider } from "@celluloid/notifications/components/provider";
import type { ReactNode } from "react";

type NotificationsProviderProperties = {
  children: ReactNode;
  userId?: string;
};

export const NotificationsProvider = ({
  children,
  userId,
}: NotificationsProviderProperties) => {
  return (
    <RawNotificationsProvider theme="light" userId={userId ?? ""}>
      {children}
    </RawNotificationsProvider>
  );
};
