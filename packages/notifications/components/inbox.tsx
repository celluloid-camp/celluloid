"use client";

import { Inbox } from "@novu/react";
import { keys } from "../keys";

const applicationIdentifier = keys().NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER;

const localization = {
  locale: "fr-FR",
  "inbox.filters.dropdownOptions.unread": "Non lues",
  "inbox.filters.dropdownOptions.default": "Non lues et lues",
  "inbox.filters.dropdownOptions.archived": "Archivées",
  "inbox.filters.dropdownOptions.snoozed": "En pause",
  "inbox.filters.labels.unread": "Non lues",
  "inbox.filters.labels.default": "Notifications",
  "inbox.filters.labels.archived": "Archivées",
  "inbox.filters.labels.snoozed": "En pause",
  "notifications.emptyNotice": "Aucune notification",
  "notifications.actions.readAll": "Tout marquer comme lu",
  "notifications.actions.archiveAll": "Tout archiver",
  "notifications.actions.archiveRead": "Archiver les notifications lues",
  "notifications.newNotifications": ({
    notificationCount,
  }: {
    notificationCount: number;
  }) =>
    notificationCount > 1
      ? `${notificationCount} nouvelles notifications`
      : "1 nouvelle notification",
  "notification.actions.read.tooltip": "Marquer comme lu",
  "notification.actions.unread.tooltip": "Marquer comme non lu",
  "notification.actions.archive.tooltip": "Archiver",
  "notification.actions.unarchive.tooltip": "Désarchiver",
  "notification.actions.snooze.tooltip": "Mettre en pause",
  "notification.actions.unsnooze.tooltip": "Reprendre",
  "notification.snoozedUntil": "En pause jusqu'à",
  "preferences.title": "Préférences",
  "preferences.emptyNotice": "Aucune préférence de notification",
  "preferences.global": "Préférences globales",
};

type NotificationsInboxProps = {
  subscriberId: string;
  subscriberHash?: string;
  routerPush: (path: string) => void;
};

export const NotificationsInbox = ({
  subscriberId,
  subscriberHash,
  routerPush,
}: NotificationsInboxProps) => {
  if (!applicationIdentifier) {
    return null;
  }

  return (
    <Inbox
      applicationIdentifier={applicationIdentifier}
      subscriber={subscriberId}
      subscriberHash={subscriberHash}
      localization={localization}
      routerPush={routerPush}
    />
  );
};
