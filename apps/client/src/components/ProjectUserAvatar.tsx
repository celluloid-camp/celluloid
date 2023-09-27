import { ProjectGraphRecord } from "@celluloid/types";
import { Box, BoxProps, Typography } from "@mui/material";
import React from "react";

import { UserAvatar } from "./UserAvatar";

type ProjectUserAvatarProps = BoxProps & {
  project: ProjectGraphRecord;
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
