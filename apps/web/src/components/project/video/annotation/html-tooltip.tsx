import { grey } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import Tooltip, {
  tooltipClasses,
  type TooltipProps,
} from "@mui/material/Tooltip";
import React from "react";

export const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    color: "#f5f5f9",
    maxWidth: 300,
    minWidth: 150,
    backgroundColor: grey[900],
    borderColor: grey[800],
    borderWidth: 1,
    borderStyle: "solid",
  },
}));
