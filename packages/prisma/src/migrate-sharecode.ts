import { prisma, Project } from '@celluloid/prisma'
import fetch from 'node-fetch';
import { generateUniqueShareName } from "@celluloid/utils"


async function main() {
  // Retrieve all published posts
  const allProjects = await prisma.project.findMany({
    where: { shared: true },
  });

  const totalProjects = allProjects.length;
  let currentProject = 0;

  for (const project of allProjects) {
    currentProject += 1;

    // Print the current project ID and update progress
    console.log(`Updating project ID: ${project.id} (${currentProject}/${totalProjects})`);

    await prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        shareCode: generateUniqueShareName(project.title)
      },
    });

    // Optional: Print a message to confirm that the project was updated
    console.log(`Successfully updated project ID: ${project.id}`);
  }

  console.log('All updates completed.');
}



main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
