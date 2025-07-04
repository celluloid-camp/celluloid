import { Box, Typography } from "@mui/material";

export function VisionStudioObjectsTab({
  groupedByClass,
}: {
  groupedByClass: [string, any[]][];
}) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Objects
      </Typography>
      {groupedByClass.map(([className, objs]) => (
        <Box
          key={className}
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "grey.50",
            borderRadius: 2,
            p: 1,
            mb: 1,
          }}
        >
          <Typography sx={{ flex: 1 }}>{className}</Typography>
          <Typography color="grey.600">{objs.length} detected</Typography>
        </Box>
      ))}
    </Box>
  );
}
