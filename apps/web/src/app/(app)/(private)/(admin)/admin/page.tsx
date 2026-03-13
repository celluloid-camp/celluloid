"use client";

import { Box, Paper, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import ProjectsPanel from "@/components/admin/projects-panel";
import UsersPanel from "@/components/admin/users-panel";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box hidden={value !== index} role="tabpanel" sx={{ flex: 1, minWidth: 0 }}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </Box>
  );
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper
      sx={{
        width: "100%",
        p: 2,
        display: "flex",
        alignItems: "stretch",
        gap: 2,
      }}
    >
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        orientation="vertical"
        textColor="primary"
        sx={{
          borderRight: 1,
          borderColor: "divider",
          minWidth: 160,
        }}
      >
        <Tab label="Users" />
        <Tab label="Projects" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <UsersPanel />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <ProjectsPanel />
      </TabPanel>
    </Paper>
  );
}
