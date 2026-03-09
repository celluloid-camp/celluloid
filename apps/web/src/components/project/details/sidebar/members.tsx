import { List, ListItem, Paper, Stack, Typography } from "@mui/material";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type * as React from "react";
import { Avatar } from "@/components/common/avatar";
import { useLocaleRole } from "@/i18n/roles";
import type { User } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import type { ProjectById } from "@/lib/trpc/types";

interface SideBarProps {
  project: ProjectById;
  user?: User;
}

export const Members: React.FC<SideBarProps> = ({ project }) => {
  const t = useTranslations();

  const localeRole = useLocaleRole();

  const api = useTRPC();
  const { data: members } = useSuspenseQuery(
    api.project.members.queryOptions({ projectId: project.id }),
  );

  return (
    <Paper
      sx={{
        paddingX: 3,
        marginY: 2,
        paddingY: 3,
      }}
    >
      <Typography variant="h6" mb={2}>
        {t("project.members", {
          count: members.length == 0 ? 1 : members.length,
        })}
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
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={project.user.image ?? undefined}
              sx={{
                background: project.user.color,
                borderWidth: 2,
                borderColor: project.user.color,
                borderStyle: "solid",
              }}
            >
              {project.user.initial}
            </Avatar>
            <Stack direction="column" spacing={0}>
              <Typography variant="body2">{project.user.username}</Typography>
              <Typography fontSize={10}>
                {localeRole(project.user.role ?? null)}
              </Typography>
            </Stack>
          </Stack>
        </ListItem>

        {members?.map((member) => (
          <ListItem key={member.id}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  background: member.user?.color,
                  borderWidth: 2,
                  borderColor: member.user?.color,
                  borderStyle: "solid",
                }}
                src={member.user?.image ?? undefined}
              >
                {member.user?.initial}
              </Avatar>
              <Stack direction="column" spacing={0}>
                <Typography variant="body2">{member.user?.username}</Typography>
                <Typography fontSize={10}>
                  {localeRole(member.user?.role ?? null)}
                </Typography>
              </Stack>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
