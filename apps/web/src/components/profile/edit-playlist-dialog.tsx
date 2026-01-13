"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import Image from "mui-image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import type * as React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  BootstrapDialog,
  StyledDialogTitle,
} from "@/components/common/styled-dialog";
import { trpc } from "@/lib/trpc/client";

interface EditPlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  playlistId: string;
}

const EditPlaylistDialog: React.FC<EditPlaylistDialogProps> = ({
  open,
  onClose,
  playlistId,
}) => {
  const t = useTranslations();
  const confirm = useConfirm();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const utils = trpc.useUtils();
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Fetch playlist with projects
  const { data: playlistData, isLoading: isLoadingPlaylist } =
    trpc.playlist.byId.useQuery({ id: playlistId }, { enabled: open });

  // Fetch user's available projects
  const { data: userProjectsData } = trpc.user.projects.useQuery(
    {},
    { enabled: open },
  );

  // Initialize selected projects from playlist
  useEffect(() => {
    if (playlistData?.projects) {
      setSelectedProjectIds(playlistData.projects.map((p) => p.id));
    }
  }, [playlistData]);

  const schema = z.object({
    title: z.string().min(1, t("playlist.edit.titleRequired")),
    description: z.string(),
  });

  type FormValues = z.infer<typeof schema>;

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

  // Update form when playlist data loads
  useEffect(() => {
    if (playlistData) {
      reset({
        title: playlistData.title,
        description: playlistData.description,
      });
    }
  }, [playlistData, reset]);

  const updateMutation = trpc.playlist.update.useMutation({
    onSuccess: () => {
      utils.user.playlists.invalidate();
      utils.playlist.byId.invalidate({ id: playlistId });
      enqueueSnackbar(t("playlist.edit.success"), {
        variant: "success",
      });
      onClose();
    },
    onError: () => {
      enqueueSnackbar(t("playlist.edit.error"), {
        variant: "error",
      });
    },
  });

  const deleteMutation = trpc.playlist.delete.useMutation({
    onSuccess: () => {
      utils.user.playlists.invalidate();
      enqueueSnackbar(t("playlist.delete.success"), {
        variant: "success",
      });
      onClose();
      router.push("/profile/myPlaylists");
    },
    onError: () => {
      enqueueSnackbar(t("playlist.delete.error"), {
        variant: "error",
      });
    },
  });

  const handleDelete = async () => {
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
    } catch (error) {
      // User cancelled
    }
  };

  const onSubmit = (data: FormValues) => {
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
    onClose();
  };

  const handleAddProject = (projectId: string) => {
    if (!selectedProjectIds.includes(projectId)) {
      setSelectedProjectIds([...selectedProjectIds, projectId]);
    }
  };

  const handleRemoveProject = (projectId: string) => {
    setSelectedProjectIds(selectedProjectIds.filter((id) => id !== projectId));
  };

  // Get current projects based on selectedProjectIds (updates immediately)
  const currentProjects =
    userProjectsData?.items.filter((p) => selectedProjectIds.includes(p.id)) ||
    [];

  // Get available projects (user's projects not in selectedProjectIds)
  const availableProjects =
    userProjectsData?.items.filter((p) => !selectedProjectIds.includes(p.id)) ||
    [];

  // Show loading state while fetching playlist data
  if (isLoadingPlaylist) {
    return (
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        scroll="body"
      >
        <StyledDialogTitle onClose={handleClose}>
          {t("playlist.edit.dialog.title")}
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
      </BootstrapDialog>
    );
  }

  // Don't render if playlist data is not available
  if (!playlistData) {
    return null;
  }

  return (
    <BootstrapDialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      scroll="body"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <StyledDialogTitle onClose={handleClose}>
          {t("playlist.edit.dialog.title")}
        </StyledDialogTitle>
        <DialogContent
          sx={{
            height: "50vh",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 3,
              pt: 2,
            }}
          >
            {/* Left Column: Form Fields */}
            <Stack spacing={2} sx={{ width: "50%", flexShrink: 0 }}>
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
                rows={6}
                label={t("playlist.edit.description")}
                {...register("description")}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
              />
            </Stack>

            {/* Right Column: Projects */}
            <Stack spacing={2} sx={{ width: "50%", flexShrink: 0 }}>
              <Box sx={{ px: 1, width: "100%", overflow: "hidden" }}>
                <Typography variant="h6" gutterBottom>
                  {t("playlist.edit.projects.current")}
                </Typography>
                {currentProjects.length > 0 ? (
                  <Box
                    sx={{
                      width: "100%",
                      overflowX: "auto",
                      overflowY: "hidden",
                      "&::-webkit-scrollbar": {
                        height: 8,
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "rgba(0,0,0,0.1)",
                        borderRadius: 4,
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(0,0,0,0.3)",
                        borderRadius: 4,
                      },
                    }}
                  >
                    <List
                      dense={true}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        width: "max-content",
                        minWidth: "100%",
                        gap: 1,
                        py: 1,
                        px: 0,
                        m: 0,
                        "& ul": { padding: 0 },
                      }}
                    >
                      {currentProjects.map((project) => (
                        <ListItem
                          key={project.id}
                          sx={{
                            minWidth: 200,
                            width: 200,
                            flexShrink: 0,
                            p: 0,
                          }}
                        >
                          <Card
                            elevation={0}
                            sx={{
                              borderRadius: 0,
                              backgroundColor: "transparent",
                              width: "100%",
                              position: "relative",
                            }}
                          >
                            <Box
                              sx={{
                                borderRadius: 2,
                                border: "1px solid #000000",
                                overflow: "hidden",
                                position: "relative",
                              }}
                            >
                              <Box
                                sx={{
                                  overflow: "hidden",
                                  height: 120,
                                  "& img": {
                                    transition:
                                      "transform 1.5s cubic-bezier(0.22, 1, 0.36, 1) !important",
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                  },
                                  "&:hover img": {
                                    transform: "scale(1.08) !important",
                                  },
                                }}
                              >
                                <Image
                                  src={
                                    project.thumbnailURL || "/placeholder.svg"
                                  }
                                  duration={500}
                                  showLoading={<CircularProgress />}
                                  bgColor="#000000"
                                  wrapperStyle={{
                                    height: "100%",
                                  }}
                                />
                              </Box>
                              <IconButton
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                  },
                                  zIndex: 10,
                                }}
                                size="small"
                                onClick={() => handleRemoveProject(project.id)}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Box
                              sx={{
                                paddingX: 1,
                                paddingTop: 1,
                                paddingBottom: 0,
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                noWrap
                                sx={{
                                  display: "-webkit-box",
                                  overflow: "hidden",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                }}
                              >
                                {project.title}
                              </Typography>
                            </Box>
                          </Card>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {t("playlist.edit.projects.empty")}
                  </Typography>
                )}
              </Box>

              <Box sx={{ px: 1, width: "100%", overflow: "hidden" }}>
                <Typography variant="h6" gutterBottom>
                  {t("playlist.edit.projects.add")}
                </Typography>
                {availableProjects.length > 0 ? (
                  <Box
                    sx={{
                      width: "100%",
                      overflowX: "auto",
                      overflowY: "hidden",
                      "&::-webkit-scrollbar": {
                        height: 8,
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "rgba(0,0,0,0.1)",
                        borderRadius: 4,
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(0,0,0,0.3)",
                        borderRadius: 4,
                      },
                    }}
                  >
                    <List
                      dense={true}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        width: "max-content",
                        minWidth: "100%",
                        gap: 1,
                        py: 1,
                        px: 0,
                        m: 0,
                        "& ul": { padding: 0 },
                      }}
                    >
                      {availableProjects.map((project) => (
                        <ListItem
                          key={project.id}
                          sx={{
                            minWidth: 200,
                            width: 200,
                            flexShrink: 0,
                            p: 0,
                          }}
                        >
                          <Card
                            elevation={0}
                            sx={{
                              borderRadius: 0,
                              backgroundColor: "transparent",
                              width: "100%",
                              position: "relative",
                            }}
                          >
                            <Box
                              sx={{
                                borderRadius: 2,
                                border: "1px solid #000000",
                                overflow: "hidden",
                                position: "relative",
                              }}
                            >
                              <Box
                                sx={{
                                  overflow: "hidden",
                                  height: 120,
                                  "& img": {
                                    transition:
                                      "transform 1.5s cubic-bezier(0.22, 1, 0.36, 1) !important",
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                  },
                                  "&:hover img": {
                                    transform: "scale(1.08) !important",
                                  },
                                }}
                              >
                                <Image
                                  src={
                                    project.thumbnailURL || "/placeholder.svg"
                                  }
                                  duration={500}
                                  showLoading={<CircularProgress />}
                                  bgColor="#000000"
                                  wrapperStyle={{
                                    height: "100%",
                                  }}
                                />
                              </Box>
                              <IconButton
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                  },
                                  zIndex: 10,
                                }}
                                size="small"
                                onClick={() => handleAddProject(project.id)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Box
                              sx={{
                                paddingX: 1,
                                paddingTop: 1,
                                paddingBottom: 0,
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                noWrap
                                sx={{
                                  display: "-webkit-box",
                                  overflow: "hidden",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                }}
                              >
                                {project.title}
                              </Typography>
                            </Box>
                          </Card>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {t("playlist.edit.projects.noAvailable")}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {t("playlist.delete.button")}
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={handleClose} disabled={isSubmitting}>
              {t("playlist.edit.cancel")}
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={updateMutation.isPending}
              disabled={isSubmitting}
            >
              {t("playlist.edit.submit")}
            </LoadingButton>
          </Stack>
        </DialogActions>
      </form>
    </BootstrapDialog>
  );
};

export default EditPlaylistDialog;
