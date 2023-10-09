import {
  Box,
  CircularProgress,
  Collapse,
  Switch,
  Typography,
} from "@mui/material";

import DialogError from "./DialogError";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     wrapper: {
//       position: "relative",
//     },
//     error: {
//       position: "absolute",
//       right: 62,
//       top: spacing.unit * 3,
//     },
//     progress: {
//       marginRight: spacing.unit * 2,
//     },
//   });

interface Props {
  label: string;
  checked: boolean;
  loading: boolean;
  onChange: () => void;
  error?: string;
}

const LabeledProgressSwitch: React.FC<Props> = ({
  label,
  checked,
  loading,
  error,
  onChange,
}) => (
  <Box sx={{ position: "relative" }}>
    <Typography
      variant="body2"
      align="left"
      gutterBottom={true}
      component="div"
    >
      <Switch checked={checked} onChange={() => onChange()} />
      {label}
      {loading && (
        <CircularProgress
          color="primary"
          sx={{ marginLeft: 2 }}
          size={16}
          variant="indeterminate"
        />
      )}
    </Typography>
    <div
    // className={classes.error}
    >
      <Collapse in={error ? true : false} appear={true}>
        <DialogError small={true} align="right" error={error} />
      </Collapse>
    </div>
  </Box>
);

export default LabeledProgressSwitch;
