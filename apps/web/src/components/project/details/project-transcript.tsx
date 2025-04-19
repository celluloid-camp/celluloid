"use client";

import type { ProjectById } from "@/lib/trpc/types";
import { Download as DownloadIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  IconButton,
  Typography,
  colors,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Markdown from "react-markdown";

import type { User } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import { LoadingButton } from "@mui/lab";
import { useQueryClient } from "@tanstack/react-query";
import type { FallbackProps } from "react-error-boundary";
import { StyledMarkdown } from "@/components/common/markdown";

interface Props {
  project: ProjectById;
  user?: User;
}
export function ProjectTranscript({ project, user }: Props) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);

  const utils = trpc.useUtils();
  const [data] = trpc.transcript.byProjectId.useSuspenseQuery({
    projectId: project.id,
  });

  const mutation = trpc.transcript.generate.useMutation({
    onSettled: () => {
      utils.project.byId.invalidate({ id: project.id });
    },
  });

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  if (!data && !user) {
    return null;
  }

  const isTranscriptInProgress =
    project.jobs.find((job) => job.type === "transcript")?.queueJob?.progress !=
    100;

  const canGenerateTranscript =
    (user?.role === "ADMIN" || user?.id === project.userId) &&
    !data?.content &&
    !isTranscriptInProgress;

  const downloadTranscript = (content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    a.click();
  };

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
        title={t("project.transcript.title")}
      />
      <CardContent sx={{ maxHeight: "300px", overflowY: "auto", py: 0 }}>
        {isTranscriptInProgress ? (
          <Box sx={{ py: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={12} color="primary" />
            <Typography variant="body2">
              {t("project.transcript.generating")}
            </Typography>
          </Box>
        ) : data?.content ? (
          <StyledMarkdown content={data?.content} />
        ) : (
          <Typography variant="body2">
            Video transcript not available.
          </Typography>
        )}
      </CardContent>

      <CardActions
        sx={{
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        {}

        {canGenerateTranscript && (
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
            {t("project.transcript.button.generate")}
          </LoadingButton>
        )}
        {data?.content ? (
          <Button
            onClick={() => downloadTranscript(data?.content ?? "")}
            sx={{ color: colors.grey[800] }}
          >
            <DownloadIcon />
            {t("project.transcript.button.download")}
          </Button>
        ) : null}
      </CardActions>
    </Card>
  );
}

export function TranscriptErrorFallback({
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
        title={t("project.transcript.title")}
      />
      <CardContent sx={{ maxHeight: "300px", overflowY: "auto", py: 0 }}>
        {t("project.transcript.failed")}
        {process.env.NODE_ENV === "development" && <pre>{error.message}</pre>}
        <Button onClick={resetErrorBoundary}>
          {t("project.transcript.try-again")}
        </Button>
      </CardContent>
    </Card>
  );
}
