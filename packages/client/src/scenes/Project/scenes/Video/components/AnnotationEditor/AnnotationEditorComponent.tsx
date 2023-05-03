import "rc-slider/assets/index.css";

import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Clear";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Checkbox,
  ClickAwayListener,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { Range } from "rc-slider";
import React from "react";
import { useTranslation } from "react-i18next";

import caretStart from "~images/caret-start.png";
import caretStop from "~images/caret-stop.png";
import { formatDuration } from "~utils/DurationUtils";
import { sliderRailStyle, sliderTrackStyle } from "~utils/SliderUtils";

import TransparentInput from "../TransparentInput";

interface Props {
  startTime: number;
  stopTime: number;
  pause: boolean;
  text: string;
  duration: number;
  error?: string;
  onTextChange(text: string): void;
  onCheckPauseChange(value: boolean): void;
  onTimingChange(value: number, isStart: boolean, seekAhead: boolean): void;
  onClickSave(): void;
  onClickCancel(): void;
}

type TimingControlProps = {
  position: number;
  onBack(): void;
  onForward(): void;
};

const TimingControl: React.FC<TimingControlProps> = ({
  onBack,
  position,
  onForward,
}) => (
  <>
    <IconButton onClick={onBack} color="secondary">
      <ArrowLeftIcon />
    </IconButton>

    <Typography variant="caption">{formatDuration(position)}</Typography>
    <IconButton onClick={onForward} color="secondary">
      <ArrowRightIcon />
    </IconButton>
  </>
);

const AnnotationEditorComponent: React.FC<Props> = ({
  startTime,
  stopTime,
  pause,
  text,
  duration,
  error,
  onCheckPauseChange,
  onTimingChange,
  onTextChange,
  onClickSave,
  onClickCancel,
}: Props) => {
  const { t } = useTranslation();

  const handleStyles = {
    border: 0,
    borderRadius: 0,
    backgroundColor: "rgba(0, 0, 0, 0)",
    backgroundSize: "cover",
    width: 12,
    height: 12,
  };

  return (
    <ClickAwayListener onClickAway={onClickCancel}>
      <Box display="flex" flexDirection="row" alignItems="flex-start">
        <Box
          display={"flex"}
          flex={1}
          flexDirection={"column"}
          sx={{
            margin: 1,
            paddingX: 2,
          }}
        >
          <TransparentInput
            value={text}
            error={error}
            onChange={onTextChange}
            placeholder={t("annotation.contentPlaceholder") || ""}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="Send"
                  onClick={onClickSave}
                  edge="end"
                  color="success"
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            }
          />
          <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
            <TimingControl
              onBack={() =>
                onTimingChange(Math.max(0, startTime - 1), true, true)
              }
              onForward={() =>
                onTimingChange(Math.min(stopTime, startTime + 1), true, true)
              }
              position={startTime}
            />
            <div style={{ padding: 8, flexGrow: 1 }}>
              <Range
                min={0}
                max={duration}
                value={[startTime, stopTime]}
                onChange={(values) => {
                  if (startTime !== values[0]) {
                    onTimingChange(values[0], true, false);
                  } else if (stopTime !== values[1]) {
                    onTimingChange(values[1], false, false);
                  }
                }}
                onAfterChange={(values) => {
                  if (startTime !== values[0]) {
                    onTimingChange(values[0], true, true);
                  } else if (stopTime !== values[1]) {
                    onTimingChange(values[1], false, true);
                  }
                }}
                trackStyle={sliderTrackStyle}
                railStyle={sliderRailStyle}
                handleStyle={[
                  {
                    ...handleStyles,
                    marginTop: -11,
                    marginLeft: -5,
                    backgroundImage: `url(${caretStart})`,
                  },
                  {
                    ...handleStyles,
                    marginTop: 3,
                    marginLeft: -6,
                    backgroundImage: `url(${caretStop})`,
                  },
                ]}
                allowCross={false}
              />
            </div>
            <TimingControl
              onBack={() =>
                onTimingChange(Math.max(startTime, stopTime - 1), false, true)
              }
              onForward={() =>
                onTimingChange(Math.min(stopTime + 1, duration), false, true)
              }
              position={stopTime}
            />
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-end"
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={pause}
                  onChange={(event) => onCheckPauseChange(event.target.checked)}
                />
              }
              label={t("annotation.pauseLabel")}
            />
            <IconButton color="secondary" onClick={() => onClickCancel()}>
              <CancelIcon />
            </IconButton>
            <IconButton color="success" onClick={() => onClickSave()}>
              <CheckIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </ClickAwayListener>
  );
};

export default AnnotationEditorComponent;
