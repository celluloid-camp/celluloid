import { Box, Button, Paper, Typography } from "@mui/material";
import { Trans } from "react-i18next";

import { SharedLayout } from "../scenes/Menu";
import { getButtonLink } from "./ButtonLink";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     body: {
//       padding: spacing.unit * 4,
//     },
//     buttonWrapper: {
//       padding: spacing.unit * 2,
//     },
//   });

export default () => (
  <SharedLayout>
    <Paper>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom={true}>
          <Trans i18nKey={"notFound.title"} />
        </Typography>
        <Typography>
          <Trans i18nKey={"notFound.description"} />
        </Typography>
      </Box>
      <Box sx={{ padding: 2 }}>
        <Button component={getButtonLink(".")}>
          <Trans i18nKey={"notFound.action"} />
        </Button>
      </Box>
    </Paper>
  </SharedLayout>
);
