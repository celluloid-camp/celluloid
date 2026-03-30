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
  };
}
