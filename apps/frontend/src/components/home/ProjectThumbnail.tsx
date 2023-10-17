import { ProjectGraphRecord } from "@celluloid/types";
import GroupsIcon from "@mui/icons-material/Groups";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import PublicIcon from "@mui/icons-material/Public";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Grow,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import Image from "mui-image";
import * as React from "react";
import { useNavigate } from "react-router";

import { ProjectUserAvatar } from "~components/ProjectUserAvatar";

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
  const navigate = useNavigate();

  const handleClick = () => {
    // navigate(`/project/${project.id}`);
    window.location.assign(`/project/${project.id}`);
    // navigate(`/project/${project.id}`, { replace: true });
  };

  return (
    <Grow in={true} appear={true} key={project.id}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 0,
          backgroundColor: "transparent",
          overflow: "visible",
        }}
        onClick={handleClick}
      >
        <StyledBox>
          <Image
            src={project.thumbnailURL}
            duration={500}
            showLoading={<CircularProgress />}
            bgColor="#000000"
          />

          {project.playlist && (
            <Box
              sx={{
                position: "absolute",
                right: 5,
                bottom: 5,
              }}
            >
              <Stack direction={"row"} spacing={1}>
                <Chip
                  size="small"
                  label={project.playlist?._count.projects}
                  icon={<PlaylistPlayIcon />}
                />
              </Stack>
            </Box>
          )}
        </StyledBox>

        <StyledCardContent
          sx={{ paddingX: 1, paddingTop: 2, paddingBottom: 0 }}
        >
          <Grid container>
            <Grid item={true} xs={12}>
              <Typography variant="body2" fontWeight={"bold"} noWrap>
                {project.title}
              </Typography>
            </Grid>
            <Grid item={true} xs={12}>
              <ProjectUserAvatar project={project} />
            </Grid>
            {/* <Grid item={true} xs={12}>
              <Stack direction="row" spacing={1}>
                {project.public && (
                  <Chip size="small" label={"public"} icon={<PublicIcon />} />
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
    </Grow>
    // </ThemeProvider>
  );
};

export default ProjectThumbnail;
