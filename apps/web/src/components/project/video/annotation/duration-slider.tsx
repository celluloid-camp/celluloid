import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { Grid, IconButton, Stack, styled, TextField } from "@mui/material";
import { grey } from "@mui/material/colors";
import Slider, { type SliderValueLabelProps } from "@mui/material/Slider";
import Tooltip, {
  type TooltipProps,
  tooltipClasses,
} from "@mui/material/Tooltip";
import React from "react";

import { useVideoPlayerSeekEvent } from "@/hooks/use-video-player";
import { formatDuration } from "@/utils/duration";

type DurationSliderProps = {
  duration: number;
  startTime: number;
  stopTime: number;
  onChange: (start: number, stop: number) => void;
  mono?: boolean;
};

const minDistance = 1;

// Parse time string (MM:SS or M:SS) to seconds
function parseTimeToSeconds(timeString: string): number | null {
  // Remove whitespace
  const cleaned = timeString.trim();

  // Match patterns: M:SS, MM:SS, H:MM:SS, or just numbers (seconds)
  const patterns = [
    /^(\d{1,2}):(\d{2})$/, // MM:SS or M:SS
    /^(\d{1,2}):(\d{2}):(\d{2})$/, // H:MM:SS
    /^\d+$/, // Just numbers (seconds)
  ];

  // Try MM:SS pattern first
  const match1 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match1) {
    const minutes = Number.parseInt(match1[1], 10);
    const seconds = Number.parseInt(match1[2], 10);
    if (seconds >= 60 || isNaN(minutes) || isNaN(seconds)) return null;
    return minutes * 60 + seconds;
  }

  // Try H:MM:SS pattern
  const match2 = cleaned.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (match2) {
    const hours = Number.parseInt(match2[1], 10);
    const minutes = Number.parseInt(match2[2], 10);
    const seconds = Number.parseInt(match2[3], 10);
    if (
      minutes >= 60 ||
      seconds >= 60 ||
      isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(seconds)
    )
      return null;
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Try just numbers (treat as seconds)
  if (/^\d+$/.test(cleaned)) {
    return Number.parseInt(cleaned, 10);
  }

  return null;
}

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: grey[900],
    borderWidth: 1,
    borderColor: theme.palette.common.white,
    borderStyle: "solid",
  },
}));

function ValueLabelComponent(props: SliderValueLabelProps) {
  const { children, value } = props;

  return (
    <StyledTooltip open placement="top" title={value}>
      {children}
    </StyledTooltip>
  );
}

