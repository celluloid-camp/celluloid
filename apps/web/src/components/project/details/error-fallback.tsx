"use client";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import type { FallbackProps } from "react-error-boundary";

export const projectFallbackRender = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  return (
    <Box display="flex" flexDirection="column">
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
            display="flex"
            alignContent="center"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            sx={{
              backgroundColor: "black",
              height: "100%",
              minHeight: "100%",
            }}
          >
            <ErrorOutlineIcon sx={{ color: "white", fontSize: 60, mb: 2 }} />
            <Typography variant="h6" sx={{ color: "white" }}>
              {t("project.error.loading")}
            </Typography>
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
          />
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
                    <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                      {t("project.error.details.title")}
                    </Typography>
                    <Typography variant="body1">
                      {t("project.error.details.description")}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <Box gap={4} display="flex" flexDirection="column" />
                </Grid>
              </Grid>
            </Paper>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};
