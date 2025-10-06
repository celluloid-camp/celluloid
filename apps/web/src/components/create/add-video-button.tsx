import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { ButtonBase, Grid, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { THUMBNAIL_WIDTH } from "./constants";

export function AddVideoButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations();
  return (
    <Grid item xs={6}>
      <Stack
        sx={{
          borderColor: "neutral.300",
          borderRadius: 1,
          borderWidth: 1,
          borderStyle: "solid",
        }}
        width={THUMBNAIL_WIDTH}
        height={180}
      >
        <ButtonBase
          sx={{ height: "100%" }}
          onClick={onClick}
          data-testid="add-video"
        >
          <Stack
            flex={1}
            marginX={1}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <PlaylistAddIcon sx={{ color: "neutral.500" }} fontSize="large" />
            <Typography variant="body2" color="neutral.500">
              {t("project.add-video-to-playlist-button")}
            </Typography>
          </Stack>
        </ButtonBase>
      </Stack>
    </Grid>
  );
}
