import { Box } from "@mui/material";
import { UserSettings } from "@/components/profile/settings/user-settings";

export default function SettingsPage() {
  return (
    <Box className="flex h-full w-full bg-brand-orange pt-8">
      <UserSettings />
    </Box>
  );
}
