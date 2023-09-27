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
