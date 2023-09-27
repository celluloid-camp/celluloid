import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { AnyAction } from "redux";

interface Props {
  heading?: string | null;
  actionName: string;
  onSubmit(): Promise<AnyAction> | AnyAction;
}

const DialogAltButtons = ({ actionName, onSubmit, heading }: Props) => (
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
export default DialogAltButtons;
