import { Box, Typography } from "@mui/material";
import * as React from "react";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     center: {
//       justifyContent: "center",
//     },
//     left: {
//       justifyContent: "flex-start",
//     },
//     right: {
//       justifyContent: "flex-end",
//     },
//     root: {
// display: "flex",
// flexWrap: "wrap",
// paddingTop: spacing.unit,
// paddingBottom: spacing.unit * 2,
//     },
//   });

interface Props {
  error?: string;
  small?: boolean;
  align?: "right" | "center" | "left";
}

export default ({ align, error, small }: Props) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        paddingTop: 1,
        paddingBottom: 2,
        justifyContent: align,
      }}
    >
      <Typography
        align={align}
        color="error"
        variant={small ? "caption" : "body2"}
      >
        {error}
      </Typography>
    </Box>
  );
};
