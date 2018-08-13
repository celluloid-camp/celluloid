import * as React from 'react';
import { UnfurlData } from '@celluloid/commons';
import Typography from '@material-ui/core/Typography';
import CardMedia from '@material-ui/core/CardMedia';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core/styles';
import { TransitionGroup } from 'react-transition-group';
import { Collapse } from '@material-ui/core';

const styles = ({ spacing, typography }: Theme) => createStyles({
  content: {
    ...typography.caption,
    color: '#CCC',
    '& a:any-link': {
      color: '#42a6f5'
    },
  },
  media: {
    marginTop: spacing.unit,
    marginBottom: spacing.unit,
    height: 0,
    paddingTop: '56.25%'
  },
  title: {
    ...typography.subheading,
    color: 'white',
  },
  subheader: {
    ...typography.caption,
    color: '#CCC'
  },
  card: {
    maxWidth: 320,
    cursor: 'pointer',
    margin: spacing.unit,
    marginLeft: 0,
    paddingLeft: spacing.unit,
    borderLeft: `${spacing.unit / 2}px solid rgba(100, 100, 100, 0.4)`
  },
});

interface Link {
  url: string;
  data?: UnfurlData;
}

interface Props extends WithStyles<typeof styles> {
  text: string;
  loading: boolean;
  previews: Link[];
  focused: boolean;
}

export default withStyles(styles)(({
  text,
  previews,
  focused,
  classes
}: Props) => (
    <>
      <Typography
        className={classes.content}
        style={focused ? {
          whiteSpace: 'pre-wrap'
        } : {}}
        noWrap={!focused}
        gutterBottom={true}
      >
        <span dangerouslySetInnerHTML={{ __html: text }} />
      </Typography>
      <TransitionGroup appear={true}>
        {focused && previews
          .map(preview => (
            preview.data &&
            <Collapse in={true} key={preview.url} appear={true}>
              <div
                onClick={() => window.open(preview.url, '_blank')}
                key={preview.url}
                className={classes.card}
              >
                <Typography className={classes.subheader}>
                  {preview.data.website}
                </Typography>
                <Typography className={classes.title}>
                  {preview.data.title}
                </Typography>
                {preview.data.imageUrl &&
                  <CardMedia
                    className={classes.media}
                    image={preview.data.imageUrl}
                    title={preview.data.title}
                  />
                }
                {preview.data.description &&
                  <Typography className={classes.content}>
                    {preview.data.description}
                  </Typography>
                }
              </div>
            </Collapse>
          ))}
      </TransitionGroup>
    </>
  ));