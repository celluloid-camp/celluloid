import { ProjectGraphRecord } from '@celluloid/types';
import Grid from '@material-ui/core/Grid';
import Grow from '@material-ui/core/Grow';
import * as R from 'ramda';
import * as React from 'react';
import { TransitionGroup } from 'react-transition-group';

import ProjectThumbnail from './ProjectThumbnail';

interface Props {
  projects: Set<ProjectGraphRecord>;
}

export default ({ projects }: Props) => {

  const sort = R.sortWith([
    R.descend(R.prop('publishedAt'))
  ]);

  const sorted = sort(Array.from(projects));

  return (
    <div style={{ padding: 20 }}>
      <Grid container={true} spacing={40} direction="row">
        <TransitionGroup component={null} appear={true}>
          {sorted.map((project: ProjectGraphRecord) =>
            <Grow in={true} appear={true} key={project.id}>
              <ProjectThumbnail {...project} />
            </Grow>
          )}
        </TransitionGroup>
      </Grid>
    </div>
  );
};