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
	IconButton,
	Menu,
	MenuItem,
	Link,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { useTranslations } from "next-intl";
import { ProjectTableSkeleton } from "./skeleton";
import { useConfirm } from "material-ui-confirm";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";

export default function ProjectsPanel() {
	const t = useTranslations();
	const router = useRouter();
	const utils = trpc.useUtils();

	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedProject, setSelectedProject] = useState<string | null>(null);

	const { data, isLoading } = trpc.admin.listProjects.useQuery({
		limit: 10,
	});

	const deleteProject = trpc.admin.deleteUserProject.useMutation({
		onSuccess: () => {
			enqueueSnackbar(t("admin.project.delete.success"), {
				variant: "success",
				key: "admin.project.delete.success",
			});
			utils.admin.listProjects.invalidate();
		},
		onError: () => {
			enqueueSnackbar(t("admin.project.delete.error"), {
				variant: "error",
				key: "admin.project.delete.error",
			});
		},
	});

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		projectId: string,
	) => {
		setAnchorEl(event.currentTarget);
		setSelectedProject(projectId);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedProject(null);
	};

	const handleDeleteProject = async () => {
		if (!selectedProject) return;

		try {
			const value = await confirm({
				title: t("admin.projects.dialog.title"),
				description: t("admin.projects.dialog.description"),
			});

			if (!value.confirmed) {
				handleMenuClose();
				return;
			}

			await deleteProject.mutateAsync({
				projectId: selectedProject,
			});
			handleMenuClose();
		} catch (error) {
			console.error("Failed to delete project:", error);
		}
	};

	const handleEditProject = () => {
		router.push(`/admin/project/${selectedProject}`);
		handleMenuClose();
	};
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
								<TableCell>{t("admin.project.label.title")}</TableCell>
								<TableCell>{t("admin.project.label.code")}</TableCell>
								<TableCell>{t("admin.project.label.owner")}</TableCell>
								<TableCell>{t("admin.project.label.date")}</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data?.items.map((project) => (
								<TableRow key={project.id}>
									<TableCell>{project.title}</TableCell>
									<TableCell>{project.shareCode}</TableCell>
									<TableCell>
										<Link href={`/admin/user/${project.user.id}`}>
											{project.user.username}
										</Link>
									</TableCell>
									<TableCell>
										{new Date(project.publishedAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<IconButton onClick={(e) => handleMenuOpen(e, project.id)}>
											<MoreVertIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleEditProject}>
					<EditIcon sx={{ mr: 1 }} />
					{t("admin.table.actions.modify")}
				</MenuItem>
				<MenuItem onClick={handleDeleteProject} sx={{ color: "error.main" }}>
					<DeleteIcon sx={{ mr: 1 }} />
					{t("admin.table.actions.delete")}
				</MenuItem>
			</Menu>
		</Box>
	);
}
