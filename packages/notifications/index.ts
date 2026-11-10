import { createHmac } from "node:crypto";
import { Novu } from "@novu/api";
import { keys } from "./keys";

const PROJECT_ACTIVITY_WORKFLOW_ID = "project-activity";

let novu: Novu | undefined;

function getNovuClient() {
  const secretKey = keys().NOVU_SECRET_KEY;
  if (!secretKey) {
    return undefined;
  }
  novu ??= new Novu({ secretKey });
  return novu;
}

/**
 * HMAC of the subscriber id, required by the Inbox when HMAC encryption
 * is enabled on the Novu in-app integration.
 */
export function getSubscriberHash(subscriberId: string) {
  const secretKey = keys().NOVU_SECRET_KEY;
  if (!secretKey) {
    return undefined;
  }
  return createHmac("sha256", secretKey).update(subscriberId).digest("hex");
}

/**
 * Notify a project owner in their inbox. Failures are logged and never
 * thrown, so a notification issue cannot fail the action that caused it.
 */
export async function notifyProjectActivity(params: {
  recipientId: string;
  message: string;
  link: string;
}) {
  const client = getNovuClient();
  if (!client) {
    return;
  }

  try {
    await client.trigger({
      workflowId: PROJECT_ACTIVITY_WORKFLOW_ID,
      to: params.recipientId,
      payload: { message: params.message, link: params.link },
    });
  } catch (error) {
    console.error("Failed to send project activity notification:", error);
  }
}
