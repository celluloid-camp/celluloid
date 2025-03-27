import {
  Badge,
  Box,
  CircularProgress,
  Grow,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useTranslations } from "next-intl";
import { ChapterListSkeleton } from "./skeleton";

export function ChaptersJobInProgress() {
  const t = useTranslations();
  return (
    <Grow in={true}>
      <Box>
        <ChapterListSkeleton />
        <Box sx={{ display: "relative", bottom: 0, left: 0, right: 0 }}>
          <Typography variant="body2" color="gray" textAlign={"center"}>
            {t("project.chapters.in-progress")}
          </Typography>
        </Box>
      </Box>
    </Grow>
  );
}
