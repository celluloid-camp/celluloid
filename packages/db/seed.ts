import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to seed users...");

  const users = [];

  for (let i = 0; i < 50; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase();
    const user = {
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      username,
      emailVerified: true,
      firstname: firstName,
      lastname: lastName,
      bio: faker.person.bio(),
      name: `${firstName} ${lastName}`,
      createdAt: faker.date.past(),
      role: "teacher",
    };

    users.push(user);
  }

  // Insert all users in a single transaction
  const result = await prisma.$transaction(
    users.map((user) => prisma.user.create({ data: user })),
  );

  console.log(`Successfully created ${result.length} users`);

  // Create projects for some users
  console.log("Starting to seed projects...");

  const projects = [];

  // Create 20 projects distributed among the first 10 users
  for (let i = 0; i < 20; i++) {
    const userIndex = i % 10;
    const userId = result[userIndex]?.id;

    if (!userId) {
      console.log(
        `Skipping project creation for missing user at index ${userIndex}`,
      );
      continue;
    }

    const title = faker.lorem.words(3);
    const project = {
      userId,
      title,
      description: faker.lorem.paragraph(),
      videoId: faker.string.alphanumeric(11),
      host: "youtube",
      objective: faker.lorem.sentence(),
      public: faker.datatype.boolean(),
      collaborative: faker.datatype.boolean(),
      shared: faker.datatype.boolean(),
      thumbnailURL: faker.image.url(),
      shareCode: undefined,
      keywords: faker.word.words(5).split(" "),
      publishedAt: faker.date.anytime(),
    };

    projects.push(project);
  }

  // Insert all projects in a single transaction
  const projectResult = await prisma.$transaction(
    projects.map((project) => prisma.project.create({ data: project })),
  );

  console.log(`Successfully created ${projectResult.length} projects`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
