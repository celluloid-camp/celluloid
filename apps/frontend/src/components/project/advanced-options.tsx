import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Paper } from "@mui/material";

export function AdvancedOptions() {
  return (
    <Paper
      sx={{
        paddingX: 3,
        marginY: 2,
        paddingY: 3,
      }}
    >
      <FormControl>
        <FormLabel id="mode-row-radio-buttons-group-label">Mode</FormLabel>
        <RadioGroup
          row
          aria-labelledby="mode-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
        >
          <FormControlLabel
            value="analyze"
            control={<Radio />}
            label="Analyze"
          />
          <FormControlLabel
            value="performance"
            control={<Radio />}
            label="Performance"
          />
        </RadioGroup>
      </FormControl>
    </Paper>
  );
}
