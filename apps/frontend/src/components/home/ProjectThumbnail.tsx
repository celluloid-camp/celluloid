import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fade,
  Grid,
  Grow,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import Image from "mui-image";
import type * as React from "react";
import { useNavigate } from "react-router";

import { Avatar } from "~components/Avatar";
import type { ProjectListItem } from "~utils/trpc";

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
  project: ProjectListItem;
}

const ProjectThumbnail: React.FC<Props> = ({ project }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    // <Fade in={true} appear={true} key={project.id}>
    <Card
      elevation={0}
      sx={{
        borderRadius: 0,
        backgroundColor: "transparent",
        overflow: "visible",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "scale(1.05)",
        },
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
              right: 10,
              bottom: 10,
            }}
          >
            <Stack direction={"row"} spacing={1}>
              {project._count.annotations > 0 ? (
                <Chip
                  size="small"
                  label={project._count.annotations}
                  icon={<CommentOutlinedIcon />}
                />
              ) : null}
              <Chip
                size="small"
                label={project.playlist?._count.projects}
                icon={<PlaylistPlayIcon />}
              />
            </Stack>
          </Box>
        )}
      </StyledBox>

      <StyledCardContent sx={{ paddingX: 1, paddingTop: 2, paddingBottom: 0 }}>
        <Grid container spacing={1}>
          <Grid item={true} xs={12}>
            <Typography fontWeight={"bold"} noWrap>
              {project.title}
            </Typography>
          </Grid>
          <Grid item={true} xs={12}>
            <Box display="flex" alignItems={"center"}>
              <Avatar
                sx={{
                  backgroundColor: project.user.color,
                  borderWidth: 2,
                  borderColor: project.user.color,
                  borderStyle: "solid",
                }}
                src={project.user.avatar?.publicUrl}
              >
                {project.user.initial}
              </Avatar>
              <Stack sx={{ ml: 1 }} spacing={0}>
                <Typography variant="body2">{project.user.username}</Typography>
                <Typography variant="caption" color={"grey.700"}>
                  {dayjs(project.publishedAt).fromNow(true)}
                </Typography>
              </Stack>
            </Box>
          </Grid>
          {/* <Grid item={true} xs={12}>
              <Stack direction="row" spacing={1}>
                {project.public && (
                  <Chip size="small" label={"public"} icon={<PublicIcon />} />
                )}
              </Stack>
            </Grid> */}
        </Grid>
      </StyledCardContent>
    </Card>
    // </Fade>
    // </ThemeProvider>
  );
};

export default ProjectThumbnail;
