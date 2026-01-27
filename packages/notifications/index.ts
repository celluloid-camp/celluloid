import { Knock } from "@knocklabs/node";
import { keys } from "./keys";

const key = keys().KNOCK_SECRET_API_KEY;

export function getNotificationsClient() {
  const notifications = new Knock({ apiKey: key });
  return notifications;
}
