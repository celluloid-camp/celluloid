import ReactPlayer from "@celluloid/react-player";
import { Box, Container, Grid } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { AnnotationHints } from "~components/annotation/AnnotationHints";
import { AnnotationPanel } from "~components/annotation/AnnotationPanel";
import ProjectSummary from "~components/project/ProjectSummary";
import { SideBar } from "~components/project/SideBar";
import { VideoPlayer } from "~components/project/VideoPlayer";
import { useVideoPlayerEvent } from "~hooks/use-video-player";
import { trpc } from "~utils/trpc";
import { ProjectById, UserMe } from "~utils/trpc";

interface Props {
  project: ProjectById;
  user?: UserMe;
}

const ProjectMainGrid: React.FC<Props> = ({ project, user }) => {
  const videoPlayerRef = React.useRef<ReactPlayer>(null);

  const [showHints, setShowHints] = useState(false);
  const [videoProgress, setVideoProgress] = React.useState(0);
  const [playerIsReady, setPlayerIsReady] = React.useState(false);

  const { data: annotations } = trpc.annotation.byProjectId.useQuery({
    id: project.id,
  });

  useVideoPlayerEvent((event) => {
    console.log(event);
    if (event.state == "READY") {
      setPlayerIsReady(true);
    }
    setVideoProgress(event.progress);
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

    if (paused && position) {
      videoPlayerRef.current?.getInternalPlayer().pause();
      videoPlayerRef.current?.seekTo(position + 1, "seconds");
    }
  }, [visibleAnnotations, videoPlayerRef, videoProgress]);

  const handleAnnotionHintClick = (annotation) => {};

  if (!annotations) {
    return null;
  }

  return (
    <Grid
      container
      sx={{
        backgroundColor: "black",
        height: "60vh",
        paddingX: 2,
      }}
    >
      <Grid item xs={8}>
        {showHints ? (
          <AnnotationHints
            project={project}
            annotations={annotations}
            onClick={handleAnnotionHintClick}
            onClose={() => setShowHints(false)}
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
          user={user}
          onShowHintsClick={() => setShowHints(!showHints)}
        />
      </Grid>
    </Grid>
  );
};

const ProjectContent = ({ project, user }: Props) => (
  <Box display={"flex"} flexDirection={"column"}>
    <ProjectMainGrid project={project} user={user} />

    <Box
      sx={{
        backgroundColor: "brand.orange",
        paddingY: 3,
      }}
    >
      <Container
        sx={{
          paddingTop: 4,
          paddingBottom: 10,
          borderRadius: 2,
          backgroundColor: "brand.green",
        }}
        maxWidth="lg"
      >
        <Grid container direction="row" alignItems="flex-start" spacing={4}>
          <Grid item xs={12} md={8} lg={8}>
            <ProjectSummary project={project} />
          </Grid>
          <Grid item xs={12} md={4} lg={4}>
            <SideBar project={project} user={user} />
          </Grid>
        </Grid>
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
