"use client";

import ProjectsPanel from "@/components/admin/projects-panel";
import UsersPanel from "@/components/admin/users-panel";
import {
  Box,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper sx={{ width: "100%", p: 2 }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
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