export const DurationSlider: React.FC<DurationSliderProps> = React.memo(
  ({ duration, startTime = 60, stopTime = 1000, mono = false, onChange }) => {
    const [value, setValue] = React.useState<number | number[]>(
      mono ? startTime : [startTime, stopTime],
    );
    const [lastActiveThumb, setLastActiveThumb] = React.useState<
      number | undefined
    >();
    const currentValueMemo = React.useMemo((): number[] => {
      if (mono) {
        const singleValue = value as number;
        return [singleValue, singleValue];
      }
      return value as number[];
    }, [mono, value]);

    const [startInputValue, setStartInputValue] = React.useState<string>(() =>
      formatDuration(currentValueMemo[0]),
    );
    const [stopInputValue, setStopInputValue] = React.useState<string>(() =>
      formatDuration(currentValueMemo[1]),
    );
    const [isEditingStart, setIsEditingStart] = React.useState(false);
    const [isEditingStop, setIsEditingStop] = React.useState(false);
    const dispatcher = useVideoPlayerSeekEvent();

    // Sync value with mono/startTime/stopTime changes
    React.useEffect(() => {
      if (mono) {
        setValue((prev) => (Array.isArray(prev) ? prev[0] : prev));
      } else {
        setValue((prev) => (Array.isArray(prev) ? prev : [prev, stopTime]));
      }
    }, [mono, stopTime]);

    const handleChange = React.useCallback(
      (
        _event: React.SyntheticEvent | Event,
        newValue: number | number[],
        activeThumb?: number,
      ) => {
        if (mono) {
          const singleValue = Array.isArray(newValue) ? newValue[0] : newValue;
          setValue(singleValue);
          onChange(singleValue, singleValue);
          return;
        }
        if (!Array.isArray(newValue)) return;
        if (newValue[1] - newValue[0] < minDistance) {
          if (activeThumb === 0) {
            const clamped = Math.min(newValue[0], 100 - minDistance);
            setValue([clamped, clamped + minDistance]);
            onChange(clamped, clamped + minDistance);
          } else {
            const clamped = Math.max(newValue[1], minDistance);
            setValue([clamped - minDistance, clamped]);
            onChange(clamped - minDistance, clamped);
          }
        } else {
          setValue(newValue as number[]);
          onChange(newValue[0], newValue[1]);
        }
        if (activeThumb !== undefined) setLastActiveThumb(activeThumb);
      },
      [mono, onChange],
    );

    const handleChangeCommitted = React.useCallback(
      (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
        if (mono) {
          const singleValue = Array.isArray(newValue) ? newValue[0] : newValue;
          dispatcher({ time: singleValue });
          return;
        }
        if (lastActiveThumb !== undefined && Array.isArray(newValue)) {
          const commitValue = newValue[lastActiveThumb];
          dispatcher({ time: commitValue });
        }
      },
      [mono, dispatcher, lastActiveThumb],
    );

    const currentValue = currentValueMemo;

    // Memoized arrow button handlers
    const handleLeftMono = React.useCallback(
      (e: React.MouseEvent) =>
        handleChange(e, Math.max(0, currentValue[0] - 1)),
      [handleChange, currentValue],
    );
    const handleRightMono = React.useCallback(
      (e: React.MouseEvent) =>
        handleChange(e, Math.min(duration, currentValue[0] + 1)),
      [handleChange, currentValue, duration],
    );
    const handleLeftDual = React.useCallback(
      (e: React.MouseEvent) =>
        handleChange(e, [currentValue[0], Math.max(0, currentValue[1] - 1)], 1),
      [handleChange, currentValue],
    );
    const handleRightDual = React.useCallback(
      (e: React.MouseEvent) =>
        handleChange(
          e,
          [currentValue[0], Math.min(duration, currentValue[1] + 1)],
          1,
        ),
      [handleChange, currentValue, duration],
    );
    const handleLeftStart = React.useCallback(
      (e: React.MouseEvent) =>
        handleChange(e, [Math.max(0, currentValue[0] - 1), currentValue[1]], 0),
      [handleChange, currentValue],
    );
    const handleRightStart = React.useCallback(
      (e: React.MouseEvent) =>
        handleChange(
          e,
          [
            Math.min(currentValue[1] - minDistance, currentValue[0] + 1),
            currentValue[1],
          ],
          0,
        ),
      [handleChange, currentValue],
    );

    // Sync input values when not editing
    React.useEffect(() => {
      if (!isEditingStart) {
        setStartInputValue(formatDuration(currentValue[0]));
      }
    }, [currentValue[0], isEditingStart]);

    React.useEffect(() => {
      if (!isEditingStop) {
        setStopInputValue(formatDuration(currentValue[1]));
      }
    }, [currentValue[1], isEditingStop]);

    // Handlers for manual text input
    const handleStartInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setStartInputValue(inputValue);
        setIsEditingStart(true);
      },
      [],
    );

    const handleStartInputBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.trim();
        setIsEditingStart(false);

        if (inputValue === "") {
          setStartInputValue(formatDuration(currentValue[0]));
          return;
        }

        const numValue = parseTimeToSeconds(inputValue);
        if (numValue === null) {
          // Invalid format, revert to current value
          setStartInputValue(formatDuration(currentValue[0]));
          return;
        }

        const clampedValue = Math.max(0, Math.min(duration, numValue));
        if (mono) {
          handleChange(e, clampedValue);
        } else {
          const newStartValue = Math.min(
            clampedValue,
            currentValue[1] - minDistance,
          );
          handleChange(e, [newStartValue, currentValue[1]], 0);
        }
      },
      [handleChange, currentValue, duration, mono, minDistance],
    );

    const handleStopInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setStopInputValue(inputValue);
        setIsEditingStop(true);
      },
      [],
    );

    const handleStopInputBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.trim();
        setIsEditingStop(false);

        if (inputValue === "") {
          setStopInputValue(formatDuration(currentValue[1]));
          return;
        }

        const numValue = parseTimeToSeconds(inputValue);
        if (numValue === null) {
          // Invalid format, revert to current value
          setStopInputValue(formatDuration(currentValue[1]));
          return;
        }

        const clampedValue = Math.max(0, Math.min(duration, numValue));
        const newStopValue = Math.max(
          clampedValue,
          currentValue[0] + minDistance,
        );
        handleChange(e, [currentValue[0], newStopValue], 1);
      },
      [handleChange, currentValue, duration, minDistance],
    );

    return (
      <Grid container alignItems="center" spacing={1}>
        <Stack direction={"row"} alignItems="center">
          <IconButton
            size="small"
            color="secondary"
            sx={{ p: 0 }}
            onClick={mono ? handleLeftMono : handleLeftStart}
          >
            <ArrowLeftIcon />
          </IconButton>
          <TextField
            type="text"
            value={startInputValue}
            onChange={handleStartInputChange}
            onBlur={handleStartInputBlur}
            size="small"
            inputProps={{
              pattern: "([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}",
              placeholder: "00:00",
              style: { textAlign: "center" },
            }}
            sx={{
              width: "60px",
              "& .MuiInputBase-input": {
                padding: "4px 8px",
                fontSize: "0.8rem",
                color: "white",
              },
            }}
          />
          <IconButton
            size="small"
            color="secondary"
            sx={{ p: 0 }}
            onClick={mono ? handleRightMono : handleRightStart}
          >
            <ArrowRightIcon />
          </IconButton>
        </Stack>
        <Grid item xs>
          <Slider
            value={value}
            onChange={handleChange}
            valueLabelFormat={formatDuration}
            onChangeCommitted={handleChangeCommitted}
            step={1}
            size="small"
            min={0}
            max={duration}
            color="secondary"
            sx={{ mb: 0.5 }}
            disableSwap={!mono}
            // slots={{ valueLabel: ValueLabelComponent }}
          />
        </Grid>
        {!mono && (
          <Stack direction={"row"} alignItems="center" sx={{ ml: 2 }}>
            <IconButton
              size="small"
              color="secondary"
              sx={{ p: 0 }}
              onClick={handleLeftDual}
            >
              <ArrowLeftIcon />
            </IconButton>
            <TextField
              type="text"
              value={stopInputValue}
              onChange={handleStopInputChange}
              onBlur={handleStopInputBlur}
              size="small"
              inputProps={{
                pattern: "([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}",
                placeholder: "00:00",
                style: { textAlign: "center" },
              }}
              sx={{
                width: "60px",
                "& .MuiInputBase-input": {
                  padding: "4px 8px",
                  fontSize: "0.8rem",
                  color: "white",
                },
              }}
            />
            <IconButton
              size="small"
              color="secondary"
              sx={{ p: 0 }}
              onClick={handleRightDual}
            >
              <ArrowRightIcon />
            </IconButton>
          </Stack>
        )}
      </Grid>
    );
  },
);
