import { getSubscriberHash } from "@celluloid/notifications";
import { protectedProcedure, router } from "../trpc";

export const notificationRouter = router({
  subscriber: protectedProcedure.query(({ ctx }) => ({
    subscriberId: ctx.user.id,
    subscriberHash: getSubscriberHash(ctx.user.id),
  })),
});
