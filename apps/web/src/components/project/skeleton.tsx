"use client";

import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Skeleton,
} from "@mui/material";

export const ProjectSkeleton = () => {
  return (
    <Box display={"flex"} flexDirection={"column"}>
      <Grid
        container
        sx={{
          backgroundColor: "black",
          height: "60vh",
          minHeight: "60vh",
          maxHeight: "60vh",
          paddingX: 2,
        }}
      >
        <Grid item xs={8} sx={{ position: "relative" }}>
          <Box
            display={"flex"}
            alignContent={"center"}
            justifyContent={"center"}
            alignItems={"center"}
            sx={{
              backgroundColor: "black",
              height: "100%",
              minHeight: "100%",
            }}
          >
            <CircularProgress sx={{ color: "white" }} />
          </Box>
        </Grid>
        <Grid
          item
          xs={4}
          sx={{
            height: "100%",
            position: "relative",
            paddingY: 2,
            paddingX: 2,
          }}
        >
          <Box
            sx={{
              position: "relative",
              backgroundColor: "background.dark",
              overflow: "hidden",
              height: "100%",
              borderRadius: 2,
            }}
          >
            <Box sx={{ paddingX: 2, paddingY: 2 }}>
              <Skeleton
                variant="text"
                width="60%"
                height={40}
                sx={{ mb: 2, backgroundColor: "grey.800" }}
              />
              <Skeleton
                variant="text"
                width="40%"
                height={24}
                sx={{ mb: 1, backgroundColor: "grey.800" }}
              />
              <Skeleton
                variant="text"
                width="80%"
                height={24}
                sx={{ mb: 1, backgroundColor: "grey.800" }}
              />
              <Skeleton
                variant="text"
                width="80%"
                height={24}
                sx={{ backgroundColor: "grey.800" }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ minHeight: "60vh" }}>
        <Box
          sx={{
            backgroundColor: "brand.orange",
            minHeight: "100vh",
            paddingY: 3,
          }}
        >
          <Container maxWidth="lg">
            <Paper
              sx={{
                paddingY: 2,
                paddingX: 4,
                margin: 0,
                backgroundColor: "brand.green",
                minHeight: "100vh",
              }}
            >
              <Grid
                container
                direction="row"
                alignItems="flex-start"
                spacing={4}
              >
                <Grid item xs={12} md={8} lg={8}>
                  <Box sx={{ p: 2 }}>
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={40}
                      sx={{ mb: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      height={24}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton variant="text" width="80%" height={24} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <Box gap={4} display={"flex"} flexDirection={"column"}>
                    <Skeleton
                      variant="rectangular"
                      sx={{
                        borderRadius: 2,
                        width: "100%",
                        height: 200,
                        paddingY: 2,
                      }}
                    />
                    <Skeleton
                      variant="rectangular"
                      sx={{
                        borderRadius: 2,
                        width: "100%",
                        height: 100,
                        paddingY: 2,
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};
