import { Box } from "@mui/material";

import { HomePageHero } from "@/components/home/hero";
import { HomePageProjects } from "@/components/home/projects";
import { HydrateClient, trpc } from "@/lib/trpc/server";

export default function HomePage() {
	void trpc.project.list.prefetch({ term: "" });
	return (
		<Box>
			<HomePageHero />
			<HydrateClient>
				<HomePageProjects />
			</HydrateClient>
		</Box>
	);
}
