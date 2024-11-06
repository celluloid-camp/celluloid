import { env } from "@celluloid/utils"
import RedisStore from "connect-redis"
import session from "express-session"
import { createClient } from "redis"


export function createSession(): ReturnType<typeof session> {

  // Initialize client.
  const redisClient = createClient({
    url: env.REDIS_URL
  })
  redisClient.connect().catch(console.error)

  // Initialize store.
  const redisStore = new RedisStore({
    client: redisClient,
  })

  return session({
    store: redisStore,
    name: env.COOKIE_NAME,
    cookie: {
      domain: env.COOKIE_DOMAIN,
      secure: env.COOKIE_SECURE,
      maxAge: 30 * 24 * 3600 * 1000,
      httpOnly: true,
    },
    secret: env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
  });
}
