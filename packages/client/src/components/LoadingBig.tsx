import { Box, CircularProgress } from "@mui/material";

// const styles = createStyles({
//   wrapper: {
//     width: 100,
//     height: 100,
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     left: 0,
//     right: 0,
//     margin: "auto",
//   },
// });

export default () => (
  <Box
    sx={{
      width: 100,
      height: 100,
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      margin: "auto",
    }}
  >
    <CircularProgress size={100} />
  </Box>
);
