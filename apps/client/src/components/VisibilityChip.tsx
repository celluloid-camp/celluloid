import { Chip } from "@mui/material";

// const styles = ({ palette, spacing }: Theme) =>
//   createStyles({
//     visibilityChip: {
//       backgroundColor: palette.secondary.dark,
//       color: "white",
//       margin: spacing.unit / 2,
//     },
//   });

interface Props {
  label: string;
  show: boolean;
}

export default ({ label, show }: Props) =>
  show ? <Chip color="secondary" label={label} sx={{ m: 2 }} /> : <></>;
