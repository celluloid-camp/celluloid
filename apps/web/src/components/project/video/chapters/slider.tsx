import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { Grid, IconButton, Stack, styled } from "@mui/material";
import { grey } from "@mui/material/colors";
import Slider, { type SliderValueLabelProps } from "@mui/material/Slider";
import Tooltip, {
  tooltipClasses,
  type TooltipProps,
} from "@mui/material/Tooltip";
import * as React from "react";

import { formatDuration } from "@/utils/duration";

type DurationSliderProps = {
  duration: number;
  startTime: number;
  stopTime: number;
  onChange: (start: number, stop: number) => void;
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

export const ChapterTimestampSlider: React.FC<DurationSliderProps> = ({
  duration,
  startTime = 60,
  stopTime = 1000,
  onChange,
}) => {
  const [value, setValue] = React.useState<number[]>([startTime, stopTime]);

  const handleChange = (
    _event: React.SyntheticEvent | Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], 100 - minDistance);
        setValue([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setValue([clamped - minDistance, clamped]);
      }
    } else {
      setValue(newValue as number[]);
    }
    onChange(newValue[0], newValue[1]);
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Stack direction={"row"}>
        <IconButton
          size="small"
          color="secondary"
          sx={{ p: 0 }}
          onClick={(e) => handleChange(e, [value[0] - 1, value[1]], 0)}
        >
          <ArrowLeftIcon />
        </IconButton>
        <IconButton
          size="small"
          color="secondary"
          sx={{ p: 0 }}
          onClick={(e) => handleChange(e, [value[0] + 1, value[1]], 0)}
        >
          <ArrowRightIcon />
        </IconButton>
      </Stack>

      <Grid item xs>
        <Slider
          getAriaLabel={() => "Annotation slider"}
          value={value}
          onChange={handleChange}
          valueLabelFormat={formatDuration}
          step={1}
          size="small"
          valueLabelDisplay="on"
          min={0}
          max={duration}
          color="secondary"
          disableSwap
          slots={{
            valueLabel: ValueLabelComponent,
          }}
          sx={{ mb: 1 }}
        />
      </Grid>
      <Stack direction={"row"}>
        <IconButton
          size="small"
          color="secondary"
          sx={{ p: 0 }}
          onClick={(e) => handleChange(e, [value[0], value[1] - 1], 1)}
        >
          <ArrowLeftIcon />
        </IconButton>
        <IconButton
          size="small"
          color="secondary"
          sx={{ p: 0 }}
          onClick={(e) => handleChange(e, [value[0], value[1] + 1], 1)}
        >
          <ArrowRightIcon />
        </IconButton>
      </Stack>
    </Grid>
  );
};
