import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { AnyAction } from "redux";

interface Props {
  heading?: string;
  actionName: string;
  onSubmit(): Promise<AnyAction> | AnyAction;
}

export default ({ actionName, onSubmit, heading }: Props) => (
  <Box
    sx={{
      justifyContent: "center",
      display: "flex",
      paddingTop: 8,
      flexDirection: "column",
      flexWrap: "wrap",
    }}
  >
    {heading && (
      <Typography variant="caption" style={{ textAlign: "center" }}>
        {heading}
      </Typography>
    )}
    <Button size="small" onClick={onSubmit} color="primary">
      {actionName}
    </Button>
  </Box>
);
