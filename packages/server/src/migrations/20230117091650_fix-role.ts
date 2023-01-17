import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(
    `ALTER TABLE public."User" DROP CONSTRAINT IF EXISTS "User_role_check";
    ALTER TABLE public."User" ALTER COLUMN email DROP NOT NULL;`
  );
}

export async function down(): Promise<void> {
  return;
}
