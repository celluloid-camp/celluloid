import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Avatar } from "~components/Avatar";
import { TransUserRole } from "~components/TransUserRole";
import { ProjectById, ProjectMembers, UserMe } from "~utils/trpc";

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
