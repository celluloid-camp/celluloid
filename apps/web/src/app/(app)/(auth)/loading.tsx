import { Box, Paper, Skeleton } from "@mui/material";

export default function SignupLoading() {
  return (
    <Paper sx={{ p: 3, width: "100%", maxWidth: 400 }}>
      <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Skeleton variant="rectangular" height={56} />
        <Skeleton variant="rectangular" height={56} />
        <Skeleton variant="rectangular" height={56} />
        <Skeleton variant="rectangular" height={56} />
      </Box>
    </Paper>
  );
}
