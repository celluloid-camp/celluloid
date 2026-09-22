import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  ButtonBase,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Image from "mui-image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import PlaylistFormDialog from "@/components/profile/playlist-form-dialog";
import { useTRPC } from "@/lib/trpc/client";
import type { ProjectById } from "@/lib/trpc/types";

export const Playlist: React.FC<{ project: ProjectById }> = ({ project }) => {
  const router = useRouter();
  const t = useTranslations();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const currentProjectRef = useRef<HTMLLIElement>(null);

  const api = useTRPC();
  const { data: playlist } = useQuery(
    api.project.playlist.queryOptions(
      { playlistId: project.playlistId ?? "" },
      { enabled: !!project.playlistId },
    ),
  );

  const handleClick = (id: string) => {
    router.push(`/project/${id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialogOpen(true);
  };

  // Scroll to current project when component mounts or project changes
  useEffect(() => {
    if (currentProjectRef.current && listRef.current) {
      // Small delay to ensure the list is rendered
      const timer = setTimeout(() => {
        currentProjectRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [project.id, playlist?.projects]);

  if (!project.playlistId || !playlist) return null;

  return (
    <>
      <Card>
        <CardContent sx={{ paddingY: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
              {t("project.playlist")}
            </Typography>
            {playlist?.canEdit && (
              <IconButton
                size="small"
                onClick={handleEditClick}
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          <List
            ref={listRef}
            dense={true}
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              bgcolor: "neutral.100",
              position: "relative",
              overflow: "auto",
              borderRadius: 2,
              "& ul": { padding: 0 },
            }}
          >
            {playlist.projects?.map((p) => (
              <ListItem
                key={p.id}
                ref={project.id === p.id ? currentProjectRef : null}
              >
                <ButtonBase
                  sx={{
                    height: "100%",
                    overflow: "hidden",
                    borderRadius: 1,
                    borderColor:
                      project.id === p.id ? "secondary.main" : "black",
                    borderWidth: 2,
                    borderStyle: "solid",
                    display: "block",
                    textAlign: "left",
                  }}
                  onClick={() => handleClick(p.id)}
                >
                  <Stack sx={{ width: 150 }}>
                    <Box
                      sx={{
                        width: 150,
                        height: 84,
                        bgcolor: "black",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={p.thumbnailURL}
                        showLoading={<CircularProgress />}
                        bgColor="#000000"
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.primary"
                      sx={{
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        px: 1,
                        py: 0.75,
                        bgcolor: "background.paper",
                      }}
                    >
                      {p.title}
                    </Typography>
                  </Stack>
                </ButtonBase>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      {playlist?.canEdit && (
        <PlaylistFormDialog
          mode="edit"
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          playlistId={playlist.id}
        />
      )}
    </>
  );
};
