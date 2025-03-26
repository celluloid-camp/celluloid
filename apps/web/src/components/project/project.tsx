"use client";

import { trpc } from "@/lib/trpc/client";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Skeleton,
} from "@mui/material";
import { Suspense } from "react";
import { ProjectDetails } from "./details/project-details";
import { ProjectVideoScreen } from "./video/video-screen";

export function ProjectMainScreen({ projectId }: { projectId: string }) {
  const [project] = trpc.project.byId.useSuspenseQuery({ id: projectId });

  return (
    <Box display={"flex"} flexDirection={"column"}>
      <Suspense
        fallback={
          <Box
            display={"flex"}
            alignContent={"center"}
            justifyContent={"center"}
            alignItems={"center"}
            sx={{
              backgroundColor: "black",
              height: "60vh",
              minHeight: "60vh",
            }}
          >
            <CircularProgress sx={{ color: "white" }} />
          </Box>
        }
      >
        <ProjectVideoScreen project={project} />
      </Suspense>

      <ProjectDetails projectId={projectId} />
    </Box>
  );
}
