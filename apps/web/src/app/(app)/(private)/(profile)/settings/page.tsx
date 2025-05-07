import { UserSettings } from "@/components/profile/settings/user-settings";
import { Box } from "@mui/material";

export default function SettingsPage() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "brand.orange",
        pt: 8,
        display: "flex",
      }}
    >
      <UserSettings />
    </Box>
  );
}
