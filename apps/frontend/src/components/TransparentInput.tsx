import { Box, Fade, FormHelperText, Input, InputProps } from "@mui/material";
import React from "react";

type Props = InputProps & {
  error?: string;
  unpadded?: boolean;
};

export const TransparentInput: React.FC<Props> = ({
  error,
  unpadded,
  ...props
}) => (
  <Box
    display={"flex"}
    flex={1}
    flexDirection={"column"}
    sx={{
      borderRadius: 2,
      position: "relative",
      transition: "all 0.1s ease-out",
      paddingTop: unpadded ? 0.3 : 1,
    }}
  >
    <Input
      multiline={true}
      autoFocus={true}
      disableUnderline
      error={Boolean(error)}
      sx={{
        color: "white",
        padding: 1,
        paddingX: 2,
        borderRadius: 2,
        backgroundColor: "rgba(100, 100, 100, 0.2)",
      }}
      fullWidth={true}
      {...props}
    />
    <Fade in={Boolean(error)} appear={true}>
      <FormHelperText error={true}>{error}</FormHelperText>
    </Fade>
  </Box>
);
