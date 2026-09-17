import { SecondaryStorage } from "better-auth";
import { createClient } from "redis";
import { keys } from "./keys";

const redis = createClient({ url: keys().REDIS_URL });
let redisConnected = false;
const redisConnectPromise = redis
  .connect()
  .then(() => {
    redisConnected = true;
  })
  .catch((err) => {
    redisConnected = false;
    console.warn(
      "[auth/storage] Redis connection failed; continuing without Redis.",
      err,
    );
  });

export function getSecondaryStorage(): SecondaryStorage {
  return {
    get: async (key) => {
      await redisConnectPromise;
      if (!redisConnected) return null;
      try {
        return await redis.get(key);
      } catch (err) {
        console.warn("[auth/storage] Redis GET failed; returning null.", err);
        return null;
      }
    },
    set: async (key, value, ttl) => {
      await redisConnectPromise;
      if (!redisConnected) return;
      try {
        if (ttl) await redis.set(key, value, { EX: ttl });
        else await redis.set(key, value);
      } catch (err) {
        console.warn("[auth/storage] Redis SET failed; ignoring.", err);
      }
    },
    delete: async (key) => {
      await redisConnectPromise;
      if (!redisConnected) return;
      try {
        await redis.del(key);
      } catch (err) {
        console.warn("[auth/storage] Redis DEL failed; ignoring.", err);
      }
    },
    getAndDelete: async (key) => {
      await redisConnectPromise;
      if (!redisConnected) return null;
      try {
        return await redis.getDel(key);
      } catch (err) {
        console.warn(
          "[auth/storage] Redis GETDEL failed; returning null.",
          err,
        );
        return null;
      }
    },
    /**
     * Atomic counter for Better Auth secondary-storage rate limiting.
     * TTL is applied only when the key is created (first increment).
     */
    increment: async (key, ttl) => {
      await redisConnectPromise;
      if (!redisConnected) {
        // Fail open when Redis is down so auth endpoints stay available.
        return 1;
      }
      try {
        const count = await redis.incr(key);
        if (count === 1 && ttl > 0) {
          await redis.expire(key, ttl);
        }
        return count;
      } catch (err) {
        console.warn(
          "[auth/storage] Redis INCR failed; failing open for rate limit.",
          err,
        );
        return 1;
      }
    },
  };
}
