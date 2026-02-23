import { SecondaryStorage } from "better-auth";
import { createClient } from "redis";
import { keys } from "./keys";

const redis = createClient({ url: keys().REDIS_URL });
await redis.connect();

export function getSecondaryStorage(): SecondaryStorage {
  return {
    get: async (key) => {
      return await redis.get(key);
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, { EX: ttl });
      else await redis.set(key, value);
    },
    delete: async (key) => {
      await redis.del(key);
    },
  };
}
