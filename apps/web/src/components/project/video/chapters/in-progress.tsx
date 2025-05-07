import { Box, CircularProgress, Grow, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { ChapterListSkeleton } from "./skeleton";

export function ChaptersJobInProgress() {
  const t = useTranslations();
  return (
    <Grow in={true}>
      <Box>
        <ChapterListSkeleton />
        <Box sx={{ display: "relative", bottom: 0, left: 0, right: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress size={12} color="primary" />
            <Typography variant="body2" color="gray" textAlign={"center"}>
              {t("project.chapters.in-progress")}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Grow>
  );
}
