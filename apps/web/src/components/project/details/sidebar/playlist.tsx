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
import Image from "mui-image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import EditPlaylistDialog from "@/components/profile/edit-playlist-dialog";
import { useSession } from "@/lib/auth-client";
import type { ProjectById } from "@/lib/trpc/types";

export const Playlist: React.FC<{ project: ProjectById }> = ({ project }) => {
  const router = useRouter();
  const t = useTranslations();
  const { data: session } = useSession();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const currentProjectRef = useRef<HTMLLIElement>(null);

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
  }, [project.id, project.playlist?.projects]);

  if (!project.playlist) return null;

  // Check if user can edit (playlist owner or admin)
  const canEdit =
    session?.user &&
    (project.playlist.userId === session.user.id ||
      session.user.role === "admin");

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
            {canEdit && (
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
            {project.playlist.projects?.map((p) => (
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
                  }}
                  onClick={() => handleClick(p.id)}
                >
                  <Stack
                    sx={[{ backgroundColor: "black" }]}
                    width={150}
                    height={100}
                  >
                    <Image
                      src={p.thumbnailURL}
                      showLoading={<CircularProgress />}
                      bgColor="#000000"
                    />

                    <Stack flex={1} marginX={1} paddingBottom={3}>
                      <Typography
                        variant="caption"
                        color={"white"}
                        sx={{
                          display: "-webkit-box",
                          overflow: "hidden",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 1,
                        }}
                      >
                        {p.title}
                      </Typography>
                    </Stack>
                  </Stack>
                </ButtonBase>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      {canEdit && (
        <EditPlaylistDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          playlistId={project.playlist.id}
        />
      )}
    </>
  );
};
