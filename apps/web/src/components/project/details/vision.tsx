"use client";

import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  colors,
  Typography,
} from "@mui/material";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import type { FallbackProps } from "react-error-boundary";
import type { User } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import type { ProjectById } from "@/lib/trpc/types";
import { VisionChart } from "./vision-chart";

interface Props {
  project: ProjectById;
  user?: User;
}
export function ProjectVision({ project, user }: Props) {
  const t = useTranslations();

  const api = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(
    api.vision.byProjectId.queryOptions({
      projectId: project.id,
    }),
  );

  const mutation = useMutation(
    api.vision.generate.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries(
          api.project.byId.queryFilter({ id: project.id }),
        );
      },
    }),
  );

  const manualCheck = useMutation(
    api.vision.check.mutationOptions({
      onSuccess: (data) => {
        console.log("data", data);
      },
      onSettled: () => {
        queryClient.invalidateQueries(
          api.project.byId.queryFilter({ id: project.id }),
        );
      },
    }),
  );

  if (!data && !user) {
    return null;
  }

  const canGenerateVision =
    (user?.role === "ADMIN" || user?.id === project.userId) &&
    !data &&
    project.analysisProcessingStatus === "in_progress";

  const canViewStudio =
    user?.role === "ADMIN" ||
    (user?.id === project.userId && data && data.status == "completed");

  return (
    <Card
      sx={{
        my: 2,
        backgroundColor: colors.blueGrey[50],
        borderRadius: 1,
      }}
    >
      <CardHeader
        sx={{ p: 2, borderBottom: `1px solid ${colors.grey[300]}` }}
        title={t("project.vision.title")}
        action={
          canViewStudio ? (
            <Link href={`/project/${project.id}/studio`}>
              <Button
                variant="contained"
                size="small"
                startIcon={<ViewTimelineIcon />}
              >
                Studio
              </Button>
            </Link>
          ) : null
        }
      />
      <CardContent sx={{ p: 3, maxHeight: "300px", overflowY: "auto" }}>
        {project.analysisProcessingStatus === "in_progress" ? (
          <Box sx={{ py: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={12} color="primary" />
            <Typography variant="body2">
              {t("project.vision.analyse.in-progress")}
            </Typography>
          </Box>
        ) : data?.status === "completed" ? (
          <Box>
            <VisionChart analysis={data?.processing} />
          </Box>
        ) : (
          <Typography variant="body2">{t("project.vision.empty")}</Typography>
        )}
      </CardContent>

      <CardActions
        sx={{
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        {canGenerateVision && (
          <LoadingButton
            variant="contained"
            loading={mutation.isPending}
            color="primary"
            disabled={mutation.isPending}
            onClick={async () => {
              mutation.mutate({
                projectId: project.id,
              });
            }}
          >
            {t("project.vision.button.analyse")}
          </LoadingButton>
        )}

        {/* <Button onClick={() => manualCheck.mutate({ projectId: project.id })}>
          Check
        </Button> */}
      </CardActions>
    </Card>
  );
}

export function ProjectVisionFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const t = useTranslations();
  return (
    <Card
      sx={{
        my: 2,
        backgroundColor: colors.yellow[50],
        borderRadius: 1,
      }}
    >
      <CardHeader
        sx={{ p: 2, borderBottom: `1px solid ${colors.grey[300]}` }}
        title={t("project.vision.title")}
      />
      <CardContent sx={{ maxHeight: "300px", overflowY: "auto", py: 0 }}>
        Failed to analyze video
        {process.env.NODE_ENV === "development" && <pre>{error.message}</pre>}
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </CardContent>
    </Card>
  );
}
