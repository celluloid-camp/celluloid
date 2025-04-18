"use client";
import { useVideoPlayerEvent } from "@/hooks/use-video-player";
import { useSession } from "@/lib/auth-client";
import type ReactPlayer from "@celluloid/react-player";
import { Grid } from "@mui/material";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { AnnotationOverlayHints } from "./annotation/overlay-hints";
import { useAnnotationEditorState } from "./annotation/useAnnotationEditor";

import { useVideoPlayerProgress } from "@/components/video-player/store";
import { trpc } from "@/lib/trpc/client";
import type { AnnotationByProjectId, ProjectById } from "@/lib/trpc/types";
import { ContextualOverlay } from "./annotation/contextual/overlay";
import { ContextualOverlayEditor } from "./annotation/contextual/overlay-editor";
import { VideoPanel } from "./video-panel";

const VideoPlayer = dynamic(
  () => import("../../video-player").then((mod) => mod.default),
  { ssr: false },
);

interface Props {
  project: ProjectById;
}

export function ProjectVideoScreen({ project }: Props) {
  const videoPlayerRef = React.useRef<ReactPlayer>(null);

  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const videoProgress = useVideoPlayerProgress();
  const [playerIsReady, setPlayerIsReady] = React.useState(false);

  const [annotations] = trpc.annotation.byProjectId.useSuspenseQuery({
    id: project.id,
  });

  const { contextualEditorVisible, formVisible, showHints } =
    useAnnotationEditorState();

  useVideoPlayerEvent((event) => {
    if (event.state === "READY") {
      setPlayerIsReady(true);
    }
  });

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

  const visibleAnnotations = useMemo(
    () =>
      playerIsReady && annotations
        ? annotations.filter(
            (annotation) =>
              videoProgress >= annotation.startTime &&
              videoProgress <= annotation.stopTime,
          )
        : [],
    [annotations, videoProgress, playerIsReady],
  );

  useEffect(() => {
    const position = videoPlayerRef.current?.getCurrentTime();
    const paused = visibleAnnotations.filter(
      (annotation) =>
        annotation.pause && annotation.startTime === Math.floor(videoProgress),
    );

    if (paused.length > 0 && position) {
      videoPlayerRef.current?.getInternalPlayer().pause();
      videoPlayerRef.current?.seekTo(position + 1, "seconds");
    }
  }, [visibleAnnotations, videoProgress]);

  useEffect(() => {
    if (formVisible && videoPlayerRef) {
      videoPlayerRef.current?.getInternalPlayer().pause();
    }
  }, [formVisible]);

  const handleAnnotionHintClick = (annotation: AnnotationByProjectId) => {
    videoPlayerRef.current?.seekTo(annotation.startTime, "seconds");
  };

  return (
    <Grid
      container
      sx={{
        backgroundColor: "black",
        height: "60vh",
        minHeight: "60vh",
        maxHeight: "60vh",
        paddingX: 2,
      }}
    >
      <Grid item xs={8} sx={{ position: "relative" }}>
        {contextualEditorVisible ? <ContextualOverlayEditor /> : null}
        {!formVisible && !showHints ? (
          <ContextualOverlay annotations={visibleAnnotations} />
        ) : null}
        {showHints ? (
          <AnnotationOverlayHints
            project={project}
            annotations={annotations}
            onClick={handleAnnotionHintClick}
          />
        ) : null}
        <VideoPlayer
          ref={videoPlayerRef}
          height={"100%"}
          url={`https://${project.host}/w/${project.videoId}`}
        />
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          height: "100%",
          position: "relative",
          paddingY: 2,
        }}
      >
        <VideoPanel
          project={project}
          annotations={visibleAnnotations}
          annotationCount={annotations.length}
          playerIsReady={playerIsReady}
          user={session?.user}
        />
      </Grid>
    </Grid>
  );
}
