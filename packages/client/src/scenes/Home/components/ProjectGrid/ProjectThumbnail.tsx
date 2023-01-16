import VisibilityChip from "components/VisibilityChip";
import { ProjectGraphRecord } from "@celluloid/types";
import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  createStyles,
  Grid,
  Grow as GrowMUI,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import PlayIcon from "@material-ui/icons/PlayCircleOutline";
import { push } from "connected-react-router";
import * as React from "react";
import { connect } from "react-redux";
import { AnyAction, Dispatch } from "redux";
import Shiitake, { ShiitakeProps } from "shiitake";
import { GrowProps } from "@material-ui/core/Grow";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import VideoApi from "services/VideoService";
import { useNavigate } from "react-router-dom";

const Grow: React.FC<React.PropsWithChildren & GrowProps> = (props) => (
  <GrowMUI {...props} />
);

const ShiitakeFix: React.FC<React.PropsWithChildren & ShiitakeProps> = (
  props
) => <Shiitake {...props} />;

const styles = ({ palette, spacing, typography }: Theme) =>
  createStyles({
    card: {
      height: "100%",
      "& a:any-link": {
        textDecoration: "none",
      },
      transition: "all 0.2s ease",
      cursor: "pointer",
    },
    image: {
      height: spacing.unit * 27,
      textAlign: "center",
      padding: spacing.unit * 6,
      position: "relative",
    },
    visibilityContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      position: "absolute",
      right: 0,
      top: 0,
      padding: spacing.unit,
    },
    visibilityChip: {
      backgroundColor: palette.secondary.dark,
      color: "white",
      margin: spacing.unit,
    },
    tagList: {
      display: "flex",
      justifyContent: "flex-start",
      flexWrap: "wrap",
      paddingTop: spacing.unit * 3,
    },
    tag: {
      margin: spacing.unit / 2,
    },
    iconWrapper: {
      position: "relative",
      top: 0,
      left: 0,
      right: 0,
    },
    icon: {
      width: spacing.unit * 7,
      height: spacing.unit * 7,
      color: palette.grey[100],
    },
    title: {
      position: "relative",
      color: palette.grey[100],
      lineHeight: 1.25,
      textAlign: "left",
    },
    titleWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: spacing.unit * 9,
      padding: spacing.unit * 2,
      position: "absolute",
      zIndex: 3,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    objective: {
      height: spacing.unit * 2,
      ...typography.subtitle1,
      fontWeight: 500,
      color: palette.grey[800],
      lineHeight: 1.25,
      textAlign: "left",
    },
    username: {
      paddingTop: spacing.unit * 3,
      color: palette.grey[700],
      textAlign: "left",
    },
    publishedAt: {
      color: palette.grey[600],
      textAlign: "left",
    },
  });

interface Props extends WithStyles<typeof styles> {
  showPublic: boolean;
  project: ProjectGraphRecord;
}

const ProjectThumbnail: React.FC<Props> = ({
  classes,
  project,
  showPublic,
}) => {
  const [elevated, setElevated] = useState(false);

  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["video", project.host, project.videoId],
    queryFn: () => VideoApi.getPeerTubeVideo(project.host, project.videoId),
  });

  const onClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <Grid
      xs={12}
      sm={6}
      lg={4}
      xl={3}
      item={true}
      style={{ textAlign: "center" }}
    >
      <Grow
        style={{ transformOrigin: "0 0 0" }}
        in={true}
        appear={true}
        key={project.id}
      >
        <Card
          raised={elevated}
          className={classes.card}
          onMouseOver={() => setElevated(true)}
          onMouseOut={() => setElevated(false)}
          onClick={() => onClick()}
        >
          <CardMedia
            image={`https://${project.host}${query.data?.thumbnailPath}`}
            className={classes.image}
          >
            {/* <div className={classes.iconWrapper}>
              <PlayIcon className={classes.icon} />
            </div> */}
            <div className={classes.visibilityContainer}>
              {showPublic && (
                <VisibilityChip show={project.public} label="public" />
              )}
              <VisibilityChip
                show={project.collaborative}
                label="collaboratif"
              />
            </div>
            <div className={classes.titleWrapper}>
              <Typography className={classes.title} variant="h6">
                <ShiitakeFix lines={2} tagName="span">
                  {project.title}
                </ShiitakeFix>
              </Typography>
            </div>
          </CardMedia>
          <CardContent>
            <Grid
              container={true}
              direction="column"
              justify="space-between"
              alignItems="stretch"
            >
              <Grid item={true} xs={12}>
                <Typography gutterBottom={true} className={classes.objective}>
                  <ShiitakeFix lines={3} tagName="span">
                    {project.objective}
                  </ShiitakeFix>
                </Typography>
              </Grid>
              <Grid item={true} xs={12}>
                <Typography className={classes.username}>
                  {project.user.username}
                </Typography>
                <Typography variant="caption" className={classes.publishedAt}>
                  {new Date(project.publishedAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item={true} xs={12}>
                <div className={classes.tagList}>
                  {project.tags.map((tag, index) => (
                    <Chip
                      className={classes.tag}
                      key={index}
                      label={tag.name}
                    />
                  ))}
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grow>
    </Grid>
  );
};

export default withStyles(styles)(ProjectThumbnail);
