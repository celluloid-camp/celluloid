import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import {
  Box,
  Card,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import Image from "mui-image";
import { useRouter } from "next/navigation";
import type * as React from "react";

interface PlaylistProject {
  id: string;
  title: string;
  thumbnailURL: string;
}

interface PlaylistItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  projects: PlaylistProject[];
  _count: {
    projects: number;
  };
}

interface Props {
  playlist: PlaylistItem;
}

const PlaylistThumbnail: React.FC<Props> = ({ playlist }) => {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to first project in the playlist
    if (playlist.projects.length > 0) {
      router.push(`/project/${playlist.projects[0].id}`);
    }
  };

  // Use the first project's thumbnail as the playlist thumbnail
  const thumbnailURL =
    playlist.projects.length > 0
      ? playlist.projects[0].thumbnailURL
      : "/default-thumbnail.jpg";

  return (
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
          border: "1px solid #000000",
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
              <PlaylistPlayIcon sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption" color={"white"}>
                {playlist._count.projects}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            overflow: "hidden",
            minHeight: 200,
            borderRadius: 2,
            "& img": {
              transition:
                "transform 1.5s cubic-bezier(0.22, 1, 0.36, 1) !important",
              width: "100%",
              height: "auto",
              display: "block",
            },
            "&:hover img": {
              transform: "scale(1.08) !important",
            },
          }}
        >
          <Image
            src={thumbnailURL}
            duration={500}
            showLoading={<CircularProgress />}
            bgColor="#000000"
            wrapperStyle={{
              minHeight: 200,
            }}
          />
        </Box>
      </Box>

      <Box
        display="flex"
        alignItems={"flex-start"}
        gap={1}
        sx={{ paddingX: 1, paddingTop: 2, paddingBottom: 0 }}
      >
        <Stack spacing={0} flex={1}>
          <Typography fontWeight={"bold"} noWrap>
            {playlist.title}
          </Typography>
          <Typography
            variant="body2"
            color={"grey.700"}
            sx={{
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {playlist.description}
          </Typography>
        </Stack>

        <Box
          display={"flex"}
          justifyContent={"flex-end"}
          alignItems={"flex-end"}
          justifyItems={"flex-end"}
        >
          <Chip
            size="small"
            label={playlist._count.projects}
            icon={<PlaylistPlayIcon />}
            variant="outlined"
            sx={{ px: 0.5 }}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default PlaylistThumbnail;
