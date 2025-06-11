import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { Grid, IconButton, Stack, styled } from "@mui/material";
import Slider, { type SliderValueLabelProps } from "@mui/material/Slider";
import Tooltip, {
  tooltipClasses,
  type TooltipProps,
} from "@mui/material/Tooltip";
import { grey } from "@mui/material/colors";
import * as React from "react";

import { useVideoPlayerSeekEvent } from "@/hooks/use-video-player";
import { formatDuration } from "@/utils/duration";

type DurationSliderProps = {
  duration: number;
  startTime: number;
  stopTime: number;
  onChange: (start: number, stop: number) => void;
  mono?: boolean;
};

const minDistance = 5;

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

export const DurationSlider: React.FC<DurationSliderProps> = ({
  duration,
  startTime = 60,
  stopTime = 1000,
  mono = false,
  onChange,
}) => {
  // For mono mode, use single value; for normal mode, use array
  const [value, setValue] = React.useState<number | number[]>(
    mono ? startTime : [startTime, stopTime],
  );

  const [lastActiveThumb, setLastActiveThumb] = React.useState<
    number | undefined
  >();

  const dispatcher = useVideoPlayerSeekEvent();

  const handleChange = (
    _event: React.SyntheticEvent | Event,
    newValue: number | number[],
    activeThumb?: number,
  ) => {
    if (mono) {
      // Mono mode: single value
      const singleValue = Array.isArray(newValue) ? newValue[0] : newValue;
      setValue(singleValue);
      onChange(singleValue, singleValue); // Both start and stop are the same
      return;
    }

    // Normal mode: dual thumb logic
    if (!Array.isArray(newValue)) {
      return;
    }

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

    if (activeThumb !== undefined) {
      setLastActiveThumb(activeThumb);
    }
  };

  const handleChangeCommitted = (
    _event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => {
    if (mono) {
      const singleValue = Array.isArray(newValue) ? newValue[0] : newValue;
      dispatcher({
        time: singleValue,
      });
      return;
    }

    if (lastActiveThumb !== undefined && Array.isArray(newValue)) {
      const commitValue = newValue[lastActiveThumb];
      dispatcher({
        time: commitValue,
      });
    }
  };

  // Helper function to get current value as array for consistent handling
  const getCurrentValue = (): number[] => {
    if (mono) {
      const singleValue = value as number;
      return [singleValue, singleValue];
    }
    return value as number[];
  };

  const currentValue = getCurrentValue();

  return (
    <Grid container spacing={2} alignItems="center">
      {/* Left arrow buttons - only show start time controls in mono mode */}
      <Stack direction={"row"}>
        <IconButton
          size="small"
          color="secondary"
          sx={{ p: 0 }}
          onClick={(e) => {
            if (mono) {
              handleChange(e, Math.max(0, currentValue[0] - 1));
            } else {
              handleChange(
                e,
                [Math.max(0, currentValue[0] - 1), currentValue[1]],
                0,
              );
            }
          }}
        >
          <ArrowLeftIcon />
        </IconButton>
        <IconButton
          size="small"
          color="secondary"
          sx={{ p: 0 }}
          onClick={(e) => {
            if (mono) {
              handleChange(e, Math.min(duration, currentValue[0] + 1));
            } else {
              handleChange(
                e,
                [Math.min(duration, currentValue[0] + 1), currentValue[1]],
                0,
              );
            }
          }}
        >
          <ArrowRightIcon />
        </IconButton>
      </Stack>

      <Grid item xs>
        <Slider
          getAriaLabel={() =>
            mono ? "Mono annotation slider" : "Annotation slider"
          }
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
          disableSwap={!mono} // Allow swap only in dual mode
          slots={{
            valueLabel: ValueLabelComponent,
          }}
          sx={{ mb: 1 }}
        />
      </Grid>

      {/* Right arrow buttons - only show in dual mode */}
      {!mono && (
        <Stack direction={"row"}>
          <IconButton
            size="small"
            color="secondary"
            sx={{ p: 0 }}
            onClick={(e) =>
              handleChange(
                e,
                [currentValue[0], Math.max(0, currentValue[1] - 1)],
                1,
              )
            }
          >
            <ArrowLeftIcon />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            sx={{ p: 0 }}
            onClick={(e) =>
              handleChange(
                e,
                [currentValue[0], Math.min(duration, currentValue[1] + 1)],
                1,
              )
            }
          >
            <ArrowRightIcon />
          </IconButton>
        </Stack>
      )}
    </Grid>
  );
};
