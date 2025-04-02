import { Grow, Stack, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useTranslations } from "next-intl";

export function EmptyChapters() {
  const t = useTranslations();
  return (
    <Grow in={true}>
      <Stack
        spacing={1}
        alignContent={"center"}
        alignItems={"center"}
        sx={{
          m: 2,
          p: 5,
        }}
      >
        <InfoIcon sx={{ fontSize: 30, color: "gray" }} />
        <Typography variant="body2" color="gray" textAlign={"center"}>
          {t("project.chapters.empty")}
        </Typography>
      </Stack>
    </Grow>
  );
}
