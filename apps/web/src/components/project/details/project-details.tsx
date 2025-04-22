import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import type { ProjectById } from "@/lib/trpc/types";
import { Box, Container, Grid, Paper, Skeleton } from "@mui/material";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { projectFallbackRender } from "./error-fallback";
import { ProjectNotes } from "./project-notes";
import {
  ProjectTranscript,
  TranscriptErrorFallback,
} from "./project-transcript";
import dynamic from "next/dynamic";
import { ProjectSummary } from "./summary";

const SideBar = dynamic(() => import("./sidebar").then((mod) => mod.SideBar), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Skeleton
        variant="rectangular"
        sx={{
          borderRadius: 2,
          width: "100%",
          height: 200,
          paddingY: 2,
        }}
      />
      <Skeleton
        variant="rectangular"
        sx={{
          borderRadius: 2,
          width: "100%",
          height: 100,
          paddingY: 2,
        }}
      />
    </Box>
  ),
});

export function ProjectDetails({ projectId }: { projectId: string }) {
  const { data: session } = useSession();
  const [project] = trpc.project.byId.useSuspenseQuery({ id: projectId });
  return (
    <Box
      sx={{
        backgroundColor: "brand.orange",
        minHeight: "100vh",
        paddingY: 3,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          sx={{
            paddingY: 2,
            paddingX: 4,
            margin: 0,
            backgroundColor: "brand.green",
            minHeight: "100vh",
          }}
        >
          <Grid container direction="row" alignItems="flex-start" spacing={4}>
            <Grid item xs={12} md={8} lg={8}>
              <ProjectSummary project={project} user={session?.user} />
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
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <SideBar project={project} />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
