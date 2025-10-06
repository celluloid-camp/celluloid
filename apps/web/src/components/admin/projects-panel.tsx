import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Stack,
} from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { SearchFilter } from "./search-filter";
import { ProjectTableSkeleton } from "./skeleton";
import { SearchFilter } from "./search-filter";

export default function ProjectsPanel() {
  const t = useTranslations();
  const router = useRouter();
  const utils = trpc.useUtils();

  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = trpc.admin.listProjects.useQuery({
    limit: rowsPerPage,
    skip: page * rowsPerPage,
    searchTerm,
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

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ flex: 2 }}>
          {t("admin.projects.title")}
        </Typography>

        <SearchFilter
          onFilterChange={setSearchTerm}
          placeholder={t("admin.projects.search.placeholder")}
        />
      </Stack>

      {isLoading ? (
        <ProjectTableSkeleton />
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("admin.project.label.title")}</TableCell>
                  <TableCell>{t("admin.project.label.code")}</TableCell>
                  <TableCell>{t("admin.project.label.collab")}</TableCell>
                  <TableCell>{t("admin.project.shared.label")}</TableCell>
                  <TableCell>{t("admin.project.label.public")}</TableCell>

                  <TableCell>{t("admin.project.label.owner")}</TableCell>
                  <TableCell>{t("admin.project.label.date")}</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {t("admin.list.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.items.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.title}</TableCell>
                      <TableCell>{project.shareCode}</TableCell>

                      <TableCell>
                        {project.collaborative ? (
                          <CheckIcon color="success" />
                        ) : (
                          <CloseIcon color="error" />
                        )}
                      </TableCell>
                      <TableCell>
                        {project.shared ? (
                          <CheckIcon color="success" />
                        ) : (
                          <CloseIcon color="error" />
                        )}
                      </TableCell>
                      <TableCell>
                        {project.public ? (
                          <CheckIcon color="success" />
                        ) : (
                          <CloseIcon color="error" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/user/${project.user.id}`}>
                          {project.user.username}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {new Date(project.publishedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, project.id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {data?.items && data.items.length > 0 && (
            <TablePagination
              component="div"
              count={data?.total ?? 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage={t("common.table.rowsPerPage")}
            />
          )}
        </Paper>
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
