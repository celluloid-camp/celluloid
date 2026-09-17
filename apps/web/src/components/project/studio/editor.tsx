"use client";
import type { DetectionResultsModel } from "@celluloid/toolkit-api/types";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MediaProvider } from "media-chrome/react/media-store";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useTRPC } from "@/lib/trpc/client";
import type { ProjectById } from "@/lib/trpc/types";
import { peerTubeWatchUrl } from "@/utils/peertube-url";
import { MergeDetectionDialog } from "./merge-detection-dialog";
import { RemoveDetectionDialog } from "./remove-detection-dialog";
import { RenameDetectionDialog } from "./rename-detection-dialog";
import type { DetectionSegment, DetectionTrack } from "./segments";
import {
  applyTimelineChange,
  buildTracks,
  mergeTracks,
  removeSegment,
  removeTrack,
  renameTrack,
} from "./segments";
import { StudioSkeleton } from "./skeleton";
import { StudioDetectionOverlay } from "./studio-detection-overlay";
import { useUnsavedChangesGuard } from "./use-unsaved-changes-guard";
import {
  DEFAULT_TIMELINE_SCALE_INDEX,
  TIMELINE_SCALE_PRESETS,
  VisionTimeline,
} from "./vision-timeline";

const StudioVideoPlayer = dynamic(
  () => import("./studio-video-player").then((mod) => mod.StudioVideoPlayer),
  { ssr: false },
);

const STUDIO_BG = "#191b1d";
/** Matches app layout `pt: 6` below the fixed header. */
const HEADER_OFFSET = 48;

const toolbarIconButtonSx = {
  color: "#fff",
  "&.Mui-disabled": {
    color: "rgba(255,255,255,0.35)",
  },
} as const;

const toolbarOutlinedButtonSx = {
  color: "#fff",
  borderColor: "rgba(255,255,255,0.3)",
  "&.Mui-disabled": {
    color: "rgba(255,255,255,0.35)",
    borderColor: "rgba(255,255,255,0.15)",
  },
} as const;

export function VisionStudio({ projectId }: { projectId: string }) {
  const api = useTRPC();
  const { data: analysis, isPending: isAnalysisPending } = useQuery(
    api.vision.byProjectId.queryOptions({ projectId }),
  );
  const { data: project, isPending: isProjectPending } = useQuery(
    api.project.byId.queryOptions({ id: projectId }),
  );

  if (isAnalysisPending || isProjectPending) {
    return <StudioSkeleton />;
  }

  if (
    !analysis ||
    analysis.status !== "completed" ||
    !analysis.data ||
    !project
  ) {
    return null;
  }

  return (
    <VisionStudioInner
      projectId={projectId}
      project={project}
      initialAnalysis={analysis.data}
      sprite={analysis.spriteURL ?? undefined}
    />
  );
}

