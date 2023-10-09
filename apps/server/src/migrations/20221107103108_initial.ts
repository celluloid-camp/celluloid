import { Knex } from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "plpgsql"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  if (!(await knex.schema.hasTable("User"))) {
    await knex.schema.createTable("User", (table) => {
      table
        .uuid("id")
        .unique()
        .notNullable()
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.string("email").notNullable().unique();
      table.string("username").notNullable().unique();
      table.string("password").notNullable();
      table.boolean("confirmed").notNullable().defaultTo(false);
      table.text("code");
      table.timestamp("codeGeneratedAt");
      table
        .enu("role", ["Admin", "Teacher", "Student"], {
          useNative: true,
          enumName: "UserRole",
        })
        .checkIn(["Teacher", "Admin"]);
      table.jsonb("extra").defaultTo({});
    });

    knex.schema.raw(`
    ALTER TABLE
    User
    ADD CONSTRAINT 
      Project_check_userValid
    CHECK 
      ((((role = ANY (ARRAY['Teacher'::public."UserRole", 'Admin'::public."UserRole"])) AND (email IS NOT NULL)) OR ((role = 'Student'::public."UserRole"))))
    `);
  }

  await knex.schema.createTable("Language", (table) => {
    table.text("id").notNullable().unique();
    table.text("name").notNullable();
  });

  await knex.schema.createTable("Project", (table) => {
    table
      .uuid("id")
      .unique()
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.text("videoId").notNullable();

    table
      .uuid("userId")
      .notNullable()
      .references("User.id")
      .onDelete("CASCADE");

    table.text("title").notNullable();
    table.text("description").notNullable();
    table.text("host");
    table.specificType("assignments", "text[]");
    table.timestamp("publishedAt").notNullable().defaultTo(knex.fn.now());
    table.text("objective").notNullable();
    table.integer("levelStart").notNullable();
    table.integer("levelEnd").notNullable();
    table.boolean("public").notNullable().defaultTo(false);
    table.boolean("collaborative").notNullable();
    table.boolean("shared").notNullable().defaultTo(false);
    table.text("shareName").unique();
    table.timestamp("shareExpiresAt"), table.text("sharePassword");
    table.jsonb("extra").defaultTo({});
  });

  await knex.schema.createTable("Annotation", (table) => {
    table
      .uuid("id")
      .unique()
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));

    table.text("text").notNullable();
    table.float("startTime").notNullable();
    table.float("stopTime").notNullable();
    table.boolean("pause").notNullable();
    table
      .uuid("userId")
      .notNullable()
      .references("User.id")
      .onDelete("CASCADE");
    table
      .uuid("projectId")
      .notNullable()
      .references("Project.id")
      .onDelete("CASCADE");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.jsonb("extra").defaultTo({});
  });

  await knex.schema.createTable("Comment", (table) => {
    table
      .uuid("id")
      .unique()
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.text("text").notNullable();
    table
      .uuid("annotationId")
      .notNullable()
      .references("Annotation.id")
      .onDelete("CASCADE");
    table
      .uuid("userId")
      .notNullable()
      .references("User.id")
      .onDelete("CASCADE");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.jsonb("extra").defaultTo({});
  });

  await knex.schema.createTable("Tag", (table) => {
    table
      .uuid("id")
      .unique()
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.text("name").notNullable();
    table.boolean("featured").notNullable().defaultTo(false);
    table.jsonb("extra").defaultTo({});
  });

  await knex.schema.createTable("TagToProject", (table) => {
    table.uuid("tagId").notNullable().references("Tag.id").onDelete("CASCADE");
    table
      .uuid("projectId")
      .notNullable()
      .references("Project.id")
      .onDelete("CASCADE");
    table.unique(["tagId", "projectId"], {
      indexName: "TagToProjectTagIdProjectIdUnique",
    });
  });

  await knex.schema.createTable("UserToProject", (table) => {
    table.uuid("userId").references("User.id").onDelete("CASCADE");
    table.uuid("projectId").references("Project.id").onDelete("CASCADE");
  });
  // }
}

exports.down = function (knex: Knex): Promise<any> {
  throw new Error("Enable to rollback, please use backup");
};
