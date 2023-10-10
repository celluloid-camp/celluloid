import { Box, BoxProps, Typography } from "@mui/material";
import React from "react";

import { ProjectById } from "~utils/trpc";

import { UserAvatar } from "../UserAvatar";

type ProjectUserAvatarProps = BoxProps & {
  project: ProjectById;
};

export const ProjectUserAvatar: React.FC<ProjectUserAvatarProps> = React.memo(
  ({ project }) => (
    <Box display="flex" alignItems={"center"}>
      <UserAvatar username={project.user.username} userId={project.user.id} />
      <Box display="flex" flexDirection={"column"} sx={{ marginLeft: 1 }}>
        <Typography>{project.user.username}</Typography>
        <Typography variant="caption">
          {new Date(project.publishedAt).toLocaleDateString()}
        </Typography>
      </Box>
    </Box>
  )
);
