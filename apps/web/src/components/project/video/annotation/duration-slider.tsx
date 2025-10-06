import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { Grid, IconButton, Stack, styled } from "@mui/material";
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

    const currentValue = React.useMemo((): number[] => {
      if (mono) {
        const singleValue = value as number;
        return [singleValue, singleValue];
      }
      return value as number[];
    }, [mono, value]);

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

    return (
      <Grid container spacing={2} alignItems="center">
        <Stack direction={"row"}>
          <IconButton
            size="small"
            color="secondary"
            sx={{ p: 0 }}
            onClick={handleLeftMono}
          >
            <ArrowLeftIcon />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            sx={{ p: 0 }}
            onClick={handleRightMono}
          >
            <ArrowRightIcon />
          </IconButton>
        </Stack>
        <Grid item xs>
          <Slider
            getAriaLabel={React.useCallback(
              () => (mono ? "Mono annotation slider" : "Annotation slider"),
              [mono],
            )}
            value={value}
            onChange={handleChange}
            valueLabelFormat={formatDuration}
            onChangeCommitted={handleChangeCommitted}
            step={1}
            size="small"
            valueLabelDisplay="on"
            min={0}
            max={duration}
            color="secondary"
            disableSwap={!mono}
            slots={{ valueLabel: ValueLabelComponent }}
            sx={{ mb: 1 }}
          />
        </Grid>
        {!mono && (
          <Stack direction={"row"}>
            <IconButton
              size="small"
              color="secondary"
              sx={{ p: 0 }}
              onClick={handleLeftDual}
            >
              <ArrowLeftIcon />
            </IconButton>
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
