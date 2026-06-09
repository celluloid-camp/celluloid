import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { keys } from "./keys";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: keys().DATABASE_URL,
});
export const db = drizzle(pool, { schema });

export * from "drizzle-orm";
export * from "./schema";
export type { AnnotationShape } from "./schema/types";

export * from "./validator";
