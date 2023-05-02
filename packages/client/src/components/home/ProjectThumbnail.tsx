import { ProjectGraphRecord } from "@celluloid/types";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Grow,
  Paper,
  Stack,
  styled,
  Typography,
} from "@mui/material";
// import PlayIcon from "@mui/icons-material/PlayCircleOutline";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { ProjectUserAvatar } from "~components/ProjectUserAvatar";
import { UserAvatar } from "~components/UserAvatar";
import VisibilityChip from "~components/VisibilityChip";
// import { connect } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { AnyAction, Dispatch } from "redux";
import VideoApi from "~services/VideoService";

const StyledBox = styled(Box)(({ theme }) => ({
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

// const styles = ({ palette, spacing, typography }: Theme) =>
//   createStyles({
//     card: {
//       height: "100%",
//       "& a:any-link": {
//         textDecoration: "none",
//       },
//       transition: "all 0.2s ease",
//       cursor: "pointer",
//     },
//     image: {
//       height: spacing.unit * 27,
//       textAlign: "center",
//       padding: spacing.unit * 6,
//       position: "relative",
//     },
//     visibilityContainer: {
//       display: "flex",
//       flexDirection: "column",
//       justifyContent: "flex-start",
//       alignItems: "flex-end",
//       position: "absolute",
//       right: 0,
//       top: 0,
//       padding: spacing.unit,
//     },
//     visibilityChip: {
//       backgroundColor: palette.secondary.dark,
//       color: "white",
//       margin: spacing.unit,
//     },
//     tagList: {
//       display: "flex",
//       justifyContent: "flex-start",
//       flexWrap: "wrap",
//       paddingTop: spacing.unit * 3,
//     },
//     tag: {
//       margin: spacing.unit / 2,
//     },
//     iconWrapper: {
//       position: "relative",
//       top: 0,
//       left: 0,
//       right: 0,
//     },
//     icon: {
//       width: spacing.unit * 7,
//       height: spacing.unit * 7,
//       color: palette.grey[100],
//     },
//     title: {
//       position: "relative",
//       color: palette.grey[100],
//       lineHeight: 1.25,
//       textAlign: "left",
//     },
//     titleWrapper: {
//       display: "flex",
//       flexDirection: "column",
//       justifyContent: "center",
//       height: spacing.unit * 9,
//       padding: spacing.unit * 2,
//       position: "absolute",
//       zIndex: 3,
//       bottom: 0,
//       right: 0,
//       left: 0,
//       backgroundColor: "rgba(0, 0, 0, 0.7)",
//     },
//     objective: {
//       height: spacing.unit * 2,
//       ...typography.subtitle1,
//       fontWeight: 500,
//       color: palette.grey[800],
//       lineHeight: 1.25,
//       textAlign: "left",
//     },
//     username: {
//       paddingTop: spacing.unit * 3,
//       color: palette.grey[700],
//       textAlign: "left",
//     },
//     publishedAt: {
//       color: palette.grey[600],
//       textAlign: "left",
//     },
//   });

interface Props {
  showPublic: boolean;
  project: ProjectGraphRecord;
}

const ProjectThumbnail: React.FC<Props> = ({ project, showPublic }) => {
  const query = useQuery({
    queryKey: ["video", project.host, project.videoId],
    queryFn: () => VideoApi.getPeerTubeVideo(project.host, project.videoId),
  });

  const onClick = () => {
    // navigate(`/projects/${project.id}`);
    window.location.assign(`/projects/${project.id}`);
  };

  return (
    <Grow
      style={{ transformOrigin: "0 0 0" }}
      in={true}
      appear={true}
      key={project.id}
    >
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
          <CardMedia
            component="img"
            sx={{ position: "relative" }}
            height="194"
            image={`https://${project.host}${query.data?.thumbnailPath}`}
          />
          <Box
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
          </Box>
        </StyledBox>

        <CardContent sx={{ paddingX: 1, paddingY: 2 }}>
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
        </CardContent>
      </Card>
    </Grow>
  );
};

export default ProjectThumbnail;
