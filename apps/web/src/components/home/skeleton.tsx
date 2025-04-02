import { Box, Container, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid";
import type * as React from "react";

export function ProjectGridSkeleton() {
  return (
    <Box
      sx={{
        padding: 5,
        backgroundColor: "brand.orange",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="lg">
        <Skeleton
          variant="rectangular"
          sx={{
            borderRadius: 5,
            width: "100%",
            height: 50,
            mb: 4,
          }}
        />

        <Skeleton
          variant="text"
          sx={{
            width: 200,
            height: 40,
            mb: 3,
          }}
        />

        <Grid container={true} spacing={5} direction="row">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid xs={12} sm={6} lg={4} xl={3} item key={item}>
              <Skeleton
                variant="rectangular"
                sx={{
                  width: "100%",
                  height: 200,
                  borderRadius: 2,
                }}
              />
              <Skeleton
                variant="text"
                sx={{
                  width: "80%",
                  height: 24,
                  mt: 1,
                }}
              />
              <Skeleton
                variant="text"
                sx={{
                  width: "60%",
                  height: 20,
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
