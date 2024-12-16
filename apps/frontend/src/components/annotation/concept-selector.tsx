import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import { useConceptsQuery } from "~utils/concepts";
import { grey } from "@mui/material/colors";

export function ConceptSelector() {
  const { data } = useConceptsQuery();
  const [concept, setConcept] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setConcept(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={concept}
        hiddenLabel
        onChange={handleChange}
        sx={{
          color: "white",
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: grey[800],
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          ".MuiSvgIcon-root": {
            color: "white",
          },
        }}
      >
        <MenuItem value="">
          <em>Sélectionner un concept</em>
        </MenuItem>
        {data?.map((concept) => (
          <MenuItem key={concept.concept} value={concept.concept}>
            {concept.concept}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
