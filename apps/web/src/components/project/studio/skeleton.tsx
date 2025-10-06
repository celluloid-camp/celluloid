import {
  Box,
  Container,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React from "react";

export function StudioSkeleton() {
  return (
    <Box display={"flex"} flexDirection={"column"}>
      <Box
        sx={{
          backgroundColor: "brand.orange",
          minHeight: "100vh",
          paddingY: 3,
        }}
      >
        <Container maxWidth="md">
          <Paper
            sx={{
              paddingY: 2,
              paddingX: 4,
              margin: 0,
              backgroundColor: "brand.green",
              minHeight: "100vh",
            }}
          >
            <Skeleton variant="text" width={180} height={48} sx={{ mb: 2 }} />
            <Skeleton variant="text" width={320} height={32} sx={{ mb: 3 }} />
            <Box
              sx={{
                height: 500,
                width: 888,
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Skeleton variant="rectangular" width={888} height={500} />
            </Box>
            <Paper sx={{ padding: 2, marginTop: 2 }}>
              <Tabs value={0} sx={{ mb: 2 }}>
                <Tab label={<Skeleton variant="text" width={80} />} />
                <Tab label={<Skeleton variant="text" width={120} />} />
              </Tabs>
              <Box>
                {[...Array(3)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "grey.50",
                      borderRadius: 2,
                      p: 1,
                      mb: 1,
                    }}
                  >
                    <Skeleton
                      variant="circular"
                      width={48}
                      height={48}
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width={120} height={24} />
                      <Skeleton variant="text" width={80} height={16} />
                    </Box>
                    <Skeleton
                      variant="rectangular"
                      width={120}
                      height={16}
                      sx={{ mx: 2, borderRadius: 8 }}
                    />
                    <Skeleton
                      variant="circular"
                      width={32}
                      height={32}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
