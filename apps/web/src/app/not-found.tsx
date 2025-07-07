import { Box, Button, Container, Typography } from "@mui/material";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: "2rem",
              fontWeight: 600,
              color: "text.primary",
              mb: 1,
            }}
          >
            {t("notFound.title")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 4,
            }}
          >
            {t("notFound.description")}
          </Typography>
          <Button
            component={Link}
            href="/"
            variant="contained"
            color="primary"
            size="large"
            sx={{
              textTransform: "none",
              px: 4,
              py: 1,
            }}
          >
            {t("notFound.action")}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
