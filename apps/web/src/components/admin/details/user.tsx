"use client";
import { trpc } from "@/lib/trpc/client";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
} from "@mui/material";
import { User } from "@prisma/client";

import { BackButton } from "@/components/common/back-button";
import type { AdminGetUserById } from "@/lib/trpc/types";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { LoadingButton } from "@mui/lab";
import { Skeleton } from "@mui/material";
import { useFormik } from "formik";
import { useConfirm } from "material-ui-confirm";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { useState } from "react";
import * as Yup from "yup";

export function UserDetails({ data }: { data: AdminGetUserById }) {
  const t = useTranslations();

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(),
    firstName: Yup.string().required(),
    lastName: Yup.string().required(),
  });
  const { enqueueSnackbar } = useSnackbar();

  const mutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      enqueueSnackbar(t("profile.update.success"), {
        variant: "success",
        key: "profile.update.success",
      });
      utils.admin.getUserById.invalidate({ id: data.id });
    },
    onError: () => {
      enqueueSnackbar(t("profile.update.error"), {
        variant: "error",
        key: "profile.update.error",
      });
    },
  });
  const utils = trpc.useUtils();

  const formik = useFormik({
    initialValues: {
      username: data.username,
      firstName: data.firstname ?? "",
      lastName: data.lastname ?? "",
      email: data.email,
      role: data.role,
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

        utils.admin.getUserById.invalidate({ id: data.id });
      } catch (error) {
        console.error("Error updating user:", error);
      }
    },
  });

  return (
    <Paper sx={{ width: "100%", p: 4 }}>
      <Box sx={{ display: "flex", marginBottom: 4 }}>
        <BackButton href="/admin" ariaLabel="back to users list" />
        <Typography variant="h5">{t("profile.update.title")}</Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              flexGrow: 1,
            }}
          >
            <TextField
              id="username"
              name="username"
              label={t("profile.update.username")}
              fullWidth
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
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
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              flexGrow: 1,
            }}
          >
            <TextField
              id="email"
              name="email"
              label="Email"
              fullWidth
              value={formik.values?.email}
              disabled
            />

            <TextField
              id="role"
              name="role"
              label="Role"
              fullWidth
              value={formik.values.role}
              disabled
            />
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <LoadingButton
            variant="contained"
            type="submit"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting || !formik.dirty}
          >
            {t("profile.update.submit")}
          </LoadingButton>
        </Box>
      </form>

      <UserProjects userId={data.id} />
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
  const utils = trpc.useUtils();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: projects, isLoading } = trpc.admin.projectsByUser.useQuery({
    userId: userId,
    limit: rowsPerPage,
    skip: page * rowsPerPage,
  });

  const deleteProject = trpc.admin.deleteUserProject.useMutation({
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
      utils.admin.projectsByUser.invalidate({ userId: userId });
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
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" marginBottom={2}>
        {t("admin.projects.title")}
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
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
    <Paper sx={{ width: "100%", p: 2 }}>
      <Skeleton width="200px" height={32} sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 2,
          maxWidth: "500px",
        }}
      >
        <Skeleton variant="rectangular" height={56} width="100%" />
        <Skeleton variant="rectangular" height={56} width="100%" />
        <Skeleton variant="rectangular" height={56} width="100%" />

        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
      </Box>
    </Paper>
  );
}
