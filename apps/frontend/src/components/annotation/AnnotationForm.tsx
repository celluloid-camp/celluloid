import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CenterFocusStrongOutlinedIcon from "@mui/icons-material/CenterFocusStrongOutlined";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  Checkbox,
  ClickAwayListener,
  FormControlLabel,
  IconButton,
  InputBase,
  Slider,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import * as React from "react";
import { forwardRef, useState } from "react";

import { DurationSlider } from "./DurationSlider";

type AnnotationFormProps = {
  duration: number;
};

export const AnnotationForm = forwardRef(
  ({ duration }: AnnotationFormProps, ref) => {
    const [showForm, setShowForm] = useState(false);

    if (!showForm) {
      return (
        <Button onClick={() => setShowForm(true)}>
          Ajouter une annotation
        </Button>
      );
    } else {
      return (
        <ClickAwayListener onClickAway={() => setShowForm(false)}>
          <Box
            component="form"
            ref={ref}
            sx={{ flexShrink: 0, pt: 5, paddingX: 2 }}
          >
            <DurationSlider duration={duration} />

            <Box
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                backgroundColor: grey[800],
                borderRadius: 1,
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Saissez votre annotation"
                multiline
                inputProps={{ "aria-label": "Saissez votre annotation" }}
              />
              <IconButton color="primary" sx={{ p: "10px" }}>
                <SendIcon />
              </IconButton>
            </Box>

            <div>
              <FormControlLabel
                label="Ajouter contexte"
                sx={{ color: "white" }}
                control={
                  <Checkbox
                    icon={<CenterFocusStrongOutlinedIcon />}
                    checkedIcon={<CenterFocusStrongIcon color="secondary" />}
                  />
                }
              />

              <FormControlLabel
                sx={{ color: "white" }}
                label="Mettre en pause ?"
                control={<Checkbox color="secondary" />}
              />
            </div>
          </Box>
        </ClickAwayListener>
      );
    }
  }
);
