import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  styled,
  Typography,
} from "@mui/material";
// import PlayIcon from "@mui/icons-material/PlayCircleOutline";
import { useQuery } from "@tanstack/react-query";
import Image from "mui-image";
import * as React from "react";

// import { ProjectUserAvatar } from "~components/ProjectUserAvatar";
import { getPeerTubeVideoData } from "~services/VideoService";

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
  project: {
    id: string;
    host?: string | null;
    videoId: string;
    title: string;
    objective: string;
  };
}

export const ProjectThumbnail: React.FC<Props> = ({ project }) => {
  const query = useQuery({
    queryKey: ["video", project.host, project.videoId],
    queryFn: () =>
      getPeerTubeVideoData(
        `https://${project.host}/api/v1/videos/${project.videoId}`
      ),
  });

  const onClick = () => {
    // navigate(`/projects/${project.id}`);
    window.location.assign(`/projects/${project.id}`);
  };

  return (
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
        <Image
          src={`https://${project.host}${query.data?.thumbnailPath}`}
          height={"20vh"}
          showLoading={<CircularProgress />}
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
            {/* <ProjectUserAvatar project={project} /> */}
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
    // </ThemeProvider>
  );
};
