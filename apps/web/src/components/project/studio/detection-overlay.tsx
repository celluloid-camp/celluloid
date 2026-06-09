"use client";
import type { DetectionResultsModel } from "@celluloid/vision-api/types";
import { Box } from "@mui/material";
import { useMediaSelector } from "media-chrome/react/media-store";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { buildTracks, type DetectionTrack } from "./segments";
import { trackColor } from "./track-color";

type FrameWithTime = {
  frame: DetectionResultsModel["frames"][number];
  tsSec: number;
};

function inferSeconds(timestamps: number[]): {
  toSec: (ts: number) => number;
} {
  if (timestamps.length === 0) {
    return { toSec: (ts) => ts };
  }
  const maxRaw = Math.max(...timestamps);
  const minRaw = Math.min(...timestamps);
  const looksLikeMs =
    maxRaw > 5_000 && minRaw >= 0 && maxRaw / 1000 < 24 * 3600;
  return {
    toSec: (ts: number) => (looksLikeMs ? ts / 1000 : ts),
  };
}

function matchEpsilonFromSorted(sortedSec: FrameWithTime[]): number {
  if (sortedSec.length === 0) {
    return 0;
  }
  if (sortedSec.length === 1) {
    return 0.12;
  }
  let minGap = Infinity;
  for (let i = 1; i < sortedSec.length; i++) {
    const g = sortedSec[i].tsSec - sortedSec[i - 1].tsSec;
    if (g > 1e-12) {
      minGap = Math.min(minGap, g);
    }
  }
  if (!Number.isFinite(minGap) || minGap <= 0) {
    return 0.12;
  }
  return Math.max(0.015, Math.min(minGap * 0.45, 0.25));
}

function getClosestFrame(
  sorted: FrameWithTime[],
  t: number,
): { frame: FrameWithTime["frame"]; dist: number } | undefined {
  if (sorted.length === 0) {
    return undefined;
  }

  let lo = 0;
  let hi = sorted.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (sorted[mid].tsSec < t) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  let best = sorted[lo];
  let bestDist = Math.abs(best.tsSec - t);
  if (lo > 0) {
    const prev = sorted[lo - 1];
    const d = Math.abs(prev.tsSec - t);
    if (d < bestDist) {
      best = prev;
      bestDist = d;
    }
  }
  return { frame: best.frame, dist: bestDist };
}

function activeObjectIdsAtTime(
  tracks: DetectionTrack[],
  t: number,
): Set<string> {
  const ids = new Set<string>();
  for (const track of tracks) {
    for (const segment of track.segments) {
      if (t >= segment.start && t <= segment.end) {
        ids.add(track.objectId);
        break;
      }
    }
  }
  return ids;
}

type DetectionOverlayProps = {
  analysis: DetectionResultsModel;
  videoWidth: number;
  videoHeight: number;
  tracks?: DetectionTrack[];
};

export function DetectionOverlay({
  analysis,
  videoWidth,
  videoHeight,
  tracks: tracksProp,
}: DetectionOverlayProps) {
  const currentTime = useMediaSelector((state) => state.mediaCurrentTime);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: videoWidth,
    height: videoHeight,
  });

  const tracks = useMemo(
    () => tracksProp ?? buildTracks(analysis),
    [tracksProp, analysis],
  );

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new window.ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const t = currentTime ?? 0;

  const { framesSortedSec, contentEndSec, matchEpsilon } = useMemo(() => {
    const raw = analysis.frames.map((f) => f.timestamp);
    const { toSec } = inferSeconds(raw);

    const framesSortedSec: FrameWithTime[] = [...analysis.frames]
      .map((frame) => ({
        frame,
        tsSec: toSec(frame.timestamp),
      }))
      .sort((a, b) => a.tsSec - b.tsSec);

    const eps = matchEpsilonFromSorted(framesSortedSec);
    const lastTs =
      framesSortedSec.length > 0
        ? framesSortedSec[framesSortedSec.length - 1].tsSec
        : 0;

    return {
      framesSortedSec,
      contentEndSec: lastTs + eps,
      matchEpsilon: eps,
    };
  }, [analysis.frames]);

  const objects = useMemo(() => {
    const EPS = 1e-3;
    if (framesSortedSec.length === 0) {
      return [];
    }
    if (t < -EPS || t > contentEndSec + EPS) {
      return [];
    }

    const activeIds = activeObjectIdsAtTime(tracks, t);
    if (activeIds.size === 0) {
      return [];
    }

    const closest = getClosestFrame(framesSortedSec, t);
    if (!closest || closest.dist > matchEpsilon) {
      return [];
    }

    return (closest.frame.objects ?? []).filter((obj) => activeIds.has(obj.id));
  }, [t, framesSortedSec, contentEndSec, matchEpsilon, tracks]);

  const scaleX = containerSize.width / videoWidth;
  const scaleY = containerSize.height / videoHeight;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {objects.map((obj) => {
        const color = trackColor(obj.id);
        return (
          <Box key={String(obj.id)}>
            <Box
              sx={{
                position: "absolute",
                left: obj.bbox.x * scaleX,
                top: obj.bbox.y * scaleY,
                width: obj.bbox.width * scaleX,
                height: obj.bbox.height * scaleY,
                border: `2px solid ${color}`,
                bgcolor: `${color}22`,
                boxSizing: "border-box",
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: obj.bbox.x * scaleX,
                top: obj.bbox.y * scaleY - 18,
                bgcolor: color,
                color: "#fff",
                px: 1,
                py: 0.2,
                fontSize: 12,
                pointerEvents: "none",
                zIndex: 11,
                whiteSpace: "nowrap",
              }}
            >
              {obj.id}
            </Box>
          </Box>
        );
      })}
    </div>
  );
}
