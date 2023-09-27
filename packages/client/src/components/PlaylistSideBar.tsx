import {
  Box,
  ButtonBase,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import * as React from "react";
import { Trans } from "react-i18next";

import { ProjectById } from "~utils/trpc";

import { ProjectThumbnailImage } from "./ProjectThumbnailImage";

export const PlaylistSideBar: React.FC<{ project: ProjectById }> = ({
  project,
}) => {
  const handleClick = (id: string) => {
    // navigate(`/projects/${id}`, { replace: true });
    window.location.assign(`/projects/${id}`);
  };

  if (!project.playlist) return null;

  return (
    <Box
      sx={{
        backgroundColor: "white",
        paddingX: 3,
        marginY: 2,
        paddingY: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" mb={2}>
        <Trans i18nKey={"project.playlist"}>Liste de lecture</Trans>
      </Typography>

      <List
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
          <ListItem key={p.id}>
            <ButtonBase
              sx={{ height: "100%" }}
              onClick={() => handleClick(p.id)}
            >
              <Stack
                sx={[
                  { backgroundColor: "black" },
                  project.id == p.id
                    ? {
                        borderWidth: 2,
                        borderStyle: "solid",
                        borderColor: "primary.main",
                      }
                    : {},
                ]}
                width={150}
                height={100}
              >
                <ProjectThumbnailImage
                  bgColor="#000000"
                  host={p.host}
                  videoId={p.videoId}
                />
                <Stack flex={1} marginX={1} marginBottom={1}>
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
    </Box>
  );
};
