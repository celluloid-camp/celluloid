"use client";

import {
  type ColorMode,
  I18nContent,
  KnockFeedProvider,
  KnockProvider,
} from "@knocklabs/react";
import type { ReactNode } from "react";
import { keys } from "../keys";
import { NotificationsToaster } from "./toaster";

const knockApiKey = keys().NEXT_PUBLIC_KNOCK_API_KEY;
const knockFeedChannelId = keys().NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;

type NotificationsProviderProps = {
  children: ReactNode;
  userId: string;
  theme: ColorMode;
};

const i18nConfig: I18nContent = {
  locale: "fr",
  translations: {
    emptyFeedTitle: "Aucune notification",
    markAllAsRead: "Marquer tout comme lu",
    notifications: "Notifications",
    archiveRead: "Marquer tout comme lu",
    emptyFeedBody: "Aucune notification",
    archiveNotification: "Notifications archivées",
    all: "Tout",
    unread: "Non lu",
    read: "Lu",
    unseen: "Non vu",
  },
};

export const NotificationsProvider = ({
  children,
  theme,
  userId,
}: NotificationsProviderProps) => {
  if (!(knockApiKey && knockFeedChannelId)) {
    return children;
  }

  return (
    <KnockProvider apiKey={knockApiKey} user={{ id: userId }} i18n={i18nConfig}>
      <KnockFeedProvider colorMode={theme} feedId={knockFeedChannelId}>
        {children}
        <NotificationsToaster />
      </KnockFeedProvider>
    </KnockProvider>
  );
};
