"use client";

import { Box, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";
import type {
  PeerTubeVideoDataResult,
  PeerTubeVideoWithThumbnail,
} from "@/services/peertube";
import { AddVideoToPlaylistDialog } from "./add-video-to-playlist-dialog";
import { CreateProjectForm } from "./create-project-form";
import { PeerTubeUrlInput } from "./peertube-url-input";
import { VideoSnapshots } from "./video-snapshots";

function LinkGuide() {
  const t = useTranslations("project.create");
  const steps = [t("linkGuideStep1"), t("linkGuideStep2"), t("linkGuideStep3")];

  return (
    <Box className="mt-6 rounded-2xl border border-black/6 bg-[#FBFBFD] p-6">
      <Typography variant="subtitle1" className="font-semibold">
        {t("linkGuideTitle")}
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mt-1 mb-4">
        {t("linkGuideDescription")}
      </Typography>
      <Box component="ol" className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <Box component="li" className="flex items-start gap-3" key={step}>
            <Box className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-primary text-xs font-semibold">
              {index + 1}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {step}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function CreateLinkPanel() {
  const t = useTranslations("project.create");
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url")?.trim() ?? undefined;

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
    <Box data-testid="create-link-panel">
      <Box className="mb-2">
        <Typography variant="h6" className="font-semibold">
          {t("linkTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("linkDescription")}
        </Typography>
      </Box>

      <PeerTubeUrlInput
        onLoaded={handleVideoInfoLoaded}
        onReset={handleReset}
        url={initialUrl}
        autoLoad={Boolean(initialUrl)}
      />

      {videoInfo ? (
        <VideoSnapshots
          videos={videoInfo.videos}
          onDelete={handleDelete}
          onAddMore={handleClickOpen}
          isPlaylist={videoInfo.isPlaylist}
        />
      ) : (
        <LinkGuide />
      )}

      {videoInfo ? <CreateProjectForm data={videoInfo} /> : null}

      <AddVideoToPlaylistDialog
        open={openDialog}
        onClose={handleClose}
        onAddVideo={handleAddVideo}
      />
    </Box>
  );
}

// Keep backward-compatible export for any existing imports.
export const CreateProjectPage = CreateLinkPanel;
