import { Box, Link } from "@mui/material";
import type * as React from "react";

import type { ProjectById, UserMe } from "~utils/trpc";

import { ExportPanel } from "./ExportPanel";
import { MemberListPanel } from "./MemberListPanel";
import { PlaylistSideBar } from "./PlaylistSideBar";
import { ProjectEditPanel } from "./ProjectEditPanel";
import { SharePanel } from "./SharePanel";

interface SideBarProps {
  project: ProjectById;
  user?: UserMe;
}

export const SideBar: React.FC<SideBarProps> = ({ project, user }) => {
  return (
    <Box>
      {user?.id === project.userId ? (
        <>
          <ProjectEditPanel project={project} />
        </>
      ) : null}
      <PlaylistSideBar project={project} />
      {user ? (
        <Box>
          <SharePanel project={project} user={user} />
          <MemberListPanel project={project} user={user} />
          <ExportPanel project={project} user={user} />
          <Link to={`/project/${project.id}/stats`}>Stats</Link>
        </Box>
      ) : null}
    </Box>
  );
};
