import LoadingBig from '@celluloid/client/src/components/LoadingBig';
import { ProjectGraphRecord } from '@celluloid/types';
import {
  createStyles,
  Paper,
  Theme,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core';
import NotFound from 'components/NotFound';
import ProjectSummary from 'components/ProjectSummary';
import ShareCredentials from 'components/ShareCredentials';
import * as queryString from 'query-string';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import ProjectService from 'services/ProjectService';
import { ProjectRouteParams } from 'types/ProjectTypes';

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
    margin: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 2
  },
  notFoundPaper: {
    margin: theme.spacing.unit * 4,
  },
  notFoundBody: {
    padding: theme.spacing.unit * 4
  },
  notFoundButtonWrapper: {
    padding: theme.spacing.unit * 2
  },
  password: {
    fontFamily: 'monospace'
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
  class extends React.Component<Props, State> {
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
      const { classes } = this.props;
      const href = window.location.host;
      const protocol = window.location.protocol;
      const { project, error } = this.state;
      const parsedUrl =
        queryString.parse(this.props.location.search);
      const password = typeof parsedUrl.p === 'string'
        ? parsedUrl.p
        : undefined;

      if (project && password) {
        const steps = [{
          title: (
            <span>
              {`Allez sur le site internet `}
              <a href={`${protocol}//${href}`}>{href}</a>
            </span>
          )
        }, {
          title: (
            <span>
              {`Sur la page d'accueil, cliquez sur "rejoindre un projet"`}
            </span>
          )
        }, {
          title: (
            <span>
              {`Entrez le code et le mot de passe du projet`}
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
              {`Indiquez votre prénom et choisissez une couleur`}
            </span>
          )
        }, {
          title: (
            <span>
              {`Lisez bien les consignes et l'exercice`}
            </span>
          )
        }, {
          title: (
            <span>
              {`Réalisez l'exercice et annotez la vidéo au fil de la lecture`}
            </span>
          )
        }];

        return (
          <>
            <Paper className={classes.paper}>
              <Typography variant="display3" gutterBottom={true}>
                {`Fiche pédagogique`}
              </Typography>
              <ProjectSummary project={project} />
              <Typography variant="h3" gutterBottom={true}>
                {`Comment utiliser Celluloid ?`}
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
));
