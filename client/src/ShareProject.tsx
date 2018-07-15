import * as React from 'react';

import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';

import CloseIcon from '@material-ui/icons/Close';

import * as moment from 'moment';

import { ProjectData } from '../../common/src/types/ProjectTypes';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import { DatePicker } from 'material-ui-pickers';

import * as passwordGenerator from 'password-generator';
import * as changeCase from 'change-case';
import Divider from '@material-ui/core/Divider';

interface Props {
  project: ProjectData;
  isOpen: boolean;
  onClose(): void;
}

interface State {
  shareName: string;
  sharePassword: string;
  shareExpiresOn: moment.Moment;
  maxShares: number;
}

const decorate = withStyles(({ palette, spacing }) => ({
  step: {
    '&:last-child $stepSeparator': {
      display: 'none'
    },
    '& > div:first-child': {
      position: 'static' as 'static',
      height: 0
    },
    '& > div:last-child': {
      marginLeft: 32,
      paddingLeft: 16
    },
    position: 'relative' as 'relative',
    minHeight: 32
  },
  stepSeparator: {
    left: 16,
    bottom: 10,
    top: 42,
    position: 'absolute' as 'absolute',
    borderLeft: '1px solid gainsboro'
  },
  stepNumber: {
    border: '1px solid gainsboro',
    lineHeight: '32px',
    borderRadius: 16,
    position: 'relative' as 'relative',
    textAlign: 'center' as 'center',
    width: 32,
    height: 32
  },
  stepTitle: {
    lineHeight: '32px'
  }
}));

