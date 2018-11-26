import { ProjectGraphRecord } from '@celluloid/types';
import {
  Button,
  createStyles,
  Paper,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import LoadingBig from 'components/LoadingBig';
import NotFound from 'components/NotFound';
import ProjectSummary from 'components/ProjectSummary';
import ShareCredentials from 'components/ShareCredentials';
import * as queryString from 'query-string';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import ProjectService from 'services/ProjectService';
import { ProjectRouteParams } from 'types/ProjectTypes';
import { withI18n, WithI18n } from 'react-i18next';

const styles = (theme: Theme) => createStyles({
  step: {
    '&:last-child $stepSeparator': {
      display: 'none'
    },
    '& > div:first-child': {
      position: 'static',
      height: 0
    },
    '& > div:last-child': {
      marginLeft: theme.spacing.unit * 5,
      paddingLeft: theme.spacing.unit * 2.5
    },
    position: 'relative',
    minHeight: theme.spacing.unit * 5
  },
  stepsWrapper: {
    paddding: theme.spacing.unit * 2.5,
  },
  stepSeparator: {
    left: theme.spacing.unit * 2.5,
    bottom: theme.spacing.unit,
    top: theme.spacing.unit * 6,
    position: 'absolute',
    border: `1px solid ${theme.palette.divider}`,
  },
  stepNumber: {
    ...theme.typography.subtitle1,
    border: `1px solid ${theme.palette.divider}`,
    lineHeight: `${theme.spacing.unit * 5}px`,
    borderRadius: theme.spacing.unit * 2.5,
    position: 'relative',
    textAlign: 'center',
    width: theme.spacing.unit * 5,
    height: theme.spacing.unit * 5
  },
  stepTitle: {
    ...theme.typography.subtitle1,
    lineHeight: `${theme.spacing.unit * 5}px`,
  },
  stepBody: {
    minHeight: theme.spacing.unit * 5,
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2
  },
  paper: {
    padding: theme.spacing.unit * 4,
  },
  password: {
    fontFamily: 'monospace'
  },
  button: {
    marginBottom: theme.spacing.unit * 2
  },
  '@media print': {
    button: {
      display: 'none'
    }
  }
});

interface Props extends
  WithStyles<typeof styles>,
  RouteComponentProps<ProjectRouteParams> { }

interface State {
  project?: ProjectGraphRecord;
  error?: string;
}

export default withRouter(withStyles(styles)(
  withI18n()(
    class extends React.Component<Props & WithI18n, State> {
      state = {} as State;

      componentDidMount() {
        this.load();
      }

      load() {
        const projectId = this.props.match.params.projectId;
        ProjectService.get(projectId)
          .then(project => {
            this.setState({
              project,
              error: undefined
            });
          })
          .catch((error: Error) => {
            this.setState({
              error: error.message,
              project: undefined,
            });
          });
      }

      render() {
        const { classes, t } = this.props;
        const href = window.location.host;
        const protocol = window.location.protocol;
        const { project, error } = this.state;
        const parsedUrl =
          queryString.parse(this.props.location.search);
        const password = typeof parsedUrl.p === 'string'
          ? parsedUrl.p
          : undefined;

        const onClickPrint = () => window.print();

        if (project && password) {
          const steps = [{
            title: (
              <span>
                {t('project.share.guide.step1')}
                <a href={`${protocol}//${href}`}>{href}</a>
              </span>
            )
          }, {
            title: (
              <span>
                {t('project.share.guide.step2')}
              </span>
            )
          }, {
            title: (
              <span>
                {t('project.share.guide.step3')}
              </span>
            ),
            body: (
              <ShareCredentials
                name={project.shareName}
                password={password}
              />
            )
          }, {
            title: (
              <span>
                {t('project.share.guide.step4')}
              </span>
            )
          }, {
            title: (
              <span>
                {t('project.share.guide.step5')}
              </span>
            )
          }, {
            title: (
              <span>
                {t('project.share.guide.step6')}
              </span>
            )
          }];

          return (
            <>
              <Paper className={classes.paper}>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={onClickPrint}
                  className={classes.button}
                >
                  {t('printAction')}
                </Button>
                <Typography variant="display3" gutterBottom={true}>
                  {t('project.share.guide.title')}
                </Typography>

                <ProjectSummary project={project} />
                <Typography variant="h3" gutterBottom={true}>
                  {t('project.share.guide.subtitle')}
                </Typography>
                <div style={{ paddingTop: 16 }}>
                  {steps.map((step, index) => {
                    return (
                      <div key={index} className={classes.step}>
                        <div>
                          <div className={classes.stepNumber}>
                            {index + 1}
                          </div>
                          <div className={classes.stepSeparator} />
                        </div>
                        <div>
                          <div className={classes.stepTitle}>
                            {step.title}
                          </div>
                          <div className={classes.stepBody}>
                            {step.body}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Paper>
            </>
          );
        } else if (error || !password) {
          return (
            <NotFound />
          );
        } else {
          return (
            <LoadingBig />
          );
        }
      }
    }
  ))
);
