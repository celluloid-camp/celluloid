import { Box, Container, Grid, Paper, Skeleton } from "@mui/material";
import { ProjectSummary } from "./summary";
import { SideBar } from "./sidebar";
import type { ProjectById } from "@/lib/trpc/types";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import { ProjectNotes } from "./project-notes";
import { Suspense } from "react";
export function ProjectDetails({ projectId }: { projectId: string }) {
	const { data: session, isPending } = useSession();
	const [project] = trpc.project.byId.useSuspenseQuery({ id: projectId });
	return (
		<Box
			sx={{
				backgroundColor: "brand.orange",
				minHeight: "100vh",
				paddingY: 3,
			}}
		>
			<Container maxWidth="lg">
				<Paper
					sx={{
						paddingY: 2,
						paddingX: 4,
						margin: 0,
						backgroundColor: "brand.green",
						minHeight: "100vh",
					}}
				>
					<Grid container direction="row" alignItems="flex-start" spacing={4}>
						<Grid item xs={12} md={8} lg={8}>
							<ProjectSummary project={project} user={session?.user} />
							<Suspense
								fallback={<Skeleton variant="rectangular" height={100} />}
							>
								<ProjectNotes project={project} user={session?.user} />
							</Suspense>
						</Grid>
						<Grid item xs={12} md={4} lg={4}>
							{isPending ? (
								<Box gap={4} display={"flex"} flexDirection={"column"}>
									<Skeleton
										variant="rectangular"
										sx={{
											borderRadius: 2,
											width: "100%",
											height: 200,
											paddingY: 2,
										}}
									/>
									<Skeleton
										variant="rectangular"
										sx={{
											borderRadius: 2,
											width: "100%",
											height: 100,
											paddingY: 2,
										}}
									/>
								</Box>
							) : (
								<SideBar project={project} user={session?.user} />
							)}
						</Grid>
					</Grid>
				</Paper>
			</Container>
		</Box>
	);
}
