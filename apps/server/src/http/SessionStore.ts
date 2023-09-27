import RedisStore from "connect-redis"
import session from "express-session";
import { createClient } from "redis";

import { logger } from "../backends/Logger";

const log = logger("http/Session");

export function createSession() {
  const redisClient = createClient({ url: process.env.REDIS_URL || "redis://localhost" });
  redisClient.connect().catch((e) => log.error(`redis error : ${e.message}`));

  const redisStore = new RedisStore({
    client: redisClient,
  })
  log.info("redis connected");
  return session({
    store: redisStore,
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
