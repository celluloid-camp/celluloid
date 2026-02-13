import { createWorld } from "@workflow-worlds/redis";
import { env } from "./src/env";

const world = createWorld({
  redisUrl: env.WORKFLOW_REDIS_URI,
});
