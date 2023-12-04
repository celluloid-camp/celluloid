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

interface SideBarProps {
  project: ProjectById;
  user?: UserMe;
}

export const MemberListPanel: React.FC<SideBarProps> = ({ project, user }) => {
  const { t } = useTranslation();

  return (
    <Paper
      sx={{
        paddingX: 3,
        marginY: 2,
        paddingY: 3,
      }}
    >
      <Typography variant="h6" mb={2}>
        {t("project.members", { count: project._count.members })}
      </Typography>
      <List
        dense={true}
        sx={{
          width: "100%",
          maxWidth: 360,
          bgcolor: "neutral.100",
          position: "relative",
          overflow: "auto",
          borderRadius: 2,
          minHeight: 300,
          maxHeight: 300,
          "& ul": { padding: 0 },
        }}
      >
        <ListItem>
          <ListItemAvatar>
            <Avatar
              src={project.user.avatar?.publicUrl}
              sx={{
                background: project.user.color,
                borderWidth: 2,
                borderColor: project.user.color,
                borderStyle: "solid",
              }}
            >
              {project.user.initial}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={project.user.username}
            secondaryTypographyProps={{ variant: "caption" }}
            secondary={<TransUserRole role={project.user.role} />}
          />
        </ListItem>

        {project.members.map((member: ProjectMembers) => (
          <ListItem key={member.id}>
            <ListItemAvatar>
              <Avatar
                sx={{
                  background: member.user?.color,
                  borderWidth: 2,
                  borderColor: member.user?.color,
                  borderStyle: "solid",
                }}
                src={member.user?.avatar?.publicUrl}
              >
                {member.user?.initial}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              secondaryTypographyProps={{ variant: "caption" }}
              primary={member.user?.username}
              secondary={<TransUserRole role={member.user.role} />}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
