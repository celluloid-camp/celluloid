import { Box, Typography } from "@mui/material";
import { Trans } from "react-i18next";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     shareInfo: {
//       marginBottom: spacing.unit * 2,
//     },
//     password: {
//       fontFamily: "monospace",
//     },
//   });

interface Props {
  name: string;
  password: string;
}

export const ShareCredentials: React.FC<Props> = ({
  name,
  password,
}: Props) => (
  <>
    <Box sx={{ marginBottom: 2 }}>
      <Typography gutterBottom={true}>
        <Trans i18nKey={"signin.projectCode"} />
      </Typography>
      <Typography
        variant="body2"
        gutterBottom={true}
        sx={{ fontFamily: "monospace" }}
      >
        {`${name}-${password}`}
      </Typography>
    </Box>
  </>
);
