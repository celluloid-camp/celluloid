"use client";

import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
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
    <Box hidden={value !== index} role="tabpanel" className="min-w-0 flex-1">
      {value === index && <Box className="p-4 sm:p-6">{children}</Box>}
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
      elevation={0}
      className="flex w-full items-stretch overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)]"
    >
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        orientation="vertical"
        textColor="primary"
        indicatorColor="primary"
        className="min-w-[200px] border-r border-black/5 bg-linear-to-b from-slate-50 to-white py-3 [&_.MuiTab-root+.MuiTab-root]:ml-0"
      >
        <Tab
          icon={<PeopleAltRoundedIcon fontSize="small" />}
          iconPosition="start"
          label="Users"
          className="min-h-12 justify-start gap-3 rounded-lg px-4 text-left font-medium normal-case"
        />
        <Tab
          icon={<FolderRoundedIcon fontSize="small" />}
          iconPosition="start"
          label="Projects"
          className="min-h-12 justify-start gap-3 rounded-lg px-4 text-left font-medium normal-case"
        />
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
