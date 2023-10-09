import { Box, Button, Paper, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import * as queryString from "query-string";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";

import { LoadingBig } from "~components/LoadingBig";
import ProjectSummary from "~components/project/ProjectSummary";
import { ShareCredentials } from "~components/ShareCredentials";
import ProjectService from "~services/ProjectService";

import { NotFound } from "./NotFound";

export const SharePage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId = "" } = useParams();

  const href = window.location.host;
  const protocol = window.location.protocol;
  const location = useLocation();

  const parsedUrl = queryString.parse(location.search);

  const password = typeof parsedUrl.p === "string" ? parsedUrl.p : undefined;

  const { data, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => ProjectService.get(projectId),
  });

  const handleClickPrint = () => window.print();

  if (data && password) {
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
        body: <ShareCredentials name={data.shareName} password={password} />,
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

          <ProjectSummary project={data} />
          <Typography variant="h3" gutterBottom={true}>
            {t("project.share.guide.subtitle")}
          </Typography>
          <div style={{ paddingTop: 16 }}>
            {steps.map((step, index) => {
              return (
                <Box key={index}>
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
  } else if (error || !password) {
    return <NotFound />;
  } else {
    return <LoadingBig />;
  }
};
