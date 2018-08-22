import { AnnotationRecord, ProjectGraphRecord } from '@celluloid/types';
import { Grid, WithStyles, withStyles, MuiThemeProvider } from '@material-ui/core';
import ProjectSummary from 'components/ProjectSummary';
import * as React from 'react';

import SideBar from './components/SideBar';
import { styles } from './ProjectStyles';
import Video from './scenes/Video';
import { Dark } from 'utils/ThemeUtils';

interface Props extends WithStyles<typeof styles> {
  project?: ProjectGraphRecord;
  annotations: Set<AnnotationRecord>;
  onVideoChange(): void;
}

export default withStyles(styles)(({
  project,
  classes,
}: Props) => (
    <div className={classes.root}>
      <MuiThemeProvider theme={Dark}>
        <div className={classes.videoContainer}>
          <div className={classes.video}>
            {project &&
              <Video
                project={project}
              />
            }
          </div>
        </div>
      </MuiThemeProvider>
      <div
        className={classes.content}
      >
        {project &&
          <Grid
            container={true}
            direction="row"
            alignItems="flex-start"
            spacing={24}
          >
            <Grid item={true} xs={12} md={8} lg={9}>
              <ProjectSummary project={project} />
            </Grid>
            <Grid
              className={classes.sideBar}
              item={true}
              xs={12}
              md={4}
              lg={3}
            >
              <SideBar
                project={project}
              />
            </Grid>
          </Grid>
        }
      </div>
    </div>
  ));