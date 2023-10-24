import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Typography,
} from "@mui/material";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";

import { ProjectById, trpc } from "~utils/trpc";

interface Props {
  project: ProjectById;
}

const ProjectSummary: React.FC<Props> = ({ project }: Props) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ padding: 0 }}>
      {project && project.playlist ? (
        <Typography align="justify" variant="body1">
          <Trans i18nKey="project.summary.playlist.title">
            Liste de lecture :{" "}
          </Trans>
          {project.playlist.title}
        </Typography>
      ) : null}

      <Typography align="left" variant="h3">
        {project.title}
      </Typography>

      <Box display="flex" alignItems={"center"}>
        <Avatar sx={{ background: project.user.color }}>
          {project.user.initial}
        </Avatar>
        <Box display="flex" flexDirection={"column"} sx={{ marginLeft: 1 }}>
          <Typography>{project.user.username}</Typography>
          <Typography variant="caption">
            {new Date(project.publishedAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      <Card sx={{ my: 2 }}>
        <CardContent>
          <Typography
            align="left"
            gutterBottom={true}
            variant="body2"
            fontWeight={"bold"}
            sx={{
              marginBottom: 2,
            }}
          >
            <Trans i18nKey={"project.description"}>Description</Trans>
          </Typography>
          <Typography gutterBottom={true} variant="body2">
            {project.description}
          </Typography>

          <Typography
            align="left"
            gutterBottom={true}
            variant="body2"
            fontWeight={"bold"}
            sx={{
              marginTop: 2,
            }}
          >
            <Trans i18nKey={"project.URL_title"} />
          </Typography>

          <Typography align="left" gutterBottom={true} variant="body2">
            <a
              href={`https://${project.host}/w/${project.videoId}`}
              target="_blank"
              rel="noreferrer"
            >
              <Trans i18nKey={"project.videoUrlHelper"} />
            </a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectSummary;
