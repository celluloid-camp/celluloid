"use client";

import { Box, Paper } from "@mui/material";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";
import { StyledTitle } from "@/components/common/typography";
import type {
  PeerTubeVideoDataResult,
  PeerTubeVideoWithThumbnail,
} from "@/services/peertube";
import { AddVideoToPlaylistDialog } from "./add-video-to-playlist-dialog";
import { CreateProjectForm } from "./create-project-form";
import { PeerTubeUrlInput } from "./peertube-url-input";
import { VideoSnapshots } from "./video-snapshots";

export const CreateProjectPage: React.FC = () => {
  const t = useTranslations();
  const [videoInfo, setVideoInfo] = useState<PeerTubeVideoDataResult | null>(
    null,
  );

  const handleVideoInfoLoaded = (data: PeerTubeVideoDataResult | null) => {
    setVideoInfo(data);
  };

  const handleReset = useCallback(() => {
    setVideoInfo(null);
  }, []);

  const handleDelete = (index: number) => {
    if (videoInfo) {
      const newVideos = videoInfo.videos.filter((_, i) => i !== index);
      if (newVideos.length === 0) {
        setVideoInfo(null);
      } else {
        setVideoInfo({
          ...videoInfo,
          isPlaylist: newVideos.length > 1,
          videos: newVideos,
        });
      }
    }
  };

  const [openDialog, setOpenDialog] = React.useState(false);

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleAddVideo = (video: PeerTubeVideoWithThumbnail) => {
    if (videoInfo) {
      const newVideos = [...videoInfo.videos, video];
      setVideoInfo({
        ...videoInfo,
        isPlaylist: true,
        videos: newVideos,
      });
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  return (
    <Box
      sx={{
        paddingX: { md: 20, lg: 40 },
        paddingTop: 1,
        paddingBottom: 5,
        backgroundColor: "brand.orange",
        minHeight: "100vh",
      }}
    >
      <Paper sx={{ padding: 5 }}>
        <StyledTitle gutterBottom={true} variant="h4" sx={{ marginTop: 1 }}>
          {t("project.createTitle")}
        </StyledTitle>

        <PeerTubeUrlInput
          onLoaded={handleVideoInfoLoaded}
          onReset={handleReset}
        />

        {videoInfo ? (
          <VideoSnapshots
            videos={videoInfo.videos}
            onDelete={handleDelete}
            onAddMore={handleClickOpen}
            isPlaylist={videoInfo.isPlaylist}
          />
        ) : null}

        {videoInfo ? <CreateProjectForm data={videoInfo} /> : null}
      </Paper>
      <AddVideoToPlaylistDialog
        open={openDialog}
        onClose={handleClose}
        onAddVideo={handleAddVideo}
      />
    </Box>
  );
};
