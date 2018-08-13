import * as React from 'react';
import { Typography, Grid } from '@material-ui/core';
const logoIcp = require('./images/logo-icp.jpg');
const logoFsm = require('./images/logo-fsm.jpg');
const logoLp = require('./images/logo-lp.png');
const logoBlog = require('./images/logo-blog-celluloid.jpg');

export default () => (
  <div
    style={{
      padding: 48,
      maxWidth: 1024,
      margin: '0 auto'
    }}
  >
    <Typography variant="headline" gutterBottom={true}>
      <b>A propos de de Celluloïd</b>
    </Typography>
    <Typography variant="subheading" gutterBottom={true}>
      Le développement de la plateforme *Celluloïd* s’inscrit dans le
      cadre d’un projet de recherche porté par Michaël Bourgatte et
      Laurent Tessier au sein de l’Atelier du Numérique de l’Institut Catholique de Paris.
    </Typography>
    <Typography variant="subheading" gutterBottom={true}>
      Le développement de cette plateforme d’annotation vidéo à vocation pédagogique
      a bénéficié du soutien de la Fondation Saint Matthieu.
    </Typography>
    <Typography variant="subheading" gutterBottom={true}>
      Celluloïd est un projet Open Source, l’ensemble du code est accessible
      librement <a href="https://github.com/celluloid-edu/">sur github</a>
    </Typography>
    <div
      style={{
        padding: 48,
        textAlign: 'center'
      }}
    >
      <Grid container={true} spacing={40} direction="row" justify="center">
        <Grid item={true}>
          <a href="https://www.icp.fr/">
            <img src={logoIcp} height="100px" alt="Institut Catholique de Paris" />
          </a>
        </Grid>
        <Grid item={true}>
          <a href="https://fondation-st-matthieu.org/">
            <img src={logoFsm} height="100px" alt="Fondation Saint-Matthieu" />
          </a>
        </Grid>
        <Grid item={true}>
          <a href="https://www.lapaillasse.org/">
            <img src={logoLp} height="100px" alt="La Paillasse" />
          </a>
        </Grid>
        <Grid item={true}>
          <a href="https://celluloid.hypotheses.org">
            <img src={logoBlog} height="100px" alt="Le blog Celluloid" />
          </a>
        </Grid>
      </Grid>
    </div>
  </div>
);
