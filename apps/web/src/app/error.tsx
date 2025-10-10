"use client";

import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  const t = useTranslations();

  useEffect(() => {
    // Optionally report errors to your monitoring service here
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography variant="h3" component="h1">
          {t("error.title")}
          </Typography>
          <Typography color="text.secondary">
            {t("error.description", {
              default: "An unexpected error occurred. Please try again.",
            })}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button variant="contained" color="primary" onClick={() => reset()}>
              {t("error.retry","Try again")}
            </Button>
            <Button
              component={Link}
              href="/"
              variant="outlined"
              color="secondary"
            >
              {t("error.goHome", { default: "Go to home" })}
            </Button>
          </Stack>
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
}
