import type ReactPlayer from "@celluloid/react-player";
import {
  Box,
  CircularProgress,
  Container,
  Fab,
  Grid,
  Grid2,
  Paper,
  Tooltip,
} from "@mui/material";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { AnnotationHints } from "~components/annotation/AnnotationHints";
import { AnnotationPanel } from "~components/annotation/AnnotationPanel";
import { ContextualAnnotations } from "~components/annotation/ContextualAnnotations";
import { ContextualEditor } from "~components/annotation/ContextualEditor";
import {
  useAnnotationEditorState,
  useAnnotationHintsVisible,
} from "~components/annotation/useAnnotationEditor";
import ProjectSummary from "~components/project/ProjectSummary";
import { SideBar } from "~components/project/SideBar";
import { useVideoPlayerProgressValue } from "~components/project/useVideoPlayer";
import { VideoPlayer } from "~components/project/VideoPlayer";
import { useVideoPlayerEvent } from "~hooks/use-video-player";
import { type AnnotationByProjectId, trpc } from "~utils/trpc";
import type { ProjectById, UserMe } from "~utils/trpc";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";

interface Props {
  project: ProjectById;
  user?: UserMe;
}

const ProjectMainGrid: React.FC<Props> = ({ project, user }) => {
  const videoPlayerRef = React.useRef<ReactPlayer>(null);

  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const videoProgress = useVideoPlayerProgressValue();
  const [playerIsReady, setPlayerIsReady] = React.useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>();

  const [annotations] = trpc.annotation.byProjectId.useSuspenseQuery({
    id: project.id,
  });

  const { contextualEditorVisible, formVisible, showHints } =
    useAnnotationEditorState();

  useVideoPlayerEvent((event) => {
    // console.log("useVideoPlayerEvent", event);
    if (event.state === "READY") {
      setPlayerIsReady(true);
    }
  });

  trpc.annotation.onChange.useSubscription(undefined, {
    onData() {
      // addMessages([post]);
      utils.annotation.byProjectId.invalidate();
    },
    onError(err) {
      console.error("Subscription error:", err);
      // we might have missed a message - invalidate cache
      utils.annotation.byProjectId.invalidate();
    },
  });

  const visibleAnnotations = useMemo(
    () =>
      playerIsReady && annotations
        ? annotations.filter(
            (annotation) =>
              videoProgress >= annotation.startTime &&
              videoProgress <= annotation.stopTime
          )
        : [],
    [annotations, videoProgress, playerIsReady]
  );

  useEffect(() => {
    const position = videoPlayerRef.current?.getCurrentTime();
    const paused = visibleAnnotations.filter(
      (annotation) =>
        annotation.pause && annotation.startTime === Math.floor(videoProgress)
    );

    if (paused.length > 0 && position) {
      videoPlayerRef.current?.getInternalPlayer().pause();
      videoPlayerRef.current?.seekTo(position + 1, "seconds");
    }
  }, [visibleAnnotations, videoPlayerRef, videoProgress]);

  const updateContainerHeight = () => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      setContainerHeight(containerHeight);
    }
  };

  useEffect(() => {
    // Initial calculation
    updateContainerHeight();

    // Listen to resize events
    const resizeObserver = new ResizeObserver(() => {
      updateContainerHeight();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (formVisible && videoPlayerRef) {
      videoPlayerRef.current?.getInternalPlayer().pause();
    }
  }, [formVisible, videoPlayerRef]);

  const handleAnnotionHintClick = (annotation: AnnotationByProjectId) => {
    videoPlayerRef.current?.seekTo(annotation.startTime, "seconds");
  };

  return (
    <Grid
      ref={containerRef}
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
        {contextualEditorVisible ? <ContextualEditor /> : null}
        {!formVisible && !showHints ? (
          <ContextualAnnotations annotations={visibleAnnotations} />
        ) : null}
        {showHints ? (
          <AnnotationHints
            project={project}
            annotations={annotations}
            onClick={handleAnnotionHintClick}
          />
        ) : null}
        <VideoPlayer
          ref={videoPlayerRef}
          height={containerHeight}
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
        <AnnotationPanel
          project={project}
          annotations={visibleAnnotations}
          annotationCount={annotations.length}
          playerIsReady={playerIsReady}
          user={user}
        />
      </Grid>
    </Grid>
  );
};

const ProjectContent = ({ project, user }: Props) => (
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
      <ProjectMainGrid project={project} user={user} />
    </Suspense>

    <Box
      sx={{
        backgroundColor: "brand.orange",
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
          }}
        >
          <Grid container direction="row" alignItems="flex-start" spacing={4}>
            <Grid item xs={12} md={8} lg={8}>
              <ProjectSummary project={project} />
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <SideBar project={project} user={user} />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  </Box>
);

const ProjectPage: React.FC = () => {
  const { projectId } = useParams();
  const { data: user } = trpc.user.me.useQuery();
  const { data: project } = trpc.project.byId.useQuery(
    { id: projectId },
    {
      enabled: !!projectId,
    }
  );

  if (!project) return null;

  return <ProjectContent project={project} user={user} />;
};
export default ProjectPage;
