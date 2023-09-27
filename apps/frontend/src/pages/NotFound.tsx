import { Box, Button, Paper, Typography } from "@mui/material";
import { Trans } from "react-i18next";

export const NotFound: React.FC = () => (
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
      <Button href="/">
        <Trans i18nKey={"notFound.action"} />
      </Button>
    </Box>
  </Paper>
);
