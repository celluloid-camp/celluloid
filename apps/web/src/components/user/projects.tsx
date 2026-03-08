"use client";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ProjectThumbnail } from "@/components/common/project-thumbnail";
import { useTRPC } from "@/lib/trpc/client";
import { StyledTitle } from "../common/typography";

export function UserPublicProjects({ userId }: { userId: string }) {
  const t = useTranslations();

  const api = useTRPC();
  const { data, error, isFetching } = useSuspenseQuery(
    api.user.publicProjects.queryOptions({
      userId,
    }),
  );

  return (
    <Box sx={{ padding: 5 }}>
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
              <StyledTitle marginBlock={3} variant="h4">
                Projets publics
              </StyledTitle>
              <Grid container spacing={5}>
                {data.items.map((project) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={project.id}>
                    <ProjectThumbnail showPublic={true} project={project} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {data.items.length === 0 && (
            <Typography
              variant="h3"
              align="center"
              gutterBottom={true}
              sx={{
                pt: 4,
                pb: 1,
              }}
            >
              Aucun projet public
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
              {t("errors.UNKNOWN")}
            </Typography>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