const ShareProject = decorate<Props>(
  class extends React.Component<Props
    & DialogProps
    & WithStyles<'step' | 'stepSeparator' | 'stepNumber' | 'stepTitle'>, State> {

    constructor(props: Props & WithStyles<'step' | 'stepSeparator' | 'stepNumber' | 'stepTitle'> & DialogProps) {
      super(props);
      this.state = {
        shareName: changeCase.paramCase(props.project.title),
        sharePassword: passwordGenerator(16),
        shareExpiresOn: moment().add(1, 'month'),
        maxShares: 50
      } as State;
    }

    render() {
      const steps = [
        {
          title: (
            <span>
              {`Allez sur le site internet `}
              <u>{window.location.host}</u>
            </span>
          )
        },
        {
          title: (
            <span>
              {`Sur la page d'accueil, cliquez sur "rejoindre un projet"`}
            </span>
          )
        },
        {
          title: (
            <span>
              {`Entrez le nom et le mot de passe du projet`}
            </span>
          ),
          body: (
            <div style={{ padding: 16 }}>
              <Typography>
                <b>{`nom : `}</b>{this.state.shareName}
              </Typography>
              <Typography>
                <b>{`mot de passe : `}</b>{this.state.sharePassword}
              </Typography>
            </div>
          )
        },
        {
          title: (
            <span>
              {`Indiquez votre prénom et choisissez une couleur`}
            </span>
          )
        },
        {
          title: (
            <span>
              {`Lisez bien les consignes et l'exercice`}
            </span>
          )
        },
        {
          title: (
            <span>
              {`Réalisez l'exercice et annotez la vidéo au fil de la lecture`}
            </span>
          )
        }
      ];
      const { fullScreen, isOpen, classes } = this.props;

      return (
        <Dialog
          maxWidth="md"
          fullScreen={fullScreen}
          open={isOpen}
          fullWidth={true}
        >
          <DialogTitle style={{ textAlign: 'center' }}>
            <span style={{ position: 'absolute', right: 16, top: 8 }}>
              <IconButton onClick={this.props.onClose}><CloseIcon /></IconButton>
            </span>
            <b>{`Partager`}</b>
          </DialogTitle>
          <DialogContent>
            <Typography
              variant="title"
              style={{ textAlign: 'center' }}
            >
              {`Informations de partage`}
            </Typography>
            <Paper
              style={{
                margin: 24,
                padding: 16,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  maxWidth: 768,
                  display: 'grid',
                }}
              >
                <div
                  style={{
                    padding: '16px 16px 8px',
                    gridColumnStart: 1,
                    gridRowStart: 1
                  }}
                >
                  <Typography variant="caption">
                    {`Nom`}
                  </Typography>
                </div>
                <div
                  style={{
                    padding: '16px 16px 8px',
                    gridColumnStart: 2,
                    gridRowStart: 1
                  }}
                >
                  <Typography variant="caption">
                    {`Mot de passe`}
                  </Typography>
                </div>
                <div
                  style={{
                    padding: '0 16px 16px',
                    gridColumnStart: 1,
                    gridRowStart: 2,
                    paddingBottom: 16
                  }}
                >
                  <Typography>
                    <b>{this.state.shareName}</b>
                  </Typography>
                </div>
                <div
                  style={{
                    padding: '0 16px 16px',
                    gridColumnStart: 2,
                    gridRowStart: 2,
                  }}
                >
                  <Typography>
                    <b>{this.state.sharePassword}</b>
                  </Typography>
                </div>
                <div
                  style={{
                    padding: '0 16px 16px',
                    gridColumnStart: 1,
                    gridRowStart: 3
                  }}
                >
                  <TextField
                    type="number"
                    label="Nombre de partages"
                    value={this.state.maxShares}
                    onChange={event => {
                      this.setState({
                        maxShares: Number(event.target.value)
                      });
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: '0 16px 16px',
                    gridColumnStart: 2,
                    gridRowStart: 3
                  }}
                >
                  <DatePicker
                    label="Expire le"
                    clearable={true}
                    value={this.state.shareExpiresOn}
                    disablePast={true}
                    format="ll"
                    minDate={moment().add(1, 'day')}
                    onChange={date => {
                      this.setState({
                        shareExpiresOn: date
                      });
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: '8px 16px 16px',
                    gridColumnStart: 1,
                    gridColumnEnd: 3,
                    gridRowStart: 4,
                  }}
                >
                  <Typography>
                    <b>{`Lien : `}</b>
                    <u>{window.location.host}{window.location.pathname}</u>
                  </Typography>
                </div>
                <div
                  style={{
                    padding: '8px 16px 0',
                    gridColumnStart: 1,
                    gridColumnEnd: 3,
                    gridRowStart: 5,
                    textAlign: 'center'
                  }}
                >
                  <Button
                    variant="raised"
                    color="primary"
                    style={{ margin: 8 }}
                  >
                    {`Copier les informations`}
                  </Button>
                  <Button
                    variant="raised"
                    color="secondary"
                    style={{ margin: 8 }}
                  >
                    {`Enregistrer`}
                  </Button>
                </div>
              </div>
            </Paper>
            <Typography
              variant="title"
              style={{ textAlign: 'center' }}
            >
              {`Fiche pédagogique`}
            </Typography>
            <Paper
              style={{
                margin: 16,
                padding: 16
              }}
            >
              <Typography variant="headline" gutterBottom={true}>
                {`Comment utiliser Celluloid ?`}
              </Typography>
              <Divider />
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
                        <div style={{ minHeight: 32 }}>
                          {step.body}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Divider />
              <div style={{ paddingTop: 32 }}>
                <Typography
                  variant="headline"
                >
                  <b>{this.props.project.title}</b>
                </Typography>
                <Typography
                  variant="subheading"
                  gutterBottom={true}
                  style={{ marginBottom: 16 }}
                >
                  {this.props.project.description}
                </Typography>
                <Divider style={{ margin: '16px 0' }} />
                <Typography
                  gutterBottom={true}
                  variant="caption"
                >
                  {`L'objectif est de :`}
                </Typography>
                <Typography
                  variant="subheading"
                  gutterBottom={true}
                >
                  <b>{this.props.project.objective}</b>
                </Typography>
                {this.props.project.assignments.length > 0 &&
                  <div style={{ padding: 0, margin: 0 }}>
                    <Typography
                      gutterBottom={true}
                      variant="caption"
                    >
                      {`Pour cela, vous devrez :`}
                    </Typography>
                    <ol style={{ padding: 0, margin: 0 }}>
                      {this.props.project.assignments.map((assignment, index) =>
                        <Typography
                          key={index}
                          gutterBottom={true}
                        >
                          <li>
                            {assignment}
                          </li>
                        </Typography>
                      )}
                    </ol>
                  </div>
                }
              </div>
            </Paper>
          </DialogContent>
        </Dialog >
      );
    }
  }
);

export default ShareProject;