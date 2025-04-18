import type { PeerTubeVideoWithThumbnail } from "@/services/peertube";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Box } from "@mui/material";
import Image from "mui-image";
import { AddVideoButton } from "./add-video-button";
import { THUMBNAIL_WIDTH } from "./constants";

export function VideoSnapshots({
  videos,
  isPlaylist,
  onDelete,
  onAddMore,
}: {
  videos: PeerTubeVideoWithThumbnail[];
  isPlaylist: boolean;
  onDelete: (index: number) => void;
  onAddMore: () => void;
}) {
  return (
    <Box
      marginTop={2}
      sx={{ backgroundColor: "neutral.100" }}
      padding={2}
      borderRadius={1}
    >
      <Grid container rowSpacing={1} columnSpacing={1}>
        {videos.map((video, index) => (
          <VideoSnap
            video={video}
            key={video.id}
            onDelete={() => onDelete(index)}
          />
        ))}
        <AddVideoButton onClick={onAddMore} />
      </Grid>
    </Box>
  );
}

const VideoSnap: React.FC<{
  video: PeerTubeVideoWithThumbnail;
  onDelete: () => void;
}> = ({ video, onDelete }) => {
  return (
    <Grid item sx={{ borderRadius: 1, overflow: "hidden", m: 0, p: 0 }}>
      <Box sx={{ position: "absolute", zIndex: 1 }} width={THUMBNAIL_WIDTH}>
        <Box display={"flex"} justifyContent="flex-end">
          <IconButton
            aria-label="delete"
            onClick={onDelete}
            data-testid="delete-video"
          >
            <DeleteIcon sx={{ color: "white" }} fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Stack sx={{ backgroundColor: "black" }} width={250} height={180}>
        <Image
          src={video.thumbnailURL}
          showLoading={<CircularProgress />}
          style={{ opacity: 0.5 }}
          bgColor="#000000"
        />
        <Stack flex={1} marginX={1} marginBottom={1}>
          <Typography
            variant="body2"
            color={"white"}
            sx={{
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 1,
            }}
          >
            {video.name}
          </Typography>
        </Stack>
      </Stack>
    </Grid>
  );
};
