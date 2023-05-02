import { ProjectGraphRecord } from "@celluloid/types";
import {
  Box,
  Chip,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";

import { ProjectUserAvatar } from "./ProjectUserAvatar";

interface Props {
  project: ProjectGraphRecord;
}

const ProjectSummary: React.FC<Props> = ({ project }: Props) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ padding: 0 }}>
      <Typography align="left" variant="h3" gutterBottom={true}>
        {project.title}
      </Typography>

      <ProjectUserAvatar project={project} />

      <Box
        sx={{
          backgroundColor: "white",
          paddingX: 2,
          marginY: 2,
          paddingY: 2,
          borderRadius: 2,
        }}
      >
        <Typography align="justify" gutterBottom={true} variant="body2">
          <b>{project.description}</b>
        </Typography>

        <Typography
          align="left"
          gutterBottom={true}
          variant="h6"
          sx={{
            marginTop: 2,
          }}
        >
          {t("project.objective")}
        </Typography>
        <Typography align="justify" gutterBottom={true} variant="body2">
          {project.objective}
        </Typography>

        <Typography
          align="left"
          gutterBottom={true}
          variant="h6"
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
      </Box>
    </Box>
  );
};

export default ProjectSummary;
