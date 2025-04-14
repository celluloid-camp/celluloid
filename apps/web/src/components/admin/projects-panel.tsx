import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
} from "@mui/material";
import { trpc } from "@/lib/trpc/client";
import { useTranslations } from "next-intl";
import { ProjectTableSkeleton } from "./skeleton";
export default function ProjectsPanel() {
	const t = useTranslations();
	const { data, isLoading } = trpc.admin.listProjects.useQuery({
		limit: 10,
	});

	return (
		<Box>
			<Typography variant="h6" marginBottom={2}>
				{t("admin.projects.title")}
			</Typography>

			{isLoading ? (
				<ProjectTableSkeleton />
			) : (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>Share Code</TableCell>
								<TableCell>Owner</TableCell>
								<TableCell>Published At</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data?.items.map((project) => (
								<TableRow key={project.id}>
									<TableCell>{project.title}</TableCell>
									<TableCell>{project.shareCode}</TableCell>
									<TableCell>{project.user.username}</TableCell>
									<TableCell>
										{new Date(project.publishedAt).toLocaleDateString()}
									</TableCell>
									<TableCell>{/* Add action buttons here */}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Box>
	);
}
