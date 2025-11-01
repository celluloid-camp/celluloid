"use client";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ProjectThumbnail from "@/components/common/project-thumbnail";
import { trpc } from "@/lib/trpc/client";
import { StyledTitle } from "../common/typography";
import PlaylistThumbnail from "./playlist-thumbnail";

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    "aria-controls": `profile-tabpanel-${index}`,
  };
}

export const UserProjectGrid: React.FC = () => {
  const t = useTranslations();
  const [value, setValue] = useState(0);

  const {
    data: projectsData,
    error: projectsError,
    isFetching: projectsFetching,
  } = trpc.user.projects.useQuery({});
  const {
    data: playlistsData,
    error: playlistsError,
    isFetching: playlistsFetching,
  } = trpc.user.playlists.useQuery({});

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ padding: 5 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={value} onChange={handleChange} aria-label="Profile tabs">
          <Tab label={t("home.myProjects")} {...a11yProps(0)} />
          <Tab label={t("home.myPlaylists")} {...a11yProps(1)} />
        </Tabs>
      </Box>

      {/* My Projects Tab */}
      {value === 0 && (
        <Box
          role="tabpanel"
          id="profile-tabpanel-0"
          aria-labelledby="profile-tab-0"
        >
          {projectsFetching || !projectsData ? (
            <Box
              mx={2}
              my={10}
              display={"flex"}
              alignContent={"center"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Box>
                <CircularProgress />
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                ph: 2,
              }}
            >
              {projectsData.items?.length > 0 && (
                <Grid container={true} spacing={5} direction="row">
                  {projectsData.items.map((project) => (
                    <Grid xs={12} sm={6} lg={4} xl={3} item key={project.id}>
                      <ProjectThumbnail showPublic={true} project={project} />
                    </Grid>
                  ))}
                </Grid>
              )}

              {projectsData.items.length === 0 && (
                <Typography
                  variant="h3"
                  align="center"
                  gutterBottom={true}
                  sx={{
                    pt: 4,
                    pb: 1,
                  }}
                >
                  {t("profile.me.project.empty")}
                </Typography>
              )}
              {projectsError ? (
                <Typography
                  variant="h6"
                  align="center"
                  gutterBottom={true}
                  sx={{
                    pt: 4,
                    pb: 1,
                  }}
                >
                  {t("errors.UNKNOWN")}
                </Typography>
              ) : null}
            </Box>
          )}
        </Box>
      )}

      {/* My Playlists Tab */}
      {value === 1 && (
        <Box
          role="tabpanel"
          id="profile-tabpanel-1"
          aria-labelledby="profile-tab-1"
        >
          {playlistsFetching || !playlistsData ? (
            <Box
              mx={2}
              my={10}
              display={"flex"}
              alignContent={"center"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Box>
                <CircularProgress />
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                ph: 2,
              }}
            >
              {playlistsData.items?.length > 0 && (
                <Grid container={true} spacing={5} direction="row">
                  {playlistsData.items.map((playlist) => (
                    <Grid xs={12} sm={6} lg={4} xl={3} item key={playlist.id}>
                      <PlaylistThumbnail playlist={playlist} />
                    </Grid>
                  ))}
                </Grid>
              )}

              {playlistsData.items.length === 0 && (
                <Typography
                  variant="h3"
                  align="center"
                  gutterBottom={true}
                  sx={{
                    pt: 4,
                    pb: 1,
                  }}
                >
                  {t("profile.me.playlist.empty")}
                </Typography>
              )}
              {playlistsError ? (
                <Typography
                  variant="h6"
                  align="center"
                  gutterBottom={true}
                  sx={{
                    pt: 4,
                    pb: 1,
                  }}
                >
                  {t("errors.UNKNOWN")}
                </Typography>
              ) : null}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
