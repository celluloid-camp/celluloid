import { Box } from "@mui/material";
import type * as React from "react";

import type { ProjectById } from "@/lib/trpc/types";

import { ExportPanel } from "./sidebar/export-panel";
import { Members } from "./sidebar/members";
import { Playlist } from "./sidebar/playlist";
import { Share } from "./sidebar/share";
import type { User } from "@/lib/auth-client";

interface SideBarProps {
  project: ProjectById;
  user?: User;
}

export const SideBar: React.FC<SideBarProps> = ({ project, user }) => {
  return (
    <Box>
      <Playlist project={project} />
      {user ? (
        <Box>
          <Share project={project} user={user} />
          <Members project={project} user={user} />
          <ExportPanel project={project} />
        </Box>
      ) : null}
    </Box>
  );
};
