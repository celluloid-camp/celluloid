import { Box, Skeleton } from "@mui/material";

export function EditProjectDialogSkeleton() {
  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Title field skeleton */}
      <Skeleton height={56} sx={{ mb: 2, mt: 1 }} />

      {/* Description field skeleton */}
      <Skeleton height={108} sx={{ mb: 2 }} />

      {/* Keywords field skeleton */}
      <Skeleton height={56} sx={{ mb: 2 }} />

      {/* Settings section skeleton */}
      <Skeleton width="40%" height={28} sx={{ mb: 2, mt: 2 }} />
      <Box sx={{ ml: 2 }}>
        <Skeleton height={40} sx={{ mb: 1 }} />
        <Skeleton height={40} sx={{ mb: 1 }} />
        <Skeleton height={40} sx={{ mb: 1 }} />
      </Box>

      {/* Buttons skeleton */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Skeleton width={120} height={40} />
        <Skeleton width={120} height={40} />
      </Box>
    </Box>
  );
}
