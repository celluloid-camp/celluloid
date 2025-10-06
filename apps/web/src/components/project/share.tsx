"use client";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import type React from "react";
import { trpc } from "@/lib/trpc/client";
import { ProjectSummary } from "./details/summary";

export function ShareProject({ projectId }: { projectId: string }) {
  const t = useTranslations();

  const href = window.location.host;
  const protocol = window.location.protocol;

  const [project] = trpc.project.byId.useSuspenseQuery({
    id: projectId,
  });
  const handleClickPrint = () => window.print();

  const steps = [
    {
      title: (
        <span>
          {t("project.share.guide.step1")}{" "}
          <a href={`${protocol}//${href}`}>{href}</a>
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
          <Typography gutterBottom={true}>{t("signin.projectCode")}</Typography>
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
    <>
      <Paper sx={{ padding: 4 }}>
        <Button
          color="primary"
          variant="contained"
          onClick={handleClickPrint}
          sx={{ marginBottom: 2 }}
        >
          {t("printAction")}
        </Button>
        <Typography variant="body2" gutterBottom={true}>
          {t("project.share.guide.title")}
        </Typography>

        <ProjectSummary project={project} />
        <Typography variant="h3" gutterBottom={true}>
          {t("project.share.guide.subtitle")}
        </Typography>
        <div style={{ paddingTop: 16 }}>
          {steps.map((step, index) => {
            return (
              <Box key={`${index}-${projectId}`}>
                <div>
                  <div>{index + 1}</div>
                  <div />
                </div>
                <div>
                  <div>{step.title}</div>
                  <div>{step.body}</div>
                </div>
              </Box>
            );
          })}
        </div>
      </Paper>
    </>
  );
}
