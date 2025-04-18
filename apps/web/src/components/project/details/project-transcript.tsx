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
    null;

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
          <Typography variant="body2" sx={{ padding: 2 }}>
            {t("project.transcript.generating")}
          </Typography>
        ) : (
          <Markdown
            components={{
              p: (props) => {
                return <Typography variant="body1" sx={{ mb: 1 }} {...props} />;
              },
            }}
          >
            {data?.content}
          </Markdown>
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

        {(user?.role === "ADMIN" || user?.id === project.userId) &&
          !data?.content &&
          !isTranscriptInProgress && (
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
          <Button onClick={() => downloadTranscript(data?.content ?? "")}>
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
