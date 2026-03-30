import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  colors,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type * as React from "react";
import { Avatar } from "@/components/common/avatar";
import type { User } from "@/lib/auth-client";
import type { ProjectById } from "@/lib/trpc/types";
import dayjs from "@/utils/dayjs";
import { peerTubeWatchUrl } from "@/utils/peertube-url";

interface Props {
  project: ProjectById;
}

export function ProjectHeader({ project }: Props) {
  const t = useTranslations();

  return (
    <Box sx={{ paddingBottom: 2 }}>
      {project?.playlist ? (
        <Typography
          align="justify"
          variant="body1"
          sx={{ fontFamily: "abril_fatfaceregular" }}
        >
          {t("project.summary.playlist.title")}
          {project.playlist.title}
        </Typography>
      ) : null}

      <Typography align="left" variant="h4">
        {project.title}
      </Typography>

      <Box
        display="flex"
        sx={{
          mt: 1,
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 1,
        }}
      >
        <Avatar
          sx={{
            background: project.user.color,
            borderWidth: 1,
            borderColor: project.user.color,
            borderStyle: "solid",
          }}
          src={project.user.image ?? undefined}
        >
          {project.user.initial}
        </Avatar>
        <Box display="flex" flexDirection={"column"} sx={{ ml: 0 }}>
          <Typography>{project.user.username}</Typography>
          <Typography variant="caption">
            {dayjs(project.publishedAt).format("DD/MM/YYYY")}
          </Typography>
        </Box>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ flexWrap: "wrap", pt: 1 }}
      >
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
        {project.keywords?.map((k) => (
          <Chip key={k} label={k} size="small" />
        ))}
      </Stack>
    </Box>
  );
}

export function ProjectDescription({ project }: Props) {
  const t = useTranslations();

  return (
    <Box sx={{ padding: 0 }}>
      <Card sx={{ maxHeight: 300 }}>
        <CardHeader
          title={t("project.description")}
          sx={{ p: 2, borderBottom: `1px solid ${colors.grey[300]}` }}
          action={
            project.editable ? (
              <Link href={`/project/${project.id}/edit`}>
                <Button variant="text" size="small" startIcon={<EditIcon />}>
                  {t("project.edit.button")}
                </Button>
              </Link>
            ) : null
          }
        />
        <CardContent
          sx={{
            py: 2,
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          <Typography>{project.description}</Typography>
          <Typography align="left" gutterBottom={true} variant="body2">
            <a
              href={peerTubeWatchUrl(project.host, project.videoId)}
              target="_blank"
              rel="noreferrer"
            >
              {t("project.videoUrlHelper")}
            </a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
