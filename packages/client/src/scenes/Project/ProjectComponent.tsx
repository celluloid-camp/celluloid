import { ProjectGraphRecord } from "@celluloid/types";
import { Box, Grid } from "@mui/material";

import ProjectSummary from "~components/ProjectSummary";

import SideBar from "./components/SideBar";
import Video from "./scenes/Video";

interface Props {
  project?: ProjectGraphRecord;
  onVideoChange(): void;
}

const ProjectComponent = ({ project }: Props) => (
  <Box sx={{ minHeight: "calc(100vh - 64px)" }}>
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
        {project && <Video project={project} />}
      </Box>
    </Box>
    <Box
      sx={(theme) => ({
        padding: theme.spacing(3),
        minHeight: "calc(100% - 64px)",
        maxWidth: 1024,
        margin: "0 auto",
      })}
    >
      {project && (
        <Grid
          container={true}
          direction="row"
          alignItems="flex-start"
          spacing={16}
        >
          <Grid item={true} xs={12} md={8} lg={9}>
            <ProjectSummary project={project} />
          </Grid>
          <Grid
            sx={{
              textAlign: "left",
            }}
            item={true}
            xs={12}
            md={4}
            lg={3}
          >
            <SideBar project={project} />
          </Grid>
        </Grid>
      )}
    </Box>
  </Box>
);
export default ProjectComponent;
