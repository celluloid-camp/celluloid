import { ProjectGraphRecord } from '@celluloid/types';
import { createStyles, Theme, Typography, WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';

const styles = ({ spacing }: Theme) => createStyles({
  section: {
    marginTop: spacing.unit * 2
  },
  questions: {
    margin: 0,
    padding: 0,
    paddingLeft: spacing.unit * 2 + 2
  },
});

interface Props extends WithStyles<typeof styles> {
  project: ProjectGraphRecord;
}

export default withStyles(styles)(({ project, classes }: Props) => (
  <>
    <Typography
      align="left"
      variant="display2"
      gutterBottom={true}
    >
      {project.title}
    </Typography>
    <Typography
      align="justify"
      gutterBottom={true}
      variant="subheading"
    >
      <b>{project.description}</b>
    </Typography>
    <Typography
      align="left"
      gutterBottom={true}
      variant="display1"
      color="primary"
      className={classes.section}
    >
      {`Objectif`}
    </Typography>
    <Typography
      align="justify"
      gutterBottom={true}
      variant="subheading"
    >
      {project.objective}
    </Typography>
    {
      project.assignments.length > 0 &&
      <>
        <Typography
          align="left"
          gutterBottom={true}
          variant="display1"
          color="primary"
          className={classes.section}
        >
          {`Exercice`}
        </Typography>
        <Typography
          align="left"
          gutterBottom={true}
          variant="subheading"
        >
          <ol className={classes.questions}>
            {project.assignments.map((assignment, index) =>
              <li key={index}>
                {assignment}
              </li>
            )}
          </ol>
        </Typography>
      </>
    }
  </>
));