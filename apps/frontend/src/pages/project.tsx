import ReactPlayer from "@celluloid/react-player";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";

import { AnnotationHints } from "~components/annotation/AnnotationHints";
import { AnnotationPanel } from "~components/annotation/AnnotationPanel";
import { ContextualAnnotations } from "~components/annotation/ContextualAnnotations";
import { ContextualEditor } from "~components/annotation/ContextualEditor";
import { useAnnotationEditorState } from "~components/annotation/useAnnotationEditor";
import ProjectSummary from "~components/project/ProjectSummary";
import { SideBar } from "~components/project/SideBar";
import { useVideoPlayerProgressValue } from "~components/project/useVideoPlayer";
import { VideoPlayer } from "~components/project/VideoPlayer";
import { useVideoPlayerEvent } from "~hooks/use-video-player";
import { AnnotationByProjectId, trpc } from "~utils/trpc";
import { ProjectById, UserMe } from "~utils/trpc";

interface Props {
  project: ProjectById;
  user?: UserMe;
}

const ProjectMainGrid: React.FC<Props> = ({ project, user }) => {
  const videoPlayerRef = React.useRef<ReactPlayer>(null);

  const utils = trpc.useUtils();
  const videoProgress = useVideoPlayerProgressValue();
  const [playerIsReady, setPlayerIsReady] = React.useState(false);

  const [annotations] = trpc.annotation.byProjectId.useSuspenseQuery({
    id: project.id,
  });

  const { contextualEditorVisible, formVisible, showHints } =
    useAnnotationEditorState();

  useVideoPlayerEvent((event) => {
    // console.log("useVideoPlayerEvent", event);
    if (event.state == "READY") {
      setPlayerIsReady(true);
    }
  });

  trpc.annotation.onAdd.useSubscription(undefined, {
    onData() {
      // addMessages([post]);
      utils.annotation.byProjectId.invalidate();
    },
    onError(err) {
      console.error('Subscription error:', err);
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
      container
      sx={{
        backgroundColor: "black",
        height: "60vh",
        minHeight: "60vh",
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
          url={`https://${project.host}/w/${project.videoId}`}
        />
      </Grid>
      <Grid item xs={4} sx={{ marginY: 2 }}>
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
  const { data: project } = trpc.project.byId.useQuery({ id: projectId });

  if (!project) return null;

  return <ProjectContent project={project} user={user} />;
};
export default ProjectPage;
