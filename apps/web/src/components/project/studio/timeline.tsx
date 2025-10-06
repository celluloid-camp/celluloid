import type { DetectionResultsModel } from "@celluloid/vision";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Input,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useMemo, useRef, useState } from "react";
import { getSpriteThumbnail } from "@/lib/sprite";
import { ObjectGalleryDialog } from "./ObjectGalleryDialog";

interface TimelineProps {
  analysis: DetectionResultsModel;
  videoDurationSec: number;
  sprite?: string;
  onChange?: (updated: DetectionResultsModel) => void;
}

function formatTimestamp(seconds: number) {
  const min = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

interface TimelinePillProps {
  objs: any[];
  videoDurationSec: number;
  sprite: string | undefined;
  id: string;
}

// Refactor TimelinePill to a named function
function TimelinePill({
  objs,
  videoDurationSec,
  sprite,
  id,
}: TimelinePillProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseEnter = (
    i: number,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    setHoveredIdx(i);
    setAnchorEl(event.currentTarget);
  };
  const handleMouseLeave = () => {
    setHoveredIdx(null);
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        flex: 3,
        mx: 2,
        height: 16,
        bgcolor: "grey.100",
        borderRadius: 8,
        position: "relative",
        width: "100%",
      }}
    >
      {objs.map((obj: any, i: number) => {
        const position = (obj.timestamp / videoDurationSec) * 100;
        return (
          <Box
            key={i}
            ref={(el) => {
              markerRefs.current[i] = el as HTMLDivElement | null;
            }}
            onMouseEnter={(e) => handleMouseEnter(i, e)}
            onMouseLeave={handleMouseLeave}
            sx={{
              position: "absolute",
              left: `${Math.max(0, Math.min(100, position))}%`,
              top: 2,
              width: 8,
              height: 12,
              bgcolor: "primary.main",
              borderRadius: 8,
              opacity: 1,
              transform: "translateX(-50%)",
              zIndex: 10,
              transition: "transform 0.2s",
              cursor: "pointer",
              "&:hover": {
                transform: "translateX(-50%) scale(1.1)",
              },
            }}
          />
        );
      })}
      <Tooltip
        open={hoveredIdx !== null}
        title={
          hoveredIdx !== null ? (
            <Box
              sx={{
                width: 120,
                height: 120,
                maxWidth: 120,
                flexDirection: "column",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={
                  hoveredIdx !== null
                    ? getSpriteThumbnail(
                        sprite ?? "",
                        objs[hoveredIdx].thumbnail,
                      )
                    : undefined
                }
                alt={id}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption">
                {hoveredIdx !== null
                  ? formatTimestamp(objs[hoveredIdx].timestamp)
                  : ""}
              </Typography>
            </Box>
          ) : null
        }
        placement="top"
        disableFocusListener
        disableTouchListener
        arrow
        PopperProps={{
          anchorEl: anchorEl,
        }}
      >
        <span />
      </Tooltip>
    </Box>
  );
}

const areEqual = (
  prevProps: TimelinePillProps,
  nextProps: TimelinePillProps,
) => {
  return (
    prevProps.videoDurationSec === nextProps.videoDurationSec &&
    prevProps.id === nextProps.id &&
    prevProps.objs === nextProps.objs && // shallow compare reference
    prevProps.sprite === nextProps.sprite
  );
};

const MemoizedTimelinePill = React.memo(TimelinePill, areEqual);

// Refactor Timeline to a named function
function Timeline({
  analysis,
  videoDurationSec,
  sprite,
  onChange,
}: TimelineProps) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Group objects by id from analysis.frames
  const groupedByIdTimeline = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const frame of analysis.frames) {
      for (const obj of frame.objects) {
        const objWithFrame = {
          ...obj,
          frame_idx: frame.frame_idx,
          timestamp: frame.timestamp,
        };
        if (!map.has(obj.id)) map.set(obj.id, []);
        map.get(obj.id)!.push(objWithFrame);
      }
    }
    return Array.from(map.entries());
  }, [analysis]);

  // Virtualizer for outer list (object groups)
  const rowVirtualizer = useVirtualizer({
    count: groupedByIdTimeline.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // estimated row height
    overscan: 6,
  });

  // Merge mode state
  const [mergeMode, setMergeMode] = React.useState(false);
  const [selectedForMerge, setSelectedForMerge] = React.useState<number[]>([]);

  // Handler to merge selected lines
  const handleValidateMerge = () => {
    if (selectedForMerge.length !== 2) return;
    const [a, b] = selectedForMerge.sort((x, y) => x - y);
    const merged: [string, any[]][] = [];
    for (let i = 0; i < groupedByIdTimeline.length; i++) {
      if (i === a) {
        // Merge a and b
        const [id1, objs1] = groupedByIdTimeline[a];
        const [id2, objs2] = groupedByIdTimeline[b];
        merged.push([`${id1},${id2}`, [...objs1, ...objs2]]);
        if (b === a + 1) i++; // skip b if adjacent
      } else if (i !== b) {
        merged.push(groupedByIdTimeline[i]);
      }
    }
    // Rebuild frames for new analysis
    const allObjs = merged.flatMap(([id, objs]) =>
      objs.map((obj: any) => ({ ...obj, id })),
    );
    // Group by frame_idx and timestamp
    const frameMap = new Map<
      string,
      { frame_idx: number; timestamp: number; objects: any[] }
    >();
    for (const obj of allObjs) {
      const key = `${obj.frame_idx}|${obj.timestamp}`;
      if (!frameMap.has(key)) {
        frameMap.set(key, {
          frame_idx: obj.frame_idx,
          timestamp: obj.timestamp,
          objects: [],
        });
      }
      frameMap.get(key)!.objects.push({
        id: obj.id,
        thumbnail: obj.thumbnail,
        class_name: obj.class_name,
        confidence: obj.confidence,
        bbox: obj.bbox,
      });
    }
    const updatedAnalysis: DetectionResultsModel = {
      ...analysis,
      frames: Array.from(frameMap.values()),
    };
    onChange?.(updatedAnalysis);
    setMergeMode(false);
    setSelectedForMerge([]);
  };

  // Handler for selecting lines to merge
  const handleSelectLine = (idx: number) => {
    setSelectedForMerge((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      } else if (prev.length < 2) {
        return [...prev, idx];
      } else {
        return prev;
      }
    });
  };

  // Handler to activate/deactivate merge mode
  const handleToggleMergeMode = () => {
    setMergeMode((m) => {
      if (m) setSelectedForMerge([]);
      return !m;
    });
  };

  // Dialog state for object gallery
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryObjId, setGalleryObjId] = useState<string | null>(null);
  const handleOpenGallery = (id: string) => {
    setGalleryObjId(id);
    setGalleryOpen(true);
  };
  const handleCloseGallery = () => {
    setGalleryOpen(false);
    setGalleryObjId(null);
  };

  // Inline edit id state/handlers
  const [editingIdIdx, setEditingIdIdx] = useState<number | null>(null);
  const [editingIdValue, setEditingIdValue] = useState("");
  const handleIdEditStart = (idx: number, currentId: string) => {
    setEditingIdIdx(idx);
    setEditingIdValue(currentId);
  };
  const handleIdEditCancel = () => {
    setEditingIdIdx(null);
    setEditingIdValue("");
  };
  const handleIdEditSave = () => {
    if (editingIdIdx === null) return;
    const [oldId, objs] = groupedByIdTimeline[editingIdIdx];
    if (!editingIdValue.trim() || editingIdValue === oldId) {
      handleIdEditCancel();
      return;
    }
    // Update all objects in this group with new id
    const merged: [string, any[]][] = groupedByIdTimeline.map((entry, i) =>
      i === editingIdIdx
        ? [
            editingIdValue,
            entry[1].map((obj) => ({ ...obj, id: editingIdValue })),
          ]
        : entry,
    );
    // Rebuild frames for new analysis
    const allObjs = merged.flatMap(([id, objs]) =>
      objs.map((obj: any) => ({ ...obj, id })),
    );
    const frameMap = new Map<
      string,
      { frame_idx: number; timestamp: number; objects: any[] }
    >();
    for (const obj of allObjs) {
      const key = `${obj.frame_idx}|${obj.timestamp}`;
      if (!frameMap.has(key)) {
        frameMap.set(key, {
          frame_idx: obj.frame_idx,
          timestamp: obj.timestamp,
          objects: [],
        });
      }
      frameMap.get(key)!.objects.push({
        id: obj.id,
        thumbnail: obj.thumbnail,
        class_name: obj.class_name,
        confidence: obj.confidence,
        bbox: obj.bbox,
      });
    }
    const updatedAnalysis: DetectionResultsModel = {
      ...analysis,
      frames: Array.from(frameMap.values()),
    };
    onChange?.(updatedAnalysis);
    setEditingIdIdx(null);
    setEditingIdValue("");
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flex: 1,
          justifyContent: "end",
        }}
      >
        {mergeMode && (
          <Button
            variant="contained"
            size="small"
            color="success"
            disabled={selectedForMerge.length !== 2}
            onClick={handleValidateMerge}
          >
            Validate
          </Button>
        )}
        <Button
          variant={mergeMode ? "contained" : "outlined"}
          color={mergeMode ? "primary" : "inherit"}
          onClick={handleToggleMergeMode}
          size="small"
        >
          {mergeMode ? "Cancel" : "Merge"}
        </Button>
      </Box>
      <Box
        ref={parentRef}
        sx={{ maxHeight: 480, overflow: "auto", position: "relative" }}
      >
        <Box
          sx={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const index = virtualRow.index;
            const [id, objs] = groupedByIdTimeline[index];
            const first = objs[0];
            const thumb = getSpriteThumbnail(sprite ?? "", first.thumbnail);
            const checked = selectedForMerge.includes(index);
            return (
              <Box
                key={id}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  p: 1,
                  mb: 1,
                  height: virtualRow.size,
                }}
              >
                {mergeMode && (
                  <Checkbox
                    checked={checked}
                    onChange={() => handleSelectLine(index)}
                    disabled={!checked && selectedForMerge.length >= 2}
                    sx={{ mr: 1 }}
                    size="small"
                  />
                )}
                <Box
                  sx={{
                    bgcolor: "grey.200",
                    borderRadius: 1,
                    mr: 2,
                    minWidth: 48,
                    minHeight: 48,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={thumb}
                    alt={id}
                    sx={{
                      width: 48,
                      height: 48,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    maxWidth: 100,
                  }}
                >
                  {/* Inline editable id */}
                  {editingIdIdx === index ? (
                    <Input
                      value={editingIdValue}
                      size="small"
                      autoFocus
                      onChange={(e) => setEditingIdValue(e.target.value)}
                      onBlur={handleIdEditSave}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleIdEditSave();
                        if (e.key === "Escape") handleIdEditCancel();
                      }}
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "transparent",
                        fontSize: 14,
                        width: 120,
                        color: "black",
                        padding: 0,
                      }}
                    />
                  ) : (
                    <Typography
                      fontWeight="bold"
                      fontSize={14}
                      sx={{ cursor: "pointer", display: "inline-block" }}
                      onClick={() => handleIdEditStart(index, id)}
                    >
                      {id}
                    </Typography>
                  )}
                </Box>

                <MemoizedTimelinePill
                  objs={objs}
                  videoDurationSec={videoDurationSec}
                  sprite={sprite}
                  id={id}
                />

                {/* <IconButton
                  color="primary"
                  sx={{ ml: 1 }}
                  onClick={() => handleOpenGallery(id)}
                  size="small"
                  title="Show all detections"
                >
                  <Typography fontSize={16}>🖼️</Typography>
                </IconButton>
                <IconButton color="error" sx={{ ml: 2 }}>
                  <DeleteIcon fontSize="small" />
                </IconButton> */}
              </Box>
            );
          })}
        </Box>
      </Box>
      <ObjectGalleryDialog
        open={galleryOpen}
        onClose={handleCloseGallery}
        objectId={galleryObjId}
        objects={
          galleryObjId
            ? (groupedByIdTimeline.find(([oid]) => oid === galleryObjId)?.[1] ??
              [])
            : []
        }
        sprite={sprite}
      />
    </Box>
  );
}

// export Timeline as named export
export { Timeline };
