import { Box, Container, Grid } from "@mui/material";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import { AnnotationPanel } from "~components/annotation/AnnotationPanel";
import ProjectSummary from "~components/project/ProjectSummary";
import { SideBar } from "~components/project/SideBar";
import { VideoPlayer } from "~components/project/VideoPlayer";
import { trpc } from "~utils/trpc";
import { ProjectById, UserMe } from "~utils/trpc";

interface Props {
  project: ProjectById;
  user?: UserMe;
  onVideoChange(): void;
}

const ProjectContent = ({ project, user }: Props) => (
  <Box>
    <Grid
      container
      spacing={2}
      px={10}
      sx={{
        backgroundColor: "black",
      }}
    >
      <Grid item xs={9}>
        <VideoPlayer project={project} user={user} />
      </Grid>
      <Grid item xs={3}>
        <AnnotationPanel project={project} user={user} />
      </Grid>
    </Grid>

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
