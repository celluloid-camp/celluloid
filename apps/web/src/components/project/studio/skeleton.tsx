import { Box, Skeleton } from "@mui/material";

const STUDIO_BG = "#191b1d";
const HEADER_OFFSET = 48;
const TIMELINE_LEFT_WIDTH = 220;
const TIMELINE_HEADER_OFFSET = 42;
const ROW_HEIGHT = 48;

const skeletonSx = {
  bgcolor: "rgba(255,255,255,0.08)",
  "&::after": {
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
  },
};

function TimelineRowSkeleton() {
  return (
    <Box
      sx={{
        height: ROW_HEIGHT,
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Skeleton
        variant="rectangular"
        width={40}
        height={ROW_HEIGHT - 14}
        sx={{ ...skeletonSx, borderRadius: 1, flexShrink: 0 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="text" width="70%" height={14} sx={skeletonSx} />
        <Skeleton variant="text" width="45%" height={12} sx={skeletonSx} />
      </Box>
    </Box>
  );
}

export function StudioSkeleton() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: HEADER_OFFSET,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: STUDIO_BG,
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Skeleton variant="circular" width={32} height={32} sx={skeletonSx} />
        <Box sx={{ minWidth: 0 }}>
          <Skeleton variant="text" width={72} height={24} sx={skeletonSx} />
          <Skeleton variant="text" width={180} height={18} sx={skeletonSx} />
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            backgroundColor: "black",
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ ...skeletonSx, borderRadius: 0 }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.75,
              flexShrink: 0,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                sx={skeletonSx}
              />
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                sx={skeletonSx}
              />
            </Box>
            <Skeleton
              variant="rectangular"
              width={72}
              height={30}
              sx={{ ...skeletonSx, borderRadius: 1, ml: "auto" }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: TIMELINE_LEFT_WIDTH,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Box
                sx={{
                  height: TIMELINE_HEADER_OFFSET,
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                  flexShrink: 0,
                }}
              >
                <Skeleton
                  variant="text"
                  width={48}
                  height={16}
                  sx={skeletonSx}
                />
              </Box>
              {[0, 1, 2, 3, 4].map((i) => (
                <TimelineRowSkeleton key={i} />
              ))}
            </Box>

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  height: TIMELINE_HEADER_OFFSET,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 4,
                  px: 2,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <Skeleton
                    key={i}
                    variant="text"
                    width={32}
                    height={12}
                    sx={skeletonSx}
                  />
                ))}
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      height: ROW_HEIGHT,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width={`${20 + (i % 3) * 15}%`}
                      height={ROW_HEIGHT - 16}
                      sx={{ ...skeletonSx, borderRadius: 1, ml: `${i * 8}%` }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
