import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import { AnyAction } from "redux";

interface Props {
  actionName: string;
  onSubmit(): Promise<AnyAction>;
}

export default ({ actionName, onSubmit }: Props) => (
  <DialogActions
    sx={{
      marginTop: 2,
      justifyContent: "space-around",
    }}
  >
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Button type="submit" variant="contained" color="secondary">
        {actionName}
      </Button>
    </form>
  </DialogActions>
);
