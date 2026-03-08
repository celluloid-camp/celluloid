import { Box } from "@mui/material";

import { HomePageHero } from "@/components/home/hero";
import { HomePageProjects } from "@/components/home/projects";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default function HomePage() {
  // void prefetch(trpc.project.list.queryOptions({ term: "" }));
  return (
    <Box>
      <HomePageHero />
      <HydrateClient>
        <HomePageProjects />
      </HydrateClient>
    </Box>
  );
}
