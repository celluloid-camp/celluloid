import { createWorld } from "@workflow/world-postgres";
import { env } from "./env";

const world = createWorld({
  connectionString: env.DATABASE_URL,
});
