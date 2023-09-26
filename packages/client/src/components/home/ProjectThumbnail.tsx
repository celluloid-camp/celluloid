import { ProjectGraphRecord } from "@celluloid/types";
import {
  Box,
  Card,
  CardContent,
  Grid,
  styled,
  Typography,
} from "@mui/material";
// import PlayIcon from "@mui/icons-material/PlayCircleOutline";
import * as React from "react";

import { ProjectThumbnailImage } from "~components/ProjectThumbnailImage";
import { ProjectUserAvatar } from "~components/ProjectUserAvatar";
// import { connect } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { AnyAction, Dispatch } from "redux";

const StyledBox = styled(Box)(() => ({
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 10,
    left: -10,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
  },
}));

const StyledCardContent = styled(CardContent)(() => ({
  "&.MuiCardContent-root:last-child": {
    paddingBottom: "0px",
  },
}));

interface Props {
  showPublic?: boolean;
  project: ProjectGraphRecord;
}

const ProjectThumbnail: React.FC<Props> = ({ project }) => {
  const onClick = () => {
    // navigate(`/projects/${project.id}`);
    window.location.assign(`/projects/${project.id}`);
  };

  return (
    // <ThemeProvider theme={modalTheme}>
    // <Grow
    //   style={{ transformOrigin: "0 0 0" }}
    //   in={true}
    //   appear={true}
    //   key={project.id}
    // >
    <Card
      elevation={0}
      sx={{
        borderRadius: 0,
        backgroundColor: "transparent",
        overflow: "visible",
      }}
      onClick={() => onClick()}
    >
      <StyledBox>
        <ProjectThumbnailImage
          host={project.host}
          videoId={project.videoId}
          height={"20vh"}
          bgColor="#000000"
        />
        {/* <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 94,
              right: 0,
            }}
          >
            <PlayCircleIcon
              sx={{ color: "white", fontSize: 100, opacity: 0.8 }}
            />
          </Box> */}
      </StyledBox>

      <StyledCardContent sx={{ paddingX: 1, paddingTop: 2, paddingBottom: 0 }}>
        <Grid container>
          <Grid item={true} xs={12}>
            <Typography variant="h6" noWrap>
              {project.title}
            </Typography>
            <Typography gutterBottom={true} noWrap>
              {project.objective}
            </Typography>
          </Grid>
          <Grid item={true} xs={12}>
            <ProjectUserAvatar project={project} />
          </Grid>
          {/* <Grid item={true} xs={12}>
              <Stack direction="row" spacing={1}>
                {showPublic && (
                  <VisibilityChip show={project.public} label="public" />
                )}
                <VisibilityChip
                  show={project.collaborative}
                  label="collaboratif"
                />
              </Stack>
            </Grid> */}
        </Grid>
      </StyledCardContent>
    </Card>
    // </Grow>
    // </ThemeProvider>
  );
};

export default ProjectThumbnail;
