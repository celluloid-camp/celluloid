import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import { ProjectGraphRecord } from '@celluloid/types';
import ProjectThumbnail from './ProjectThumbnail';
import { TransitionGroup } from 'react-transition-group';
import Grow from '@material-ui/core/Grow';

interface Props {
  projects: ProjectGraphRecord[];
}
export default ({ projects }: Props) => (

  <div style={{ padding: 20 }}>
    <Grid
      container={true}
      spacing={40}
      direction="row"
    >
      <TransitionGroup
        component={null}
        appear={true}
      >
        {projects.map((project: ProjectGraphRecord) =>
          <Grow
            in={true}
            appear={true}
            key={project.id}
          >
            <ProjectThumbnail
              {...project}
            />
          </Grow>
        )}
      </TransitionGroup>
    </Grid>
  </div>
);