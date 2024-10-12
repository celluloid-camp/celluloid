import { Box } from "@mui/material";
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
      {user ? <ProjectEditPanel project={project} user={user} /> : null}
      <PlaylistSideBar project={project} />
      {user ? (
        <Box>
          <SharePanel project={project} user={user} />
          <MemberListPanel project={project} user={user} />
          <ExportPanel project={project} user={user} />
        </Box>
      ) : null}
    </Box>
  );
};
