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
import React from "react";
import { useTranslation } from "react-i18next";

import { StyledRange } from "~components/slider/range";
import { formatDuration } from "~utils/DurationUtils";

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
  <Box>
    <IconButton onClick={onBack} color="secondary">
      <ArrowLeftIcon />
    </IconButton>

    <Typography variant="caption">{formatDuration(position)}</Typography>
    <IconButton onClick={onForward} color="secondary">
      <ArrowRightIcon />
    </IconButton>
  </Box>
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
            <Box display={"flex"} flex={1} paddingY={4} paddingX={2}>
              <StyledRange
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
                allowCross={false}
              />
            </Box>
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
