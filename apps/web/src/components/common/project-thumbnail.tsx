import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import PeopleIcon from "@mui/icons-material/People";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Link,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/common/avatar";
import { Image } from "@/components/common/image";
import type { ProjectListItem } from "@/lib/trpc/types";
import dayjs from "@/utils/dayjs";
import { formatDuration } from "@/utils/duration";

interface Props {
  showPublic?: boolean;
  project: ProjectListItem;
}

export function ProjectThumbnail({ project }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/project/${project.id}`);
  };

  return (
    // </Fade>
    // </ThemeProvider>
    <Card
      elevation={0}
      sx={{
        borderRadius: 0,
        backgroundColor: "transparent",
        cursor: "pointer",
      }}
    >
      <Box
        onClick={handleClick}
        sx={{
          borderRadius: 2,
          border: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: 10,
            bottom: 10,
            zIndex: 10,
          }}
        >
          <Stack direction={"row"} spacing={1}>
            <Box
              sx={{
                px: 0.5,
                backgroundColor: "black",
                color: "white",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" color={"white"}>
                {formatDuration(project.duration)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            overflow: "hidden",
            position: "relative",
            height: 200,
            minHeight: 200,
            border: 0,
            borderRadius: 2,
            backgroundColor: "black",
            "& img": {
              transition:
                "transform 1.5s cubic-bezier(0.22, 1, 0.36, 1) !important",
              display: "block",
            },
            "&:hover img": {
              transform: "scale(1.08) !important",
            },
          }}
        >
          <Image src={project.thumbnailURL} alt={project.title} />
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          paddingX: 1,
          paddingTop: 2,
          paddingBottom: 0,
        }}
      >
        <Avatar
          sx={{
            backgroundColor: project.user?.color,
            borderWidth: 2,
            borderColor: project.user?.color,
            borderStyle: "solid",
            width: 36,
            height: 36,
            textDecoration: "none",
          }}
          src={project.user?.image ?? undefined}
          onClick={() => {
            router.push(`/user/${project.userId}`);
          }}
        >
          {project.user?.initial}
        </Avatar>
        <Stack spacing={0}>
          <Typography
            noWrap
            sx={{
              fontWeight: "bold",
            }}
          >
            {project.title}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="body2">{project.user?.username}</Typography>
            <Typography
              variant="caption"
              sx={{
                color: "grey.700",
              }}
            >
              {dayjs(project.publishedAt).fromNow(true)}
            </Typography>
          </Box>
        </Stack>

        {/* <Box
          display={"flex"}
          justifyContent={"flex-end"}
          alignItems={"flex-end"}
          justifyItems={"flex-end"}
          flex={1}
        >
          <Stack direction={"row"} spacing={1}>
            {project._count.annotations > 0 ? (
              <Chip
                size="small"
                label={project._count.annotations}
                icon={<CommentOutlinedIcon />}
                variant="outlined"
                sx={{ px: 0.5 }}
              />
            ) : null}
            <Chip
              size="small"
              label={project.members.length}
              variant="outlined"
              icon={<PeopleIcon />}
              sx={{ px: 0.5 }}
            />
          </Stack>
        </Box> */}
      </Box>
    </Card>
  );
}
