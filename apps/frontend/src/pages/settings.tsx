import {
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";

import EditProfileTabForm from "~components/settings/EditProfileTab";
import SecurityTabForm from "~components/settings/SecurityTab";

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function SettingsPage() {
  const [value, setValue] = React.useState(0);
  const { t } = useTranslation();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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
      <Container>
        <Paper sx={{ width: "100%", minHeight: "80vh", mb: 10 }}>
          <Typography variant="h3" sx={{ px: 3, pt: 3, pb: 2 }}>
            <Trans i18nKey={"settings.title"}>Paramètres</Trans>
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="Vertical tabs example"
              sx={{ px: 3 }}
            >
              <Tab
                label={t("settings.profile.tab", "Profil")}
                sx={{ fontSize: 15 }}
                {...a11yProps(0)}
              />
              <Tab
                label={t("settings.security.tab", "Sécurité")}
                sx={{ fontSize: 15 }}
                {...a11yProps(1)}
              />
            </Tabs>
          </Box>

          <EditProfileTabForm value={value} index={0} />

          <SecurityTabForm value={value} index={1} />
        </Paper>
      </Container>
    </Box>
  );
}
