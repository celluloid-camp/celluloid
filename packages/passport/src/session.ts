import RedisStore from "connect-redis"
import session from "express-session"
import { createClient } from "redis"


export function createSession() {

  // Initialize client.
  const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost"
  })
  redisClient.connect().catch(console.error)

  // Initialize store.
  const redisStore = new RedisStore({
    client: redisClient,
  })

  return session({
    store: redisStore,
    name: process.env.COOKIE_NAME
      ? process.env.COOKIE_NAME
      : undefined,
    cookie: {
      domain: process.env.COOKIE_DOMAIN
        ? process.env.COOKIE_DOMAIN
        : undefined,
      secure: process.env.COOKIE_SECURE === "true",
      maxAge: 30 * 24 * 3600 * 1000,
      httpOnly: true,
    },
    secret: process.env.COOKIE_SECRET as string,
    resave: false,
    saveUninitialized: true,
  });
}
