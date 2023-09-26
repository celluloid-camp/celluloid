import { ButtonBase, List, ListItem, Stack, Typography } from "@mui/material";
import * as React from "react";
import { Trans } from "react-i18next";

import { trpc } from "~utils/trpc";

import { ProjectThumbnailImage } from "./ProjectThumbnailImage";

export const PlaylistSideBar: React.FC<{ projectId: string }> = ({
  projectId,
}) => {
  const { data, isFetching } = trpc.project.byId.useQuery({ id: projectId });

  const handleClick = (id: string) => {
    // navigate(`/projects/${id}`, { replace: true });
    window.location.assign(`/projects/${id}`);
  };

  if (isFetching) return null;

  if (
    data &&
    data.playlist &&
    data.playlist.projects &&
    data.playlist.projects.length == 0
  )
    return null;

  return (
    <>
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
        {data?.playlist?.projects.map((project) => (
          <ListItem key={project.id}>
            <ButtonBase
              sx={{ height: "100%" }}
              onClick={() => handleClick(project.id)}
            >
              <Stack
                sx={[
                  { backgroundColor: "black" },
                  projectId == project.id
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
                  host={project.host}
                  videoId={project.videoId}
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
                    {project.title}
                  </Typography>
                </Stack>
              </Stack>
            </ButtonBase>
          </ListItem>
        ))}
      </List>
    </>
  );
};
