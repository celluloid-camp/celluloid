import { ProjectGraphRecord } from "@celluloid/types";
import { Box, Chip, Typography } from "@mui/material";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     section: {
//       marginTop: spacing.unit * 2,
//     },
//     questions: {
//       margin: 0,
//       padding: 0,
//       paddingLeft: spacing.unit * 2 + 2,
//     },
//     tagList: {
//       padding: 0,
//       margin: 0,
//       display: "flex",
//       justifyContent: "left",
//       flexWrap: "wrap",
//     },
//     tag: {
//       marginRight: 4,
//       marginBottom: 4,
//     },
//   });

interface Props {
  project: ProjectGraphRecord;
}

const ProjectSummary: React.FC<Props> = ({ project }: Props) => {
  const { t } = useTranslation();
  return (
    <>
      <Typography align="left" variant="h3" gutterBottom={true}>
        {project.title}
      </Typography>
      {project.tags.length > 0 && (
        <Box
          sx={{
            padding: 0,
            margin: 0,
            display: "flex",
            justifyContent: "left",
            flexWrap: "wrap",
          }}
        >
          {project.tags.map((tag, index) => (
            <Chip
              sx={{
                marginRight: 4,
                marginBottom: 4,
              }}
              key={index}
              label={tag.name}
            />
          ))}
        </Box>
      )}
      <Typography align="justify" gutterBottom={true} variant="subtitle1">
        <b>{project.description}</b>
      </Typography>
      <Typography
        align="left"
        gutterBottom={true}
        variant="h4"
        color="primary"
        sx={{
          marginTop: 2,
        }}
      >
        {t("project.objective")}
      </Typography>
      <Typography align="justify" gutterBottom={true} variant="subtitle1">
        {project.objective}
      </Typography>
      {project.assignments.length > 0 && (
        <>
          <Typography
            align="left"
            gutterBottom={true}
            variant="h4"
            color="primary"
            mt={2}
          >
            <Trans i18nKey={"project.assignment"} />
          </Typography>
          <Typography align="left" gutterBottom={true} variant="subtitle1">
            <ol>
              {project.assignments.map((assignment, index) => (
                <li key={index}>{assignment}</li>
              ))}
            </ol>
          </Typography>
        </>
      )}
      <Typography
        align="left"
        gutterBottom={true}
        variant="h4"
        color="primary"
        sx={{
          marginTop: 2,
        }}
      >
        <Trans i18nKey={"project.URL_title"} />
      </Typography>

      <Typography align="left" gutterBottom={true} variant="subtitle1">
        <a
          href={`https://${project.host}/w/${project.videoId}`}
          target="_blank"
          rel="noreferrer"
        >
          <Trans i18nKey={"project.videoUrlHelper"} />
        </a>
      </Typography>
    </>
  );
};

export default ProjectSummary;
