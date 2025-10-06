"use client";
import { Box, Container, Paper, Typography } from "@mui/material";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useTranslations } from "next-intl";
import type * as React from "react";
import { useState } from "react";
import EditProfileTabForm from "./edit-profile-tab";
import SecurityTabForm from "./security-tab";

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export function UserSettings() {
  const [value, setValue] = useState(0);
  const t = useTranslations();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container>
      <Paper sx={{ width: "100%", minHeight: "80vh", mb: 10 }}>
        <Typography variant="h3" sx={{ px: 3, pt: 3, pb: 2 }}>
          {t("settings.title")}
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{ px: 3 }}
          >
            <Tab
              label={t("settings.profile-tab")}
              sx={{ fontSize: 15 }}
              {...a11yProps(0)}
            />
            <Tab
              label={t("settings.security-tab")}
              sx={{ fontSize: 15 }}
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>
        <EditProfileTabForm value={value} index={0} />
        <SecurityTabForm value={value} index={1} />
      </Paper>
    </Container>
  );
}
