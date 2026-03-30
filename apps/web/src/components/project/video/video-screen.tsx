"use client";
import { Box, CircularProgress, Grid } from "@mui/material";
import { useMeasure } from "@uidotdev/usehooks";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaFullscreenRef,
  useMediaSelector,
} from "media-chrome/react/media-store";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSession } from "@/lib/auth-client";
import type { ProjectById } from "@/lib/trpc/types";
import { useAnnotations } from "@/stores/annotations";
import { ShapesEditor } from "./annotation/shapes-editor";
import { ShapesViewer } from "./annotation/shapes-viewer";
import { useAnnotationEditorState } from "./annotation/useAnnotationEditor";
import { VideoObjectDetection } from "./video-detection";
import { VideoPanel } from "./video-panel";

const VideoPlayer = dynamic(
  () => import("../../video-player").then((mod) => mod.default),
  { ssr: false },
);

/** Tolerance in seconds when matching annotation startTime to media time (player updates at discrete intervals). */
const PAUSE_AT_ANNOTATION_TOLERANCE_SEC = 0.2;

interface Props {
  project: ProjectById;
}

export function ProjectVideoScreen({ project }: Props) {
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);
  const dispatch = useMediaDispatch();
  const fullscreenRefCallback = useMediaFullscreenRef();

  const [ref, { width, height }] = useMeasure();

  const { data: session } = useSession();

  const { currentAnnotations, shapeAnnotations, annotations } = useAnnotations(
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
    const paused = currentAnnotations.filter(
      (annotation) =>
        annotation.pause &&
        Math.abs(mediaCurrentTime - annotation.startTime) <=
          PAUSE_AT_ANNOTATION_TOLERANCE_SEC,
    );

    if (paused.length > 0) {
      dispatch({
        type: MediaActionTypes.MEDIA_SEEK_REQUEST,
        detail: mediaCurrentTime,
      });
      dispatch({ type: MediaActionTypes.MEDIA_PAUSE_REQUEST });
    }
  }, [currentAnnotations, mediaCurrentTime]);

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
      <Grid ref={ref} sx={{ position: "relative" }} size={8}>
        {contextualEditorVisible ? <ShapesEditor /> : null}
        {!formVisible && !showHints && shapeAnnotations.length > 0 ? (
          <ShapesViewer
            shapes={shapeAnnotations}
            width={width ?? 0}
            height={height ?? 0}
          />
        ) : null}
        <VideoObjectDetection projectId={project.id} />

        <VideoPlayer project={project} />
      </Grid>
      <Grid
        sx={{
          height: "100%",
          position: "relative",
          paddingY: 2,
          paddingX: 2,
        }}
        size={4}
      >
        <VideoPanel
          project={project}
          annotations={currentAnnotations}
          annotationCount={annotations?.length ?? 0}
          user={session?.user}
        />
      </Grid>
    </Grid>
  );
}
