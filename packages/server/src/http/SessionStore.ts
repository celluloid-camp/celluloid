import session from "express-session";
import moment from "moment";

let RedisStore = require("connect-redis")(session);

import { createClient } from "redis";

import { logger } from "../backends/Logger";

const log = logger("http/Session");

export function createSession() {
  let client = createClient({ legacyMode: true, url: process.env.CELLULOID_REDIS_URL || "redis://localhost" });
  client.connect().catch((e) => log.error(`redis error : ${e.message}`));

  log.info("redis connected");
  return session({
    store: new RedisStore({ client }),
    cookie: {
      domain: process.env.CELLULOID_COOKIE_DOMAIN
        ? process.env.CELLULOID_COOKIE_DOMAIN
        : undefined,
      secure: process.env.CELLULOID_COOKIE_SECURE === "true",
      maxAge: 30 * 24 * 3600 * 1000,
      httpOnly: true,
    },
    secret: process.env.CELLULOID_COOKIE_SECRET as string,
    resave: false,
    saveUninitialized: true,
  });
}
