import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import type { IncomingMessage } from "node:http";

export const expressAuthHandler = toNodeHandler(auth);

export const expressAuthSession = (req: IncomingMessage) => {
  return auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
};
