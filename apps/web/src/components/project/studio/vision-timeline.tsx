"use client";
import "@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css";
import { Box, Checkbox, Typography } from "@mui/material";
import {
  type EditData,
  Timeline,
  type TimelineState,
} from "@xzdarcy/react-timeline-editor";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import randomColor from "randomcolor";
import { useEffect, useMemo, useRef } from "react";
import { ImageSprite } from "@/components/common/image-sprite";
import { getSpriteThumbnail } from "@/lib/sprite";
import type { DetectionSegment, DetectionTrack } from "./segments";

const EFFECTS: EditData["effects"] = {
  detection: { id: "detection", name: "detection" },
};

const ROW_HEIGHT = 48;
/** time area (32px) + edit area margin-top (10px) from the library stylesheet. */
const HEADER_OFFSET = 42;
const LEFT_WIDTH = 200;
export const TIMELINE_SCALE_PRESETS = [1, 2, 5, 10, 20] as const;
export const DEFAULT_TIMELINE_SCALE_INDEX = 2;
const SCALE_WIDTH = 140;
const SCALE_SPLIT = 5;
const START_LEFT = 20;

function trackColor(objectId: string) {
  return randomColor({ seed: objectId, luminosity: "bright" });
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

function ActionBlock({ segment }: { segment: DetectionSegment }) {
  const color = trackColor(segment.objectId);
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        px: 1,
        boxSizing: "border-box",
        overflow: "hidden",
        borderRadius: 1,
        border: `1px solid ${color}`,
        backgroundColor: `${color}22`,
        userSelect: "none",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "#fff",
          whiteSpace: "nowrap",
          fontSize: 11,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {segment.objectId}
      </Typography>
    </Box>
  );
}

function RowHeader({
  track,
  sprite,
  mergeMode,
  selected,
  onToggle,
}: {
  track: DetectionTrack;
  sprite: string | undefined;
  mergeMode: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const color = trackColor(track.objectId);
  return (
    <Box
      onClick={mergeMode ? onToggle : undefined}
      sx={{
        height: ROW_HEIGHT,
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1,
        boxSizing: "border-box",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        borderLeft: `3px solid ${color}`,
        cursor: mergeMode ? "pointer" : "default",
        backgroundColor: selected ? "rgba(82,151,255,0.25)" : "transparent",
      }}
    >
      {mergeMode && (
        <Checkbox
          checked={selected}
          onChange={() => onToggle()}
          onClick={(e) => e.stopPropagation()}
          size="small"
          sx={{ p: 0.5, color: "#fff" }}
        />
      )}
      <ImageSprite
        src={getSpriteThumbnail(sprite ?? "", track.thumbnail)}
        width={40}
        height={ROW_HEIGHT - 14}
        className="rounded-sm"
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {track.objectId}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>
          {track.count} detections
        </Typography>
      </Box>
    </Box>
  );
}

interface VisionTimelineProps {
  tracks: DetectionTrack[];
  sprite: string | undefined;
  duration: number;
  scale: number;
  mergeMode: boolean;
  selectedIds: string[];
  onToggleRow: (objectId: string) => void;
  onTimelineChange: (editorData: EditData["editorData"]) => void;
}

export function VisionTimeline({
  tracks,
  sprite,
  duration,
  scale,
  mergeMode,
  selectedIds,
  onToggleRow,
  onTimelineChange,
}: VisionTimelineProps) {
  const timelineState = useRef<TimelineState>(null);
  const leftInnerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollLeftRef = useRef(0);

  const dispatch = useMediaDispatch();
  const currentTime = useMediaSelector((state) => state.mediaCurrentTime ?? 0);

  const editorData: EditData["editorData"] = useMemo(
    () =>
      tracks.map((track) => ({
        id: track.objectId,
        rowHeight: ROW_HEIGHT,
        actions: track.segments.map((segment) => ({
          id: segment.actionId,
          start: segment.start,
          end: segment.end,
          effectId: "detection",
          movable: !mergeMode,
          flexible: !mergeMode,
        })),
      })),
    [tracks, mergeMode],
  );

  const segmentByActionId = useMemo(() => {
    const map = new Map<string, DetectionSegment>();
    for (const track of tracks) {
      for (const segment of track.segments) {
        map.set(segment.actionId, segment);
      }
    }
    return map;
  }, [tracks]);

  const minScaleCount = Math.max(20, Math.ceil(duration / scale) + 2);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Video is the source of truth: move the cursor and keep it in view.
  useEffect(() => {
    timelineState.current?.setTime(currentTime);
    const cursorPx = START_LEFT + (currentTime / scale) * SCALE_WIDTH;
    const viewWidth = containerRef.current?.clientWidth ?? 0;
    const scrollLeft = scrollLeftRef.current;
    if (
      viewWidth > 0 &&
      (cursorPx < scrollLeft + 40 || cursorPx > scrollLeft + viewWidth - 40)
    ) {
      timelineState.current?.setScrollLeft(
        Math.max(0, cursorPx - viewWidth / 2),
      );
    }
  }, [currentTime, scale]);

  const seek = (time: number) => {
    dispatch({ type: MediaActionTypes.MEDIA_SEEK_REQUEST, detail: time });
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#191b1d",
      }}
    >
      <Box
        sx={{
          width: LEFT_WIDTH,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box
          sx={{
            height: HEADER_OFFSET,
            display: "flex",
            alignItems: "center",
            px: 1,
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          Objects
        </Box>
        <Box sx={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <Box ref={leftInnerRef} sx={{ position: "absolute", inset: 0 }}>
            {tracks.map((track) => (
              <RowHeader
                key={track.objectId}
                track={track}
                sprite={sprite}
                mergeMode={mergeMode}
                selected={selectedSet.has(track.objectId)}
                onToggle={() => onToggleRow(track.objectId)}
              />
            ))}
          </Box>
        </Box>
      </Box>

      <Box ref={containerRef} sx={{ flex: 1, minWidth: 0 }}>
        <Timeline
          ref={timelineState}
          editorData={editorData}
          effects={EFFECTS}
          autoReRender
          disableDrag={mergeMode}
          dragLine={!mergeMode}
          gridSnap={!mergeMode}
          rowHeight={ROW_HEIGHT}
          scale={scale}
          scaleWidth={SCALE_WIDTH}
          scaleSplitCount={SCALE_SPLIT}
          startLeft={START_LEFT}
          minScaleCount={minScaleCount}
          style={{ width: "100%", height: "100%" }}
          getScaleRender={(scale) => (
            <span style={{ fontSize: 10 }}>{formatTime(scale)}</span>
          )}
          getActionRender={(action) => {
            const segment = segmentByActionId.get(action.id);
            if (!segment) return null;
            return <ActionBlock segment={segment} />;
          }}
          onChange={(editorData) => {
            onTimelineChange(editorData);
          }}
          onClickTimeArea={(time) => {
            seek(time);
            return true;
          }}
          onCursorDrag={(time) => seek(time)}
          onScroll={(params) => {
            scrollLeftRef.current = params.scrollLeft;
            if (leftInnerRef.current) {
              leftInnerRef.current.style.transform = `translateY(${-params.scrollTop}px)`;
            }
          }}
        />
      </Box>
    </Box>
  );
}
