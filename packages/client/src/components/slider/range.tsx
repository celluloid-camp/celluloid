import { deepOrange } from "@mui/material/colors";
import { Range, RangeProps } from "rc-slider";

import caretStart from "./images/caret-start.png";
import caretStop from "./images/caret-stop.png";

const sliderTrackStyle = [
  {
    border: 0,
    borderRadius: 0,
    backgroundColor: deepOrange["600"],
    height: 2,
  },
];

const sliderRailStyle = {
  height: 2,
  borderRadius: 0,
  backgroundColor: deepOrange["100"],
  border: 0,
};

const handleStyles = {
  border: 0,
  borderRadius: 0,
  backgroundColor: "rgba(0, 0, 0, 0)",
  backgroundSize: "cover",
  width: 12,
  height: 12,
};

export const StyledRange: React.FC<RangeProps> = (props) => {
  return (
    <Range
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
      {...props}
    />
  );
};
