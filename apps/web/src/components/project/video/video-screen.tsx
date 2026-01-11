"use client";
import { AnnotationShape } from "@celluloid/db";
import type ReactPlayer from "@celluloid/react-player";
import { Grid } from "@mui/material";
import { useMeasure } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo } from "react";
import {
  useVideoPlayerProgress,
  useVideoPlayerState,
} from "@/components/video-player/store";
import { useVideoPlayerEvent } from "@/hooks/use-video-player";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import type { AnnotationByProjectId, ProjectById } from "@/lib/trpc/types";
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
  const videoPlayerRef = React.useRef<ReactPlayer>(null);

  const videoPlayerState = useVideoPlayerState();
  const [ref, { width, height }] = useMeasure();

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

  const shapeAnnotations = useMemo<AnnotationShapeWithMetadata[]>(
    () =>
      visibleAnnotations
        .filter(
          (annotation) =>
            annotation.extra !== null && annotation.extra !== undefined,
        )
        .map((annotation) => {
          const extra = annotation.extra as AnnotationShape;
          return {
            ...annotation.extra,
            id: extra.id ?? annotation.id,
            type: extra.type ?? "point",
            x: extra.relativeX ?? extra.x,
            y: extra.relativeY ?? extra.y,
            pause: annotation.pause,
            startTime: annotation.startTime,
            metadata: {
              color: annotation.user.color,
              initial: annotation.user.initial,
              username: annotation.user.username,
              avatar: annotation.user.avatar?.publicUrl,
              text: annotation.text,
            },
          };
        }),
    [visibleAnnotations],
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
      }}
    >
      <Grid item xs={8} ref={ref} sx={{ position: "relative" }}>
        {contextualEditorVisible ? <ShapesEditor /> : null}
        {!formVisible && !showHints && shapeAnnotations.length > 0 ? (
          <ShapesViewer
            shapes={shapeAnnotations}
            width={width ?? 0}
            height={height ?? 0}
            onClick={() => {
              if (videoPlayerState === "PAUSED") {
                videoPlayerRef.current?.getInternalPlayer().play();
              } else {
                videoPlayerRef.current?.getInternalPlayer().pause();
              }
            }}
          />
        ) : null}
        {showHints ? (
          <AnnotationOverlayHints
            project={project}
            annotations={annotations}
            onClick={handleAnnotionHintClick}
          />
        ) : null}
        <VideoVision projectId={project.id} />
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
          paddingX: 2,
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
