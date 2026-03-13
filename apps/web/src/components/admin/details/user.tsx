"use client";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { useState } from "react";
import * as Yup from "yup";
import { BackButton } from "@/components/common/back-button";
import { useTRPC } from "@/lib/trpc/client";
import type { AdminGetUserById } from "@/lib/trpc/types";

export function UserDetails({ data }: { data: AdminGetUserById }) {
  const t = useTranslations();
  const api = useTRPC();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(),
    firstName: Yup.string().required(),
    lastName: Yup.string().required(),
  });

  const mutation = useMutation(
    api.admin.updateUser.mutationOptions({
      onSuccess: () => {
        enqueueSnackbar(t("profile.update.success"), {
          variant: "success",
          key: "profile.update.success",
        });
        setEditDialogOpen(false);
        queryClient.invalidateQueries(
          api.admin.getUserById.queryFilter({ id: data.id }),
        );
      },
      onError: () => {
        enqueueSnackbar(t("profile.update.error"), {
          variant: "error",
          key: "profile.update.error",
        });
      },
    }),
  );

  const formik = useFormik({
    initialValues: {
      username: data.username,
      firstName: data.firstname ?? "",
      lastName: data.lastname ?? "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await mutation.mutateAsync({
          userId: data.id,
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
        });
      } catch (error) {
        console.error("Error updating user:", error);
      }
    },
  });

  return (
    <Paper sx={{ width: "100%", p: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
        <BackButton href="/admin" ariaLabel="back to users list" />
        <Typography variant="h5">{t("profile.update.title")}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">{t("profile.update.title")}</Typography>
              <IconButton onClick={() => setEditDialogOpen(true)} size="small">
                <EditIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("profile.update.username")}
                </Typography>
                <Typography variant="body1">{data.username}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{data.email}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("profile.update.firstname")}
                </Typography>
                <Typography variant="body1">{data.firstname || "-"}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("profile.update.lastname")}
                </Typography>
                <Typography variant="body1">{data.lastname || "-"}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1">{data.role}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("users.table.emailVerified")}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={
                      data.emailVerified
                        ? t("common.verified")
                        : t("common.unverified")
                    }
                    color={data.emailVerified ? "success" : "default"}
                    size="small"
                    icon={data.emailVerified ? <CheckIcon /> : <CloseIcon />}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("users.table.createAt")}
                </Typography>
                <Typography variant="body1">
                  {new Date(data.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <UserProjects userId={data.id} />
        </Grid>
      </Grid>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("profile.update.title")}</DialogTitle>
        <DialogContent>
          <form
            onSubmit={(e) => {
              formik.handleSubmit(e);
            }}
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <TextField
                id="username"
                name="username"
                label={t("profile.update.username")}
                fullWidth
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.username && Boolean(formik.errors.username)
                }
                helperText={formik.touched.username && formik.errors.username}
                disabled={formik.isSubmitting}
              />

              <TextField
                id="firstname"
                name="firstName"
                label={t("profile.update.firstname")}
                fullWidth
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
              />

              <TextField
                id="lastname"
                name="lastName"
                label={t("profile.update.lastname")}
                fullWidth
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
              />

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    formik.resetForm();
                    setEditDialogOpen(false);
                  }}
                  disabled={formik.isSubmitting}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  loading={formik.isSubmitting}
                >
                  {t("profile.update.submit")}
                </Button>
              </Box>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Paper>
  );
}

interface UserProjectsProps {
  userId: string;
}

function UserProjects({ userId }: UserProjectsProps) {
  const t = useTranslations();
  const confirm = useConfirm();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const api = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: projects, isLoading } = useQuery(
    api.admin.projectsByUser.queryOptions({
      userId: userId,
      limit: rowsPerPage,
      skip: page * rowsPerPage,
    }),
  );

  const deleteProject = useMutation(
    api.admin.deleteUserProject.mutationOptions({
      onSuccess: () => {
        enqueueSnackbar(t("admin.project.delete.success"), {
          variant: "success",
          key: "admin.project.delete.success",
        });
      },
      onError: () => {
        enqueueSnackbar(t("admin.project.delete.error"), {
          variant: "error",
          key: "admin.project.delete.error",
        });
      },
    }),
  );
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    projectId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(projectId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleModifyProject = () => {
    router.push(`/admin/project/${selectedProject}`);
  };
  const handleDeleteProject = async () => {
    try {
      const value = await confirm({
        title: t("admin.projects.dialog.title"),
        description: t("admin.projects.dialog.description"),
      });

      if (!value.confirmed) return;

      await deleteProject.mutateAsync({
        projectId: selectedProject,
      });
      queryClient.invalidateQueries(
        api.admin.projectsByUser.queryFilter({ userId: userId }),
      );
    } catch (error) {
      console.error("Error deleting project:", error);
    }
    handleMenuClose();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ height: "100%" }}>
      <Typography variant="h6" marginBottom={2}>
        {t("admin.projects.title")}
      </Typography>

      {isLoading ? (
        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("admin.project.label.title")}</TableCell>
                  <TableCell>{t("admin.project.label.public")}</TableCell>
                  <TableCell>{t("admin.project.shared.label")}</TableCell>
                  <TableCell>{t("admin.project.label.collab")}</TableCell>
                  <TableCell>{t("admin.project.label.code")}</TableCell>
                  <TableCell>{t("admin.project.label.date")}</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton variant="text" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={40} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={40} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={40} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={60} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="circular" width={24} height={24} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("admin.project.label.title")}</TableCell>
                  <TableCell>{t("admin.project.label.public")}</TableCell>
                  <TableCell>{t("admin.project.shared.label")}</TableCell>
                  <TableCell>{t("admin.project.label.collab")}</TableCell>
                  <TableCell>{t("admin.project.label.code")}</TableCell>
                  <TableCell>{t("admin.project.label.date")}</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects?.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {t("admin.projects.list.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  projects?.items.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.title}</TableCell>

                      <TableCell>
                        {project.public ? (
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
                        {project.collaborative ? (
                          <CheckIcon color="success" />
                        ) : (
                          <CloseIcon color="error" />
                        )}
                      </TableCell>
                      <TableCell>{project.shareCode}</TableCell>
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
          {projects?.items && projects.items.length > 0 && (
            <TablePagination
              component="div"
              count={projects?.total || 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          )}
        </>
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleModifyProject}>
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

export function UserSkeleton() {
  return (
    <Paper sx={{ width: "100%", p: 4 }}>
      <Skeleton width="200px" height={32} sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Skeleton variant="text" width={120} height={28} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[...Array(7)].map((_, index) => (
                <Box key={index}>
                  <Skeleton variant="text" width={80} height={20} />
                  <Skeleton variant="text" width={150} height={24} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Skeleton variant="text" width={60} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={40} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={40} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={40} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={60} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={40} />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton variant="text" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="circular" width={20} height={20} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="circular" width={20} height={20} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="circular" width={20} height={20} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={60} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="circular" width={24} height={24} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
