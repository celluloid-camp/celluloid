import { useKnockFeed } from "@knocklabs/react";
import { useSnackbar } from "notistack";
import { useEffect } from "react";

export const NotificationsToaster = () => {
  const { feedClient } = useKnockFeed();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onNotificationsReceived = ({ items }: any) => {
    // Whenever we receive a new notification from our real-time stream, show a toast
    // (note here that we can receive > 1 items in a batch)
    items
      .filter((item: any) => item.seen_at !== null)
      .forEach((notification: any) => {
        //Use toast.custom to render the HTML content of the notification
        enqueueSnackbar(
          <div
            dangerouslySetInnerHTML={{
              __html: notification.blocks[0].rendered,
            }}
          ></div>,
          { key: notification.id, autoHideDuration: 5000 },
        );
      });

    // Optionally, you may want to mark them as "seen" as well
    feedClient.markAsSeen(items);
  };

  useEffect(() => {
    // Receive all real-time notifications on our feed
    feedClient.on("items.received.realtime", onNotificationsReceived);

    // Cleanup
    return () =>
      feedClient.off("items.received.realtime", onNotificationsReceived);
  }, [feedClient]);

  return <></>;
};
