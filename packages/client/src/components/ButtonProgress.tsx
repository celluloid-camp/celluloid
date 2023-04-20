import { Button, CircularProgress } from "@mui/material";
import { ButtonClassKey, ButtonProps } from "@mui/material/Button";
import classnames from "classnames";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     wrapper: {
//       margin: spacing.unit,
//       position: "relative",
//     },
//     progress: {
//       position: "absolute",
//       top: "50%",
//       left: "50%",
//     },
//     sizeSmall: {
//       marginTop: -10,
//       marginLeft: -10,
//     },
//     sizeDefault: {
//       marginTop: -12,
//       marginLeft: -12,
//     },
//   });

type WithoutClassKey<T> = {
  [P in keyof T]: T[P] extends ButtonClassKey ? never : T[P];
}[keyof T];

interface Props extends Pick<ButtonProps, WithoutClassKey<ButtonProps>> {
  loading: boolean;
}
export default ({
  loading,
  classes,
  disabled,
  children,
  size,
  color,
  ...otherProps
}: Props) => {
  const { sizePx, sizeClass } = (() => {
    switch (size) {
      case "small":
        return { sizePx: 20, sizeClass: classes.sizeSmall };
      default:
        return { sizePx: 24, sizeClass: classes.sizeDefault };
    }
  })();

  return (
    <div className={classes.wrapper}>
      <Button
        {...otherProps}
        size={size}
        disabled={loading || disabled}
        color={color}
      >
        {children}
      </Button>
      {loading && (
        <CircularProgress
          size={sizePx}
          color={color}
          className={classnames(classes.progress, sizeClass)}
        />
      )}
    </div>
  );
};
