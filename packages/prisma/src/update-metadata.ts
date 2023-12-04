import { prisma, Project } from '@celluloid/prisma'
import fetch from 'node-fetch';


const getProjectMetadata = async (project: Project) => {

  const apiUrl = `https://${project.host}/api/v1/videos/${project.videoId}`;

  const response = await fetch(apiUrl, {
    method: "GET",
  });

  if (response.status === 200) {
    const data = await response.json() as any;
    return { duration: data.duration, thumbnailURL: `https://${project.host}${data.thumbnailPath}`, metadata: data }

  } else {
    throw new Error(
      `Could not perform PeerTube API request (error ${response.status})`
    );
  }


}

async function main() {
  // Retrieve all published posts
  const allProjects = await prisma.project.findMany();

  const totalProjects = allProjects.length;
  let currentProject = 0;

  for (const project of allProjects) {
    currentProject += 1;

    // Print the current project ID and update progress
    console.log(`Updating project ID: ${project.id} (${currentProject}/${totalProjects})`);

    try {
      const content = await getProjectMetadata(project);

      await prisma.project.update({
        where: {
          id: project.id,
        },
        data: {
          duration: content.duration,
          thumbnailURL: content.thumbnailURL,
          metadata: content.metadata,
        },
      });

      // Optional: Print a message to confirm that the project was updated
      console.log(`Successfully updated project ID: ${project.id}`);
    } catch (e) {
      console.error(`Failed to update project ID: ${project.id}, removing from database. Error: ${e.message}`);

      await prisma.project.delete({
        where: {
          id: project.id,
        },
      });
    }

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