function VisionStudioInner({
  projectId,
  project,
  initialAnalysis,
  sprite,
}: {
  projectId: string;
  project: ProjectById;
  initialAnalysis: DetectionResultsModel;
  sprite: string | undefined;
}) {
  const api = useTRPC();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [analysis, setAnalysis] =
    useState<DetectionResultsModel>(initialAnalysis);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify(initialAnalysis),
  );
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [scaleIndex, setScaleIndex] = useState(DEFAULT_TIMELINE_SCALE_INDEX);
  const [editingTrack, setEditingTrack] = useState<DetectionTrack | null>(null);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const timelineScale = TIMELINE_SCALE_PRESETS[scaleIndex];

  const editAnalysis = useMutation(
    api.vision.updateAnalysis.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries(
          api.vision.byProjectId.queryFilter({ projectId }),
        );
      },
    }),
  );

  const isDirty = useMemo(
    () => JSON.stringify(analysis) !== savedSnapshot,
    [analysis, savedSnapshot],
  );

  useUnsavedChangesGuard(isDirty);

  const tracks = useMemo(() => buildTracks(analysis), [analysis]);
  const duration = useMemo(() => {
    const fromMeta = analysis.metadata.processing.duration_seconds;
    if (fromMeta) return fromMeta;
    return analysis.frames.reduce((max, f) => Math.max(max, f.timestamp), 0);
  }, [analysis]);

  const toggleRow = (objectId: string) => {
    setSelectedIds((prev) =>
      prev.includes(objectId)
        ? prev.filter((id) => id !== objectId)
        : [...prev, objectId],
    );
  };

  const cancelMerge = () => {
    setMergeMode(false);
    setSelectedIds([]);
    setSelectedActionId(null);
  };

  const validateMerge = () => {
    if (selectedIds.length < 2) return;
    setMergeDialogOpen(true);
  };

  const handleConfirmMerge = (targetId: string) => {
    const merged = mergeTracks(analysis, selectedIds, targetId);
    setAnalysis(merged);
    cancelMerge();
  };

  const handleSave = () => {
    editAnalysis.mutate(
      { projectId, analysis },
      {
        onSuccess: () => {
          setSavedSnapshot(JSON.stringify(analysis));
          enqueueSnackbar(t("project.studio.saved"), { variant: "success" });
        },
      },
    );
  };

  const tracksToMerge = useMemo(
    () => tracks.filter((track) => selectedIds.includes(track.objectId)),
    [tracks, selectedIds],
  );

  const handleTimelineChange = (
    editorData: Parameters<typeof applyTimelineChange>[2],
  ) => {
    const updated = applyTimelineChange(analysis, tracks, editorData);
    if (updated === analysis) return;
    setAnalysis(updated);
  };

  const handleRenameTrack = (newId: string) => {
    if (!editingTrack) return;
    const updated = renameTrack(analysis, editingTrack.objectId, newId);
    if (updated === analysis) return;
    setAnalysis(updated);
  };

  const handleRemoveTrack = (track: DetectionTrack) => {
    const updated = removeTrack(analysis, track.objectId);
    if (updated === analysis) return;
    setAnalysis(updated);
  };

  const selectedSegment = useMemo((): DetectionSegment | null => {
    if (!selectedActionId) return null;
    for (const track of tracks) {
      for (const segment of track.segments) {
        if (segment.actionId === selectedActionId) {
          return segment;
        }
      }
    }
    return null;
  }, [tracks, selectedActionId]);

  const handleConfirmRemoveSegment = () => {
    if (!selectedSegment) return;
    const updated = removeSegment(analysis, selectedSegment);
    if (updated !== analysis) {
      setAnalysis(updated);
    }
    setSelectedActionId(null);
    setRemoveDialogOpen(false);
  };

  const existingTrackIds = useMemo(
    () => tracks.map((track) => track.objectId),
    [tracks],
  );

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (!selectedActionId) return;
    const stillExists = tracks.some((track) =>
      track.segments.some((segment) => segment.actionId === selectedActionId),
    );
    if (!stillExists) {
      setSelectedActionId(null);
    }
  }, [tracks, selectedActionId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (mergeMode || !selectedActionId || removeDialogOpen) return;
      if (event.key !== "Delete" && event.key !== "Backspace") return;

      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      setRemoveDialogOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mergeMode, selectedActionId, removeDialogOpen]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: HEADER_OFFSET,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: STUDIO_BG,
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box className="flex min-w-0 flex-1 flex-row gap-4 items-center align-middle">
          <Typography
            variant="h5"
            sx={{
              fontFamily: "abril_fatfaceregular",
              color: "#fff",
              lineHeight: 1.2,
            }}
          >
            {t("project.studio.title")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.6)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {project.title}
          </Typography>
        </Box>
        <Link href={`/project/${projectId}`}>
          <IconButton
            size="small"
            sx={{ color: "#fff" }}
            aria-label={t("project.studio.close")}
          >
            <CloseIcon />
          </IconButton>
        </Link>
      </Box>

      <MediaProvider>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "relative",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              backgroundColor: "black",
            }}
          >
            <StudioVideoPlayer
              src={peerTubeWatchUrl(project.host, project.videoId)}
            />
            <StudioDetectionOverlay
              analysis={analysis}
              tracks={tracks}
              videoWidth={analysis.metadata.video.width}
              videoHeight={analysis.metadata.video.height}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.75,
                flexShrink: 0,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Tooltip title={t("project.studio.zoomIn")}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={scaleIndex === 0}
                      onClick={() => setScaleIndex((index) => index - 1)}
                      sx={toolbarIconButtonSx}
                      aria-label={t("project.studio.zoomIn")}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t("project.studio.zoomOut")}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={
                        scaleIndex === TIMELINE_SCALE_PRESETS.length - 1
                      }
                      onClick={() => setScaleIndex((index) => index + 1)}
                      sx={toolbarIconButtonSx}
                      aria-label={t("project.studio.zoomOut")}
                    >
                      <ZoomOutIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t("project.studio.deleteSelected")}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={mergeMode || !selectedActionId}
                      onClick={() => setRemoveDialogOpen(true)}
                      sx={toolbarIconButtonSx}
                      aria-label={t("project.studio.deleteSelected")}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              {mergeMode ? (
                <>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={cancelMerge}
                    startIcon={<CloseIcon fontSize="small" />}
                    sx={toolbarOutlinedButtonSx}
                  >
                    {t("project.studio.cancel")}
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    disabled={selectedIds.length < 2}
                    onClick={validateMerge}
                    startIcon={<CallMergeIcon fontSize="small" />}
                    sx={toolbarOutlinedButtonSx}
                  >
                    {t("project.studio.merge")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setSelectedActionId(null);
                    setMergeMode(true);
                  }}
                  startIcon={<CallMergeIcon fontSize="small" />}
                  sx={toolbarOutlinedButtonSx}
                >
                  {t("project.studio.merge")}
                </Button>
              )}

              <Button
                variant="outlined"
                color="inherit"
                size="small"
                disabled={!isDirty || editAnalysis.isPending}
                onClick={handleSave}
                startIcon={<SaveIcon fontSize="small" />}
                sx={{ ...toolbarOutlinedButtonSx, ml: "auto" }}
              >
                {t("project.studio.save")}
              </Button>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              <VisionTimeline
                tracks={tracks}
                sprite={sprite}
                duration={duration}
                scale={timelineScale}
                mergeMode={mergeMode}
                selectedIds={selectedIds}
                selectedActionId={selectedActionId}
                onToggleRow={toggleRow}
                onSelectAction={setSelectedActionId}
                onEditTrack={setEditingTrack}
                onRemoveTrack={handleRemoveTrack}
                onTimelineChange={handleTimelineChange}
              />
            </Box>
          </Box>
        </Box>
      </MediaProvider>

      <RenameDetectionDialog
        open={editingTrack !== null}
        track={editingTrack}
        sprite={sprite}
        existingIds={existingTrackIds}
        onClose={() => setEditingTrack(null)}
        onSave={handleRenameTrack}
      />

      <MergeDetectionDialog
        open={mergeDialogOpen}
        tracks={tracksToMerge}
        sprite={sprite}
        onClose={() => setMergeDialogOpen(false)}
        onConfirm={handleConfirmMerge}
      />

      <RemoveDetectionDialog
        open={removeDialogOpen}
        segment={selectedSegment}
        sprite={sprite}
        onClose={() => setRemoveDialogOpen(false)}
        onConfirm={handleConfirmRemoveSegment}
      />
    </Box>
  );
}
