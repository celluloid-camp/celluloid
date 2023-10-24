import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";
import {
  Avatar,
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

import { ProjectById, ProjectMembers, UserMe } from "~utils/trpc";

import { ExportPanel } from "./ExportPanel";
import { PlaylistSideBar } from "./PlaylistSideBar";
import { ProjectEditPanel } from "./ProjectEditPanel";

interface SideBarProps {
  project: ProjectById;
  user?: UserMe;
}

export const SideBar: React.FC<SideBarProps> = ({ project, user }) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Stack direction={"row"} spacing={1} sx={{ mb: 2, minHeight: 25 }}>
        {project.public && (
          <Chip
            label={t("project.public")}
            size="small"
            icon={<PublicIcon />}
          />
        )}

        {project.collaborative && (
          <Chip
            label={t("project.collaborative")}
            size="small"
            icon={<GroupsIcon />}
          />
        )}
      </Stack>

      <PlaylistSideBar project={project} />

      {user && <ProjectEditPanel project={project} user={user} />}

      {user && project.userId == user.id ? (
        <Paper
          sx={{
            paddingX: 3,
            marginY: 2,
            paddingY: 3,
          }}
        >
          {/*{((user && !isOwner(project, user)) && (user && !isMember(project, user))
      && (user && !isAdmin(user)) && project.shared) &&
        <div className={classes.button}>
          <ButtonProgress
            variant="contained"
            color="primary"
            size="small"
            fullWidth={true}
            loading={unshareLoading}
            onClick={onClickShare}
          >
            {`rejoindre`}
          </ButtonProgress>
        </div>
      } */}

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
                <Avatar sx={{ background: project.user.color }}>
                  {project.user.initial}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={project.user.username}
                secondary={project.user.role}
              />
            </ListItem>

            {project.members.map((member: ProjectMembers) => (
              <ListItem key={member.id}>
                <ListItemAvatar>
                  <Avatar sx={{ background: member.user?.color }}>
                    {member.user?.initial}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.user?.username}
                  secondary={member.user?.role}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : null}

      {user && <ExportPanel project={project} user={user} />}
    </Box>
  );
};
