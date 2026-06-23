"use client";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BackButton } from "@/components/common/back-button";
import { useTRPC } from "@/lib/trpc/client";
import type { AdminGetUserById } from "@/lib/trpc/types";

function getUserInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        className="text-xs font-semibold tracking-wide text-slate-500 uppercase"
      >
        {label}
      </Typography>
      <Box className="mt-1">{children}</Box>
    </Box>
  );
}

export function UserDetails({ data }: { data: AdminGetUserById }) {
  const t = useTranslations();
  const api = useTRPC();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const editUserSchema = z.object({
    username: z.string().min(1, t("profile.update.username")),
    firstName: z.string().min(1, t("profile.update.firstname")),
    lastName: z.string().min(1, t("profile.update.lastname")),
  });

  type EditUserFormValues = z.infer<typeof editUserSchema>;

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

  const verifyEmailMutation = useMutation(
    api.admin.verifyUserEmail.mutationOptions({
      onSuccess: () => {
        enqueueSnackbar(t("admin.users.verifyEmail.success"), {
          variant: "success",
          key: "admin.users.verifyEmail.success",
        });
        queryClient.invalidateQueries(
          api.admin.getUserById.queryFilter({ id: data.id }),
        );
      },
      onError: () => {
        enqueueSnackbar(t("admin.users.verifyEmail.error"), {
          variant: "error",
          key: "admin.users.verifyEmail.error",
        });
      },
    }),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: data.username,
      firstName: data.firstname ?? "",
      lastName: data.lastname ?? "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: EditUserFormValues) => {
    try {
      await mutation.mutateAsync({
        userId: data.id,
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      reset();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const value = await confirm({
        title: t("admin.users.verifyEmail.dialog.title"),
        description: t("admin.users.verifyEmail.dialog.description"),
      });

      if (!value.confirmed) return;

      await verifyEmailMutation.mutateAsync({ userId: data.id });
    } catch (error) {
      console.error("Error verifying email:", error);
    }
  };

  return (
    <Paper
      elevation={0}
      className="w-full overflow-hidden rounded-2xl border border-black/5 bg-white p-4 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)] sm:p-6"
    >
      <Box className="mb-6 flex items-center gap-3">
        <BackButton href="/admin" ariaLabel="back to users list" />
        <Box>
          <Typography
            variant="h5"
            className="font-semibold tracking-tight text-slate-900"
          >
            {data.username}
          </Typography>
          <Typography variant="body2" className="text-slate-500">
            {data.email}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            className="overflow-hidden rounded-xl border border-black/5"
          >
            <Box className="flex items-start justify-between gap-3 border-b border-black/5 bg-slate-50/80 px-4 py-4">
              <Box className="flex items-center gap-3">
                <Box className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                  {getUserInitials(data.username || "?")}
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    className="font-semibold text-slate-900"
                  >
                    {t("profile.update.title")}
                  </Typography>
                  <Typography variant="caption" className="text-slate-500">
                    {data.role}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={() => setEditDialogOpen(true)}
                size="small"
                className="text-slate-400 hover:bg-white hover:text-slate-700"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box className="flex flex-col gap-4 p-4">
              <DetailField label={t("profile.update.username")}>
                <Typography
                  variant="body1"
                  className="font-medium text-slate-900"
                >
                  {data.username}
                </Typography>
              </DetailField>

              <DetailField label={t("users.table.email")}>
                <Typography variant="body1" className="text-slate-700">
                  {data.email}
                </Typography>
              </DetailField>

              <DetailField label={t("profile.update.firstname")}>
                <Typography variant="body1" className="text-slate-700">
                  {data.firstname || "-"}
                </Typography>
              </DetailField>

              <DetailField label={t("profile.update.lastname")}>
                <Typography variant="body1" className="text-slate-700">
                  {data.lastname || "-"}
                </Typography>
              </DetailField>

              <DetailField label={t("users.table.role")}>
                <span
                  className={
                    data.role === "admin"
                      ? "inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize"
                      : "inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize"
                  }
                >
                  {data.role}
                </span>
              </DetailField>

              <DetailField label={t("users.table.emailVerified")}>
                <Box className="flex flex-wrap items-center gap-2">
                  <Chip
                    label={
                      data.emailVerified
                        ? t("common.verified")
                        : t("common.unverified")
                    }
                    size="small"
                    icon={data.emailVerified ? <CheckIcon /> : <CloseIcon />}
                    className={
                      data.emailVerified
                        ? "border border-emerald-200 bg-emerald-50 font-medium text-emerald-700"
                        : "border border-slate-200 bg-slate-100 font-medium text-slate-600"
                    }
                  />
                  {!data.emailVerified && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleVerifyEmail}
                      loading={verifyEmailMutation.isPending}
                      className="normal-case"
                    >
                      {t("admin.users.verifyEmail.action")}
                    </Button>
                  )}
                </Box>
              </DetailField>

              <DetailField label={t("users.table.createAt")}>
                <Typography variant="body1" className="text-slate-700">
                  {new Date(data.createdAt).toLocaleDateString()}
                </Typography>
              </DetailField>
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
        slotProps={{
          paper: {
            className: "rounded-2xl",
          },
        }}
      >
        <DialogTitle className="font-semibold">
          {t("profile.update.title")}
        </DialogTitle>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }}
          >
            <Box className="flex flex-col gap-4 pt-1">
              <TextField
                id="username"
                label={t("profile.update.username")}
                fullWidth
                {...register("username")}
                error={Boolean(errors.username)}
                helperText={errors.username?.message}
                disabled={isSubmitting}
              />

              <TextField
                id="firstname"
                label={t("profile.update.firstname")}
                fullWidth
                {...register("firstName")}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName?.message}
              />

              <TextField
                id="lastname"
                label={t("profile.update.lastname")}
                fullWidth
                {...register("lastName")}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName?.message}
              />

              <Box className="flex justify-end gap-2">
                <Button
                  variant="outlined"
                  onClick={() => {
                    reset();
                    setEditDialogOpen(false);
                  }}
                  disabled={isSubmitting}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  loading={isSubmitting}
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
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
        }}
      >
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
