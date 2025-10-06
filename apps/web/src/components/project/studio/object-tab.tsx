import { Box, Skeleton, Typography } from "@mui/material";
import { useSpriteImage } from "./use-sprite-image";

// Utility to parse sprite position from thumbnail string
function parseSpritePosition(thumbnail: string) {
  const match = thumbnail.match(/#xywh=(\d+),(\d+),(\d+),(\d+)/);
  if (!match) return null;
  const [, x, y, width, height] = match.map(Number);
  return { x, y, width, height };
}

export function VisionStudioObjectsTab({
  groupedById,
  sprite,
}: {
  groupedById: [string, any[]][];
  sprite: string | undefined;
}) {
  const { getSpriteThumbnail } = useSpriteImage(sprite ?? "");

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Objects
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 2,
        }}
      >
        {groupedById.map(([objectId, objs]) => {
          const firstObj = objs[0];
          const thumbUrl = getSpriteThumbnail(firstObj.thumbnail);
          return (
            <Box
              key={objectId}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "grey.50",
                borderRadius: 2,
                p: 2,
                minHeight: 120,
              }}
            >
              <Box
                component="img"
                src={thumbUrl}
                alt={objectId}
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 1,
                  mb: 1,
                }}
              />
              <Typography fontWeight="bold" fontSize={14} align="center">
                {objectId}
              </Typography>
              <Typography color="grey.600" fontSize={12} align="center">
                {objs.length} detected
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
