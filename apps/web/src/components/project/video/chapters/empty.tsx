import InfoIcon from "@mui/icons-material/Info";
import { Grow, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

export function EmptyChapters() {
  const t = useTranslations();
  return (
    <Grow in={true}>
      <Stack
        spacing={1}
        sx={{
          alignContent: "center",
          alignItems: "center",
          m: 2,
        }}
      >
        <InfoIcon sx={{ fontSize: 30, color: "gray" }} />
        <Typography
          variant="body2"
          color="gray"
          sx={{
            textAlign: "center",
          }}
        >
          {t("project.chapters.empty")}
        </Typography>
      </Stack>
    </Grow>
  );
}
