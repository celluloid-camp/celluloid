import { Box, CircularProgress, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { StyledTitle } from "~components/typography";
import { trpc } from "~utils/trpc";

import { ProjectThumbnail } from "./ProjectThumbnail";

export const MyProjectGrid: React.FC = () => {
  const { t } = useTranslation();

  const { data, error, isFetching } = trpc.project.list.useQuery({
    authoredOnly: true,
  });

  return (
    <Box sx={{ padding: 5, backgroundColor: "brand.orange" }}>
      <Container maxWidth="lg">
        {isFetching || !data ? (
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
        ) : (
          <Box
            sx={{
              ph: 2,
            }}
          >
            {data.items?.length > 0 && (
              <>
                <StyledTitle gutterBottom={true} variant="h4">
                  {t("home.myProjects")}
                </StyledTitle>
                <Grid container={true} spacing={5} direction="row">
                  {data.items.map((project) => (
                    <Grid xs={12} sm={6} lg={4} xl={3} item key={project.id}>
                      <ProjectThumbnail showPublic={true} project={project} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {data.items.length == 0 && (
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
        )}
      </Container>
    </Box>
  );
};
