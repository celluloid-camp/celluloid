"use client";
import type { DetectionResultsModel } from "@celluloid/vision-api/types";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { MediaProvider } from "media-chrome/react/media-store";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useTRPC } from "@/lib/trpc/client";
import type { ProjectById } from "@/lib/trpc/types";
import { DetectionOverlay } from "./detection-overlay";
import { applyTimelineChange, buildTracks, mergeTracks } from "./segments";
import {
  DEFAULT_TIMELINE_SCALE_INDEX,
  TIMELINE_SCALE_PRESETS,
  VisionTimeline,
} from "./vision-timeline";

const STUDIO_BG = "#191b1d";
/** Matches app layout `pt: 6` below the fixed header. */
const HEADER_OFFSET = 48;

const VideoPlayer = dynamic(
  () => import("@/components/video-player").then((mod) => mod.default),
  { ssr: false },
);

export function VisionStudio({ projectId }: { projectId: string }) {
  const api = useTRPC();
  const { data: analysis } = useSuspenseQuery(
    api.vision.byProjectId.queryOptions({ projectId }),
  );
  const { data: project } = useSuspenseQuery(
    api.project.byId.queryOptions({ id: projectId }),
  );

  if (!analysis || analysis.status !== "completed" || !analysis.data) {
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
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [analysis, setAnalysis] =
    useState<DetectionResultsModel>(initialAnalysis);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scaleIndex, setScaleIndex] = useState(DEFAULT_TIMELINE_SCALE_INDEX);

  const timelineScale = TIMELINE_SCALE_PRESETS[scaleIndex];

  const editAnalysis = useMutation(
    api.vision.updateAnalysis.mutationOptions({
      onSuccess: () => {
        enqueueSnackbar("Analysis updated", { variant: "success" });
      },
      onSettled: () => {
        queryClient.invalidateQueries(
          api.vision.byProjectId.queryFilter({ projectId }),
        );
      },
    }),
  );

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
  };

  const validateMerge = () => {
    if (selectedIds.length < 2) return;
    const merged = mergeTracks(analysis, selectedIds);
    setAnalysis(merged);
    editAnalysis.mutate({ projectId, analysis: merged });
    cancelMerge();
  };

  const handleTimelineChange = (
    editorData: Parameters<typeof applyTimelineChange>[2],
  ) => {
    const updated = applyTimelineChange(analysis, tracks, editorData);
    if (updated === analysis) return;
    setAnalysis(updated);
    editAnalysis.mutate({ projectId, analysis: updated });
  };

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
        <Link href={`/project/${projectId}`}>
          <IconButton size="small" sx={{ color: "#fff" }}>
            <KeyboardArrowLeftIcon />
          </IconButton>
        </Link>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "abril_fatfaceregular",
              color: "#fff",
              lineHeight: 1.2,
            }}
          >
            Studio
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
            <VideoPlayer project={project} />
            <DetectionOverlay
              analysis={analysis}
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
                justifyContent: "space-between",
                gap: 1,
                px: 2,
                py: 0.75,
                flexShrink: 0,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Tooltip title="Zoom in">
                  <span>
                    <IconButton
                      size="small"
                      disabled={scaleIndex === 0}
                      onClick={() => setScaleIndex((index) => index - 1)}
                      sx={{ color: "#fff" }}
                      aria-label="Zoom in timeline"
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Zoom out">
                  <span>
                    <IconButton
                      size="small"
                      disabled={
                        scaleIndex === TIMELINE_SCALE_PRESETS.length - 1
                      }
                      onClick={() => setScaleIndex((index) => index + 1)}
                      sx={{ color: "#fff" }}
                      aria-label="Zoom out timeline"
                    >
                      <ZoomOutIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {mergeMode && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={selectedIds.length < 2}
                    onClick={validateMerge}
                  >
                    Merge {selectedIds.length} objects
                  </Button>
                )}
                <Button
                  variant={mergeMode ? "contained" : "outlined"}
                  color={mergeMode ? "primary" : "inherit"}
                  size="small"
                  onClick={() =>
                    mergeMode ? cancelMerge() : setMergeMode(true)
                  }
                  sx={
                    mergeMode
                      ? undefined
                      : { color: "#fff", borderColor: "rgba(255,255,255,0.3)" }
                  }
                >
                  {mergeMode ? "Cancel" : "Merge"}
                </Button>
              </Box>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              <VisionTimeline
                tracks={tracks}
                sprite={sprite}
                duration={duration}
                scale={timelineScale}
                mergeMode={mergeMode}
                selectedIds={selectedIds}
                onToggleRow={toggleRow}
                onTimelineChange={handleTimelineChange}
              />
            </Box>
          </Box>
        </Box>
      </MediaProvider>
    </Box>
  );
}
