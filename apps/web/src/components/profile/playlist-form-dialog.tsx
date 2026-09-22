"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConfirm } from "material-ui-confirm";
import Image from "mui-image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  BootstrapDialog,
  StyledDialogTitle,
} from "@/components/common/styled-dialog";
import { useTRPC } from "@/lib/trpc/client";

type PlaylistFormDialogProps = {
  open: boolean;
  onClose: () => void;
} & ({ mode: "create" } | { mode: "edit"; playlistId: string });

type FormValues = {
  title: string;
  description: string;
};

type ProjectItem = {
  id: string;
  title: string;
  thumbnailURL: string;
};

const ProjectThumb: React.FC<{ src: string }> = ({ src }) => (
  <Box
    sx={{
      width: 48,
      height: 36,
      borderRadius: 1,
      overflow: "hidden",
      bgcolor: "black",
      flexShrink: 0,
    }}
  >
    <Image
      src={src || "/placeholder.svg"}
      duration={300}
      showLoading={false}
      bgColor="#000000"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
      wrapperStyle={{
        width: "100%",
        height: "100%",
      }}
    />
  </Box>
);

const PlaylistFormDialog: React.FC<PlaylistFormDialogProps> = (props) => {
  const { open, onClose, mode } = props;
  const playlistId = mode === "edit" ? props.playlistId : undefined;

  const t = useTranslations();
  const confirm = useConfirm();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const api = useTRPC();
  const queryClient = useQueryClient();

  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");

  const { data: playlistData, isLoading: isLoadingPlaylist } = useQuery(
    api.playlist.byId.queryOptions(
      { id: playlistId! },
      { enabled: open && mode === "edit" && Boolean(playlistId) },
    ),
  );

  const { data: userProjectsData, isLoading: isLoadingProjects } = useQuery(
    api.user.projects.queryOptions({}, { enabled: open || pickerOpen }),
  );

  const schema = z.object({
    title: z.string().min(1, t("playlist.edit.titleRequired")),
    description: z.string(),
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      reset({ title: "", description: "" });
      setSelectedProjectIds([]);
      setPickerOpen(false);
      setProjectSearch("");
      return;
    }

    if (playlistData) {
      reset({
        title: playlistData.title,
        description: playlistData.description,
      });
      setSelectedProjectIds(playlistData.projects.map((p) => p.id));
      setPickerOpen(false);
      setProjectSearch("");
    }
  }, [open, mode, playlistData, reset]);

  const createMutation = useMutation(
    api.playlist.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(api.user.playlists.queryFilter());
        enqueueSnackbar(t("playlist.create.success"), { variant: "success" });
        onClose();
      },
      onError: () => {
        enqueueSnackbar(t("playlist.create.error"), { variant: "error" });
      },
    }),
  );

  const updateMutation = useMutation(
    api.playlist.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(api.user.playlists.queryFilter());
        if (playlistId) {
          queryClient.invalidateQueries(
            api.playlist.byId.queryFilter({ id: playlistId }),
          );
          queryClient.invalidateQueries(
            api.project.playlist.queryFilter({ playlistId }),
          );
        }
        enqueueSnackbar(t("playlist.edit.success"), { variant: "success" });
        onClose();
      },
      onError: () => {
        enqueueSnackbar(t("playlist.edit.error"), { variant: "error" });
      },
    }),
  );

  const deleteMutation = useMutation(
    api.playlist.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(api.user.playlists.queryFilter());
        enqueueSnackbar(t("playlist.delete.success"), { variant: "success" });
        onClose();
        router.push("/profile/myPlaylists");
      },
      onError: () => {
        enqueueSnackbar(t("playlist.delete.error"), { variant: "error" });
      },
    }),
  );

  const handleDelete = async () => {
    if (!playlistId) return;
    try {
      await confirm({
        title: t("playlist.delete.confirm.title"),
        description: t("playlist.delete.confirm.description"),
        confirmationText: t("deleteAction"),
        cancellationText: t("cancelAction"),
        confirmationButtonProps: {
          variant: "contained",
          color: "error",
        },
      });
      deleteMutation.mutate({ id: playlistId });
    } catch {
      // User cancelled
    }
  };

  const onSubmit = (data: FormValues) => {
    if (mode === "create") {
      createMutation.mutate({
        title: data.title,
        description: data.description,
        projectIds: selectedProjectIds,
      });
      return;
    }

    if (!playlistId) return;
    updateMutation.mutate({
      id: playlistId,
      title: data.title,
      description: data.description,
      projectIds: selectedProjectIds,
    });
  };

  const handleClose = () => {
    reset();
    setSelectedProjectIds([]);
    setPickerOpen(false);
    setProjectSearch("");
    onClose();
  };

  const handlePickerClose = () => {
    setPickerOpen(false);
    setProjectSearch("");
  };

  const allProjects = userProjectsData?.items ?? [];
  const projectsById = useMemo(() => {
    const map = new Map<string, ProjectItem>();
    for (const project of allProjects) {
      map.set(project.id, {
        id: project.id,
        title: project.title,
        thumbnailURL: project.thumbnailURL,
      });
    }
    if (playlistData?.projects) {
      for (const project of playlistData.projects) {
        if (!map.has(project.id)) {
          map.set(project.id, {
            id: project.id,
            title: project.title,
            thumbnailURL: project.thumbnailURL,
          });
        }
      }
    }
    return map;
  }, [allProjects, playlistData?.projects]);

  const selectedProjects = useMemo(
    () =>
      selectedProjectIds
        .map((id) => projectsById.get(id))
        .filter((p): p is ProjectItem => Boolean(p)),
    [selectedProjectIds, projectsById],
  );

  const availableProjects = useMemo(() => {
    const selected = new Set(selectedProjectIds);
    const query = projectSearch.trim().toLowerCase();
    return allProjects.filter((project) => {
      if (selected.has(project.id)) return false;
      if (!query) return true;
      return project.title.toLowerCase().includes(query);
    });
  }, [allProjects, selectedProjectIds, projectSearch]);

  const addProject = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev : [...prev, projectId],
    );
  };

  const removeProject = (projectId: string) => {
    setSelectedProjectIds((prev) => prev.filter((id) => id !== projectId));
  };

  const moveProject = (projectId: string, direction: -1 | 1) => {
    setSelectedProjectIds((prev) => {
      const index = prev.indexOf(projectId);
      if (index < 0) return prev;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item!);
      return next;
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const showEditLoading = mode === "edit" && isLoadingPlaylist;

  const dialogTitle =
    mode === "create"
      ? t("playlist.create.dialog.title")
      : t("playlist.edit.dialog.title");

  if (mode === "edit" && !isLoadingPlaylist && !playlistData && open) {
    return null;
  }

  return (
    <BootstrapDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="body"
    >
      {showEditLoading ? (
        <>
          <StyledDialogTitle onClose={handleClose}>
            {dialogTitle}
          </StyledDialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          </DialogContent>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <StyledDialogTitle onClose={handleClose}>
            {dialogTitle}
          </StyledDialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                fullWidth
                label={t("playlist.edit.title")}
                {...register("title")}
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t("playlist.edit.description")}
                {...register("description")}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
              />

              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t("playlist.edit.projects.current")}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={selectedProjectIds.length}
                      variant="outlined"
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setPickerOpen(true)}
                    >
                      {t("playlist.edit.projects.add")}
                    </Button>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    maxHeight: 320,
                    overflowY: "auto",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  {selectedProjects.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ px: 2, py: 3 }}
                    >
                      {t("playlist.edit.projects.empty")}
                    </Typography>
                  ) : (
                    <List disablePadding dense>
                      {selectedProjects.map((project, index) => (
                        <ListItem
                          key={project.id}
                          dense
                          sx={{ py: 0.75, gap: 0.5 }}
                          secondaryAction={
                            <Stack direction="row" spacing={0}>
                              <IconButton
                                size="small"
                                aria-label={t(
                                  "playlist.edit.projects.moveUp",
                                )}
                                disabled={index === 0}
                                onClick={() => moveProject(project.id, -1)}
                              >
                                <ArrowUpwardIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                aria-label={t(
                                  "playlist.edit.projects.moveDown",
                                )}
                                disabled={
                                  index === selectedProjects.length - 1
                                }
                                onClick={() => moveProject(project.id, 1)}
                              >
                                <ArrowDownwardIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                aria-label={t(
                                  "playlist.edit.projects.remove",
                                )}
                                onClick={() => removeProject(project.id)}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          }
                        >
                          <ListItemAvatar sx={{ minWidth: 56 }}>
                            <ProjectThumb src={project.thumbnailURL} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography noWrap fontWeight={600}>
                                {project.title}
                              </Typography>
                            }
                            secondary={`${index + 1}`}
                            sx={{ pr: 14 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{
              px: 3,
              pb: 2,
              justifyContent: mode === "edit" ? "space-between" : "flex-end",
            }}
          >
            {mode === "edit" && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {t("playlist.delete.button")}
              </Button>
            )}
            <Stack direction="row" spacing={1}>
              <Button
                onClick={handleClose}
                disabled={isSubmitting || isPending}
              >
                {t("playlist.edit.cancel")}
              </Button>
              <Button type="submit" variant="contained" loading={isPending}>
                {mode === "create"
                  ? t("playlist.create.submit")
                  : t("playlist.edit.submit")}
              </Button>
            </Stack>
          </DialogActions>
        </form>
      )}

      <BootstrapDialog
        open={pickerOpen}
        onClose={handlePickerClose}
        maxWidth="sm"
        fullWidth
        scroll="body"
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
      >
        <StyledDialogTitle onClose={handlePickerClose}>
          {t("playlist.edit.projects.add")}
        </StyledDialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              size="small"
              fullWidth
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder={t("playlist.edit.projects.search")}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box
              sx={{
                maxHeight: 360,
                overflowY: "auto",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              {isLoadingProjects ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress size={28} />
                </Box>
              ) : allProjects.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 2, py: 3 }}
                >
                  {t("playlist.edit.projects.noAvailable")}
                </Typography>
              ) : availableProjects.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 2, py: 3 }}
                >
                  {projectSearch.trim()
                    ? t("playlist.edit.projects.noMatch")
                    : t("playlist.edit.projects.noAvailable")}
                </Typography>
              ) : (
                <List disablePadding dense>
                  {availableProjects.map((project) => (
                    <ListItemButton
                      key={project.id}
                      onClick={() => addProject(project.id)}
                      dense
                      sx={{ py: 1 }}
                    >
                      <ListItemAvatar sx={{ minWidth: 56 }}>
                        <ProjectThumb src={project.thumbnailURL} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography noWrap>{project.title}</Typography>
                        }
                      />
                      <IconButton
                        edge="end"
                        size="small"
                        aria-label={t("playlist.edit.projects.add")}
                        onClick={(e) => {
                          e.stopPropagation();
                          addProject(project.id);
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handlePickerClose} variant="contained">
            {t("playlist.edit.projects.done")}
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </BootstrapDialog>
  );
};

export default PlaylistFormDialog;
