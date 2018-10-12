import { Grid, Typography } from '@material-ui/core';
import * as React from 'react';

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
    <Typography variant="display3" gutterBottom={true}>
      {`À propos`}
    </Typography>
    <Typography variant="subtitle1" gutterBottom={true}>
      Le développement de la plateforme <b>Celluloid</b> s’inscrit dans le
      cadre d’un projet de recherche porté par Michaël Bourgatte et
      Laurent Tessier au sein de l’Atelier du Numérique de l’Institut Catholique de Paris.
    </Typography>
    <Typography variant="subtitle1" gutterBottom={true}>
      Le développement de cette plateforme d’annotation vidéo à vocation pédagogique
      a bénéficié du soutien de la Fondation Saint Matthieu.
    </Typography>
    <Typography variant="subtitle1" gutterBottom={true}>
      Celluloid est un projet Open Source développé par Erwan Queffélec
      dans le cadre d'un partenariat avec La Paillasse, l’ensemble du code est accessible
      librement <a href="https://github.com/celluloid-camp/">sur GitHub</a>
    </Typography>
    <div
      style={{
        padding: 48,
        textAlign: 'center'
      }}
    >
      <Grid container={true} spacing={40} direction="row" justify="center">
        <Grid item={true}>
          <a href="https://www.icp.fr/" target="_blank">
            <img src={logoIcp} height="100px" alt="Institut Catholique de Paris" />
          </a>
        </Grid>
        <Grid item={true}>
          <a href="https://fondation-st-matthieu.org/" target="_blank">
            <img src={logoFsm} height="100px" alt="Fondation Saint-Matthieu" />
          </a>
        </Grid>
        <Grid item={true}>
          <a href="https://www.lapaillasse.org/" target="_blank">
            <img src={logoLp} height="100px" alt="La Paillasse" />
          </a>
        </Grid>
        <Grid item={true}>
          <a href="https://celluloid.hypotheses.org" target="_blank">
            <img src={logoBlog} height="100px" alt="Le blog Celluloid" />
          </a>
        </Grid>
      </Grid>
    </div>
  </div>
);
