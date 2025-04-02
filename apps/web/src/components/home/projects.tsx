"use client";
import { Suspense } from "react";
import { ProjectGridSkeleton } from "./skeleton";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Button, Fade, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { ProjectGrid } from "./project-grid";

export function HomePageProjects() {
  const t = useTranslations();
  return (
    <Suspense fallback={<ProjectGridSkeleton />}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ resetErrorBoundary }) => (
              <Fade in={true} appear={true}>
                <Typography
                  variant="h6"
                  align="center"
                  gutterBottom={true}
                  sx={{
                    pt: 4,
                    pb: 1,
                  }}
                >
                  {t("errors.UNKNOWN")}
                  <Button onClick={() => resetErrorBoundary()}>
                    {t("home.projects.retry")}
                  </Button>
                </Typography>
              </Fade>
            )}
          >
            <ProjectGrid />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </Suspense>
  );
}
