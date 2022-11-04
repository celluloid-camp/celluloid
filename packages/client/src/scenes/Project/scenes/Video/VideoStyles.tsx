import { createStyles, Theme } from '@material-ui/core';

export const styles = ({ spacing, palette }: Theme) => createStyles({
  hintBox: {
    overflowY: 'auto' as 'auto',
    overflowX: 'hidden' as 'hidden',
    height: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute' as 'absolute',
    transition: 'all 0.5s ease',
    bottom: spacing.unit * 7,
    width: '100%'
  },
  hintBoxExpanded: {
    height: `calc(100% - ${spacing.unit * 7}px)`
  },
  hintBoxCollapsed: {
    height: 0
  },
  videoWrapper: {
    position: 'relative' as 'relative',
    width: '100%',
    paddingBottom: '56.25%',
    backgroundColor: 'black',
  },
  videoIframe: {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 0,
  },
  glassPane: {
    opacity: 0,
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 0,
    margin: 0,
  },
  annotationFrame: {
    overflowY: 'auto' as 'auto',
    overflowX: 'hidden' as 'hidden',
    maxHeight: `calc(100% - ${spacing.unit * 18}px)`,
    verticalAlign: 'middle',
    textAlign: 'left' as 'left',
    color: 'white',
    transition: 'all 0.5s ease',
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  controlFrame: {
    textAlign: 'left' as 'left',
    color: 'white',
    position: 'absolute' as 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: spacing.unit * 7,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    transition: 'all 0.5s ease',
    padding: 0
  },
  annotateButton: {
    right: spacing.unit * 2,
    bottom: spacing.unit * 9,
    position: 'absolute' as 'absolute',
    zIndex: 2
  },
  visible: {
    opacity: 1
  },
  hidden: {
    opacity: 0
  },
  progressWrapper: {
    width: '100%',
    height: '50vh',
  },
  progress: {
    color: '#ffff',
  },
  linearContainer: {
    position: 'absolute' as 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1,
    transition: 'all 0.5s ease',
    padding: 0
  },
  linearColorPrimary: {
    backgroundColor: "#0000",
  },
  linearBarColorPrimary: {
    backgroundColor: palette.secondary.dark,
  },
});