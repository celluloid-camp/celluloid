import {
  Button,
  createStyles,
  Paper,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import { useQuery } from "@tanstack/react-query";
import LoadingBig from "components/LoadingBig";
import NotFound from "components/NotFound";
import ProjectSummary from "components/ProjectSummary";
import ShareCredentials from "components/ShareCredentials";
import * as queryString from "query-string";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import ProjectService from "services/ProjectService";

const styles = (theme: Theme) =>
  createStyles({
    step: {
      "&:last-child $stepSeparator": {
        display: "none",
      },
      "& > div:first-child": {
        position: "static",
        height: 0,
      },
      "& > div:last-child": {
        marginLeft: theme.spacing.unit * 5,
        paddingLeft: theme.spacing.unit * 2.5,
      },
      position: "relative",
      minHeight: theme.spacing.unit * 5,
    },
    stepsWrapper: {
      paddding: theme.spacing.unit * 2.5,
    },
    stepSeparator: {
      left: theme.spacing.unit * 2.5,
      bottom: theme.spacing.unit,
      top: theme.spacing.unit * 6,
      position: "absolute",
      border: `1px solid ${theme.palette.divider}`,
    },
    stepNumber: {
      ...theme.typography.subtitle1,
      border: `1px solid ${theme.palette.divider}`,
      lineHeight: `${theme.spacing.unit * 5}px`,
      borderRadius: theme.spacing.unit * 2.5,
      position: "relative",
      textAlign: "center",
      width: theme.spacing.unit * 5,
      height: theme.spacing.unit * 5,
    },
    stepTitle: {
      ...theme.typography.subtitle1,
      lineHeight: `${theme.spacing.unit * 5}px`,
    },
    stepBody: {
      minHeight: theme.spacing.unit * 5,
      paddingTop: theme.spacing.unit * 2,
      paddingBottom: theme.spacing.unit * 2,
    },
    paper: {
      padding: theme.spacing.unit * 4,
    },
    password: {
      fontFamily: "monospace",
    },
    button: {
      marginBottom: theme.spacing.unit * 2,
    },
    "@media print": {
      button: {
        display: "none",
      },
    },
  });

type Props = WithStyles<typeof styles>;

const ShareGuideContainer: React.FC<Props> = ({ classes }) => {
  const { t } = useTranslation();
  let { projectId = "" } = useParams();

  const href = window.location.host;
  const protocol = window.location.protocol;
  let location = useLocation();

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
            {t("project.share.guide.step1")}
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
        <Paper className={classes.paper}>
          <Button
            color="primary"
            variant="contained"
            onClick={handleClickPrint}
            className={classes.button}
          >
            {t("printAction")}
          </Button>
          <Typography variant="display3" gutterBottom={true}>
            {t("project.share.guide.title")}
          </Typography>

          <ProjectSummary project={data} />
          <Typography variant="h3" gutterBottom={true}>
            {t("project.share.guide.subtitle")}
          </Typography>
          <div style={{ paddingTop: 16 }}>
            {steps.map((step, index) => {
              return (
                <div key={index} className={classes.step}>
                  <div>
                    <div className={classes.stepNumber}>{index + 1}</div>
                    <div className={classes.stepSeparator} />
                  </div>
                  <div>
                    <div className={classes.stepTitle}>{step.title}</div>
                    <div className={classes.stepBody}>{step.body}</div>
                  </div>
                </div>
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

export default withStyles(styles)(ShareGuideContainer);
