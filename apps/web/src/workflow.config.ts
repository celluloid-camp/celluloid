import { createWorld } from "@workflow-worlds/redis";
import { env } from "./env";

const world = createWorld({
  redisUrl: env.REDIS_URL,
});
