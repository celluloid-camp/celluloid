import { ProjectGraphRecord } from "@celluloid/types";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import * as R from "ramda";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { StyledTitle } from "~components/typography";
import { useMe, useProjects } from "~hooks/use-user";
import { isAdmin, isMember, isOwner } from "~utils/ProjectUtils";

import { ProjectThumbnail } from "./ProjectThumbnail";

export const MyProjectGrid: React.FC = () => {
  const { data: user } = useMe();
  const { data: projects = [], error, isLoading } = useProjects();

  const { t } = useTranslation();

  const sort = R.sortWith([R.descend(R.prop("publishedAt"))]);

  const sorted = sort(projects) as ProjectGraphRecord[];

  const userProjects = R.filter(
    (project: ProjectGraphRecord) =>
      !!user &&
      (isOwner(project, user) || isMember(project, user) || isAdmin(user))
  )(sorted);

  const noProjects = !error && userProjects.length === 0;

  return (
    <Box sx={{ padding: 5, backgroundColor: "brand.orange" }}>
      <Container maxWidth="lg">
        {isLoading ? (
          <Box
            mx={2}
            my={10}
            display={"flex"}
            alignContent={"center"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Box>
              <CircularProgress />
            </Box>
          </Box>
        ) : null}

        <Box
          sx={{
            ph: 2,
          }}
        >
          {userProjects.length > 0 && (
            <>
              <StyledTitle gutterBottom={true} variant="h4">
                {t("home.myProjects")}
              </StyledTitle>
              <Grid container={true} spacing={5} direction="row">
                {userProjects.map((project: ProjectGraphRecord) => (
                  <Grid xs={12} sm={6} lg={4} xl={3} item>
                    <ProjectThumbnail
                      showPublic={true}
                      project={project}
                      key={project.id}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {!isLoading && noProjects && (
            <Typography
              variant="h3"
              align="center"
              gutterBottom={true}
              sx={{
                pt: 4,
                pb: 1,
              }}
            >
              {t("home.emptySearchResult")}
            </Typography>
          )}
          {error ? (
            <Typography
              variant="h6"
              align="center"
              gutterBottom={true}
              sx={{
                pt: 4,
                pb: 1,
              }}
            >
              {t("ERR_UNKOWN")}
            </Typography>
          ) : null}
        </Box>
      </Container>
    </Box>
  );
};
