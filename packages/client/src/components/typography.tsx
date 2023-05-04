import { styled, Typography } from "@mui/material";

// eslint-disable-next-line react-refresh/only-export-components
export const StyledTitle = styled(Typography)(({ theme }) => ({
  display: "inline-block",
  borderTopColor: "#000000",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  paddingBottom: theme.spacing(2),
  marginTop: theme.spacing(4),
  fontFamily: "abril_fatfaceregular",
}));
