import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import { DisplayProjectData } from '../../../../../../common/src/types/ProjectTypes';
import ProjectThumbnail from './ProjectThumbnail';

interface Props {
  projects: DisplayProjectData[];
}
export default ({ projects }: Props) => (

  <div style={{ padding: 20 }}>
    <Grid
      container={true}
      spacing={40}
      direction="row"
    >
      {
        projects.map((project: DisplayProjectData) =>
          <ProjectThumbnail
            key={project.id}
            {...project}
          />
        )
      }
    </Grid>
  </div>
);