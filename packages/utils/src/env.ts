import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export function envBoolean(params: { optional: boolean; defaultValue: boolean }) {
  type BoolEnum = ['true', 'false'];
  let variable: z.ZodCatch<z.ZodEnum<BoolEnum>> | z.ZodEnum<BoolEnum>;

  if (params.optional) {
    // if undefined assign the defaultValue
    variable = z.enum(['true', 'false']).catch(params.defaultValue ? 'true' : 'false');
  } else {
    // not optional so "true" or "false" is enforced
    variable = z.enum(['true', 'false']);
  }

  // convert string to bool
  return variable.transform((v) => v === 'true');
}

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    REDIS_URL: z.string().default("redis://localhost"),

    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_SECURE: envBoolean({ optional: true, defaultValue: false }),
    SMTP_EMAIL_FROM: z.string().default("no-reply@celluloid.huma-num.fr"),

    STORAGE_URL: z.string(),
    STORAGE_ACCESS_KEY: z.string(),
    STORAGE_SECRET_KEY: z.string(),
    STORAGE_BUCKET: z.string().default('celluloid'),

  },

  clientPrefix: 'VITE',
  client: {
    VITE_COMMIT: z.string().default('dev'),
  },
  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
