"use client";
import { AnnotationShape } from "@celluloid/db";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMeasure } from "@uidotdev/usehooks";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaFullscreenRef,
  useMediaSelector,
} from "media-chrome/react/media-store";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSession } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import type { AnnotationByProjectId, ProjectById } from "@/lib/trpc/types";
import { useAnnotations } from "@/stores/annotations";
import { AnnotationOverlayHints } from "./annotation/overlay-hints";
import { ShapesEditor } from "./annotation/shapes-editor";
import {
  AnnotationShapeWithMetadata,
  ShapesViewer,
} from "./annotation/shapes-viewer";
import { useAnnotationEditorState } from "./annotation/useAnnotationEditor";
import { VideoPanel } from "./video-panel";
import { VideoVision } from "./video-vision";

const VideoPlayer = dynamic(
  () => import("../../video-player").then((mod) => mod.default),
  { ssr: false },
);

interface Props {
  project: ProjectById;
}

export function ProjectVideoScreen({ project }: Props) {
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);
  const dispatch = useMediaDispatch();
  const fullscreenRefCallback = useMediaFullscreenRef();

  const [ref, { width, height }] = useMeasure();

  const { data: session } = useSession();

  const { visibleAnnotations, shapeAnnotations, annotations } = useAnnotations(
    project.id,
  );

  const { contextualEditorVisible, formVisible, showHints } =
    useAnnotationEditorState();

  // trpc.annotation.onChange.useSubscription(undefined, {
  //   onData() {
  //     // addMessages([post]);
  //     utils.annotation.byProjectId.invalidate();
  //   },
  //   onError(err) {
  //     console.error("Subscription error:", err);
  //     // we might have missed a message - invalidate cache
  //     utils.annotation.byProjectId.invalidate();
  //   },
  // });

  useEffect(() => {
    if (!mediaCurrentTime) return;
    const paused = visibleAnnotations.filter(
      (annotation) =>
        annotation.pause &&
        annotation.startTime === Math.floor(mediaCurrentTime),
    );

    if (paused.length > 0) {
      dispatch({
        type: MediaActionTypes.MEDIA_SEEK_REQUEST,
        detail: mediaCurrentTime + 1,
      });
      dispatch({ type: MediaActionTypes.MEDIA_PAUSE_REQUEST });
    }
  }, [visibleAnnotations, mediaCurrentTime]);

  useEffect(() => {
    if (formVisible) {
      dispatch({ type: MediaActionTypes.MEDIA_PAUSE_REQUEST });
    }
  }, [formVisible]);

  return (
    <Grid
      container
      id="fullscreen"
      ref={fullscreenRefCallback}
      sx={{
        backgroundColor: "black",
        height: "60vh",
        minHeight: "60vh",
        maxHeight: "60vh",
      }}
    >
      <Grid item xs={8} ref={ref} sx={{ position: "relative" }}>
        {contextualEditorVisible ? <ShapesEditor /> : null}
        {!formVisible && !showHints && shapeAnnotations.length > 0 ? (
          <ShapesViewer
            shapes={shapeAnnotations}
            width={width ?? 0}
            height={height ?? 0}
          />
        ) : null}
        {showHints ? (
          <AnnotationOverlayHints
            project={project}
            annotations={annotations ?? []}
          />
        ) : null}
        <Suspense>
          <ErrorBoundary
            FallbackComponent={({ error }) =>
              process.env.NODE_ENV === "development" ? (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    inset: 0,
                    display: "flex",
                    pointerEvents: "none",
                    color: "white",
                    zIndex: 1000,
                  }}
                >
                  Failed to load vision
                </Box>
              ) : null
            }
          >
            <VideoVision projectId={project.id} />
          </ErrorBoundary>
        </Suspense>

        <Suspense
          fallback={
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          }
        >
          <VideoPlayer url={`https://${project.host}/w/${project.videoId}`} />
        </Suspense>
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          height: "100%",
          position: "relative",
          paddingY: 2,
          paddingX: 2,
        }}
      >
        <Box>
          <Typography variant="body1" color="white">
            All annotations: {annotations?.length}
          </Typography>
          <Typography variant="body1" color="white">
            Shape annotations: {shapeAnnotations.length}
          </Typography>
          <Typography variant="body1" color="white">
            Visible annotations: {visibleAnnotations.length}
          </Typography>
        </Box>
        <VideoPanel
          project={project}
          annotations={annotations ?? []}
          annotationCount={annotations?.length ?? 0}
          user={session?.user}
        />
      </Grid>
    </Grid>
  );
}
