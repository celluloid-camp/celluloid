import "rc-slider/assets/index.css";

import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Clear";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
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

// const styles = (theme: Theme) =>
//   createStyles({
//     root: {
//       paddingLeft: theme.spacing.unit,
//       paddingTop: theme.spacing.unit,
//       display: "flex",
//       flexDirection: "row",
//       alignItems: "flex-start",
//     },
//     content: {
//       flex: "1 1 auto",
//       minWidth: 0,
//       padding: `0 ${theme.spacing.unit * 2}px`,
//       "&:first-child": {
//         paddingLeft: 0,
//       },
//       margin: 10,
//     },
//     buttons: {
//       display: "flex",
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "flex-end",
//     },
//     timeline: {
//       display: "flex",
//       flexDirection: "row",
//       alignItems: "center",
//     },
//     buttonRoot: {
//       fontSize: 10,
//       lineHeight: "20px",
//       minWidth: 20,
//       minHeight: 20,
//       maxWidth: 20,
//       maxHeight: 20,
//       margin: 4,
//       marginBottom: 7,
//       padding: 0,
//       borderRadius: "50%",
//     },
//   });

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

interface TimingButtonProps {
  forward: boolean;
  onSeek(): void;
}

interface TimingControlProps {
  position: number;
  onBack(): void;
  onForward(): void;
}

const TimingButton = (props: TimingButtonProps) => (
  <Button
    sx={{
      fontSize: 10,
      lineHeight: "20px",
      minWidth: 20,
      minHeight: 20,
      maxWidth: 20,
      maxHeight: 20,
      margin: 4,
      marginBottom: 7,
      padding: 0,
      borderRadius: "50%",
    }}
    size="small"
    onClick={() => {
      props.onSeek();
    }}
  >
    {!props.forward ? `◀` : `▶`}
  </Button>
);

const TimingControl = (props: TimingControlProps) => (
  <>
    <TimingButton forward={false} onSeek={props.onBack} />
    <Typography variant="caption">{formatDuration(props.position)}</Typography>
    <TimingButton forward={true} onSeek={props.onForward} />
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
    <Box
      sx={{
        paddingLeft: 1,
        paddingTop: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          flex: "1 1 auto",
          minWidth: 0,
          paddingX: 2,
          "&:first-child": {
            paddingLeft: 0,
          },
          margin: 10,
        }}
      >
        <TransparentInput
          text={text}
          error={error}
          onChange={onTextChange}
          placeholder={t("annotation.contentPlaceholder") || ""}
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
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
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
          <IconButton color="primary" onClick={() => onClickSave()}>
            <CheckIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AnnotationEditorComponent;
