import { styled } from "@mui/material";
import Slider, {
  SliderThumb,
  SliderValueLabelProps,
} from "@mui/material/Slider";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import * as React from "react";

import { formatDuration } from "~utils/DurationUtils";

type DurationSliderProps = {
  duration: number;
  startTime: number;
  stopTime: number;
  onChange: (start: number, stop: number) => void;
};

const minDistance = 60;

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "transparent",
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
  onChange,
}) => {
  const [value, setValue] = React.useState<number[]>([startTime, stopTime]);

  const handleChange = (
    event: Event,
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
    <>
      <Slider
        getAriaLabel={() => "Annotation slider"}
        value={value}
        onChange={handleChange}
        valueLabelFormat={formatDuration}
        step={60}
        size="small"
        valueLabelDisplay="on"
        min={0}
        max={duration}
        color="secondary"
        disableSwap
        slots={{
          valueLabel: ValueLabelComponent,
        }}
      />
    </>
  );
};
