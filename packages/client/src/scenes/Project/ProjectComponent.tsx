import { ProjectGraphRecord } from "@celluloid/types";
import { Box, Container, Grid, Paper } from "@mui/material";

import ProjectSummary from "~components/ProjectSummary";

import SideBar from "./components/SideBar";
import Video from "./scenes/Video";

interface Props {
  project: ProjectGraphRecord;
  onVideoChange(): void;
}

const ProjectComponent = ({ project }: Props) => (
  <Box>
    <Box
      sx={{
        width: "100%",
        height: "100%",
        textAlign: "center" as const,
        backgroundColor: "black",
      }}
    >
      <Box
        sx={{
          height: "100%",
          maxWidth: 1024,
          margin: "0 auto",
        }}
      >
        <Video project={project} />
      </Box>
    </Box>

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
            <SideBar project={project} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  </Box>
);
export default ProjectComponent;
