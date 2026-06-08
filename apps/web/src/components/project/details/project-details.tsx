import { Box, Container, Grid, Paper, Skeleton } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { env } from "@/env";
import { useSession } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import { ProjectNotes } from "./project-notes";
import {
  ProjectTranscript,
  TranscriptErrorFallback,
} from "./project-transcript";
import { SideBar } from "./sidebar";
import { ProjectDescription, ProjectHeader } from "./summary";
import { ProjectVision, ProjectVisionFallback } from "./vision";

export function ProjectDetails({ projectId }: { projectId: string }) {
  const { data: session } = useSession();
  const api = useTRPC();
  const { data: project } = useSuspenseQuery(
    api.project.byId.queryOptions({ id: projectId }),
  );
  return (
    <Box
      sx={{
        backgroundColor: "brand.orange",
        minHeight: "100vh",
        paddingY: 2,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          sx={{
            paddingY: 2,
            paddingX: 2,
            margin: 0,
            backgroundColor: "brand.green",
            minHeight: "100vh",
            shadow: 0,
          }}
        >
          <ProjectHeader project={project} />
          <Grid
            container
            direction="row"
            spacing={2}
            sx={{
              alignItems: "flex-start",
            }}
          >
            <Grid
              size={{
                xs: 12,
                md: 8,
                lg: 8,
              }}
            >
              <ProjectDescription project={project} />

              {session ? (
                <ErrorBoundary FallbackComponent={() => <Box>Failed</Box>}>
                  <Suspense
                    fallback={
                      <Skeleton
                        variant="rectangular"
                        height={200}
                        sx={{ borderRadius: 2, my: 2 }}
                      />
                    }
                  >
                    <ProjectNotes project={project} user={session?.user} />
                  </Suspense>
                </ErrorBoundary>
              ) : null}
              <ErrorBoundary FallbackComponent={TranscriptErrorFallback}>
                <Suspense
                  fallback={
                    <Skeleton
                      variant="rectangular"
                      height={300}
                      sx={{ borderRadius: 2, my: 2 }}
                    />
                  }
                >
                  <ProjectTranscript project={project} user={session?.user} />
                </Suspense>
              </ErrorBoundary>

              <ErrorBoundary FallbackComponent={ProjectVisionFallback}>
                <Suspense
                  fallback={
                    <Skeleton
                      variant="rectangular"
                      height={300}
                      sx={{ borderRadius: 2, my: 2 }}
                    />
                  }
                >
                  <ProjectVision project={project} user={session?.user} />
                </Suspense>
              </ErrorBoundary>
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 4,
                lg: 4,
              }}
            >
              <SideBar project={project} />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
