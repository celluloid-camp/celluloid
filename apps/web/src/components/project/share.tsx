"use client";
import PrintIcon from "@mui/icons-material/Print";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type React from "react";
import { useTRPC } from "@/lib/trpc/client";

export function ShareProject({ projectId }: { projectId: string }) {
  const t = useTranslations();

  const href = typeof window !== "undefined" ? window.location.host : "";
  const protocol =
    typeof window !== "undefined" ? window.location.protocol : "";

  const api = useTRPC();
  const { data: project } = useSuspenseQuery(
    api.project.byId.queryOptions({ id: projectId }),
  );
  const handleClickPrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const steps = [
    {
      title: (
        <span>
          {t("project.share.guide.step1")}{" "}
          <a href={href ? `${protocol}//${href}` : "#"}>{href}</a>
        </span>
      ),
    },
    {
      title: <span>{t("project.share.guide.step2")}</span>,
    },
    {
      title: <span>{t("project.share.guide.step3")}</span>,
      body: (
        <Box sx={{ marginBottom: 2 }}>
          <Typography
            variant="body2"
            gutterBottom={true}
            sx={{ fontFamily: "monospace" }}
          >
            {`${project.shareCode}`}
          </Typography>
        </Box>
      ),
    },
    {
      title: <span>{t("project.share.guide.step4")}</span>,
    },
    {
      title: <span>{t("project.share.guide.step5")}</span>,
    },
    {
      title: <span>{t("project.share.guide.step6")}</span>,
    },
  ];

  return (
    <Box sx={{ padding: 4 }}>
      <Button
        color="primary"
        variant="contained"
        onClick={handleClickPrint}
        startIcon={<PrintIcon />}
        sx={{ marginBottom: 2 }}
      >
        {t("printAction")}
      </Button>
      <Typography variant="body2" gutterBottom={true}>
        {t("project.share.guide.title")}
      </Typography>

      <Typography variant="h3" gutterBottom={true}>
        {project.title}
      </Typography>
      <Typography variant="body1" gutterBottom={true}>
        {project.description}
      </Typography>
      <Box
        sx={{
          marginTop: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: "neutral.100",
          borderRadius: 2,
        }}
      >
        <Box sx={{ padding: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h5">
            {t("project.share.guide.subtitle")}
          </Typography>
        </Box>
        <Timeline
          sx={{
            pt: 2,
            px: 4,
            "& .MuiTimelineItem-root:before": {
              flex: 0,
              padding: 0,
            },
          }}
        >
          {steps.map((step, index) => (
            <TimelineItem key={`${index}-${projectId}`}>
              <TimelineSeparator>
                <TimelineDot
                  color="primary"
                  sx={{
                    width: 24,
                    height: 24,
                    minWidth: 24,
                    minHeight: 24,
                    m: 0,
                    p: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {index + 1}
                </TimelineDot>
                {index < steps.length - 1 ? <TimelineConnector /> : null}
              </TimelineSeparator>
              <TimelineContent sx={{ pb: 2 }}>
                <Box>{step.title}</Box>
                {step.body ? <Box>{step.body}</Box> : null}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Box>
  );
}
