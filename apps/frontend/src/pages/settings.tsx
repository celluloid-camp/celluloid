import { Avatar,Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import * as React from 'react';

import UploadAvatar from '~components/settings/UploadAvatar';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function SettingsPage() {
  const [value, setValue] = React.useState(0);

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
    <Paper
      sx={{ flexGrow: 1, display: 'flex' }}
    >
        <Tabs
        orientation="vertical"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: 'divider', minWidth: 150  }}
      >
        <Tab label="Profile" {...a11yProps(0)} sx={{m:0, textAlign: "left"}} />
        <Tab label="Security" {...a11yProps(1)} />
      </Tabs>

        <TabPanel value={value} index={0}>
          <Typography variant='h5'>Edit profile</Typography>
          <UploadAvatar
/>
          <TextField label="First Name" variant="outlined" fullWidth margin="normal" />
          <TextField label="Last Name" variant="outlined" fullWidth margin="normal" />
          <TextField label="Bio" variant="outlined" fullWidth margin="normal" multiline rows={4} />
          <Button variant="contained" component="label" sx={{ mt: 2 }}>
            Save
          </Button>
        </TabPanel>
        <TabPanel value={value} index={1}>
        <Typography variant='h5'>Change password</Typography>
          <TextField label="Email/Username" variant="outlined" fullWidth margin="normal" />
          <TextField label="Password" variant="outlined" fullWidth margin="normal" type="password" />
          <Button variant="contained" sx={{ mt: 2 }}>
            Update Security Settings
          </Button>
        </TabPanel>
</Paper>
      </Container>
    </Box>
  );
}
