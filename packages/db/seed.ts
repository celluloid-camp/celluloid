import type { UserInsert } from "@celluloid/db";
import { db, project, user } from "@celluloid/db";
import { faker } from "@faker-js/faker";

async function main() {
  console.log("Starting to seed users...");

  const usersData: UserInsert[] = [];

  for (let i = 0; i < 50; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase();
    usersData.push({
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      username,
      emailVerified: true,
      firstname: firstName,
      lastname: lastName,
      bio: faker.person.bio(),
      name: `${firstName} ${lastName}`,
      role: "Teacher",
    });
  }

  const insertedUsers = await db.transaction(async (tx) => {
    const result = [];
    for (const userData of usersData) {
      const [row] = await tx.insert(user).values(userData).returning();
      if (row) result.push(row);
    }
    return result;
  });

  console.log(`Successfully created ${insertedUsers.length} users`);

  console.log("Starting to seed projects...");

  const projectsData: (typeof project.$inferInsert)[] = [];

  for (let i = 0; i < 20; i++) {
    const userIndex = i % 10;
    const userId = insertedUsers[userIndex]?.id;

    if (!userId) {
      console.log(
        `Skipping project creation for missing user at index ${userIndex}`,
      );
      continue;
    }

    projectsData.push({
      userId,
      title: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      videoId: faker.string.alphanumeric(11),
      host: "youtube",
      objective: faker.lorem.sentence(),
      public: faker.datatype.boolean(),
      collaborative: faker.datatype.boolean(),
      shared: faker.datatype.boolean(),
      thumbnailUrl: faker.image.url(),
      keywords: faker.word.words(5).split(" "),
      publishedAt: faker.date.anytime().toISOString(),
    });
  }

  await db.transaction(async (tx) => {
    for (const projectData of projectsData) {
      await tx.insert(project).values(projectData);
    }
  });

  console.log(`Successfully created ${projectsData.length} projects`);
}

main().catch((e) => {
  console.error("Error seeding database:", e);
  process.exit(1);
});
