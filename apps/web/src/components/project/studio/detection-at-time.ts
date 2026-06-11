import type { DetectionResultsModel } from "@celluloid/vision-api/types";
import type { DetectionTrack } from "./segments";

export type Bbox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DetectionPoint = {
  timestamp: number;
  bbox: Bbox;
};

export function activeObjectIdsAtTime(
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

export function buildDetectionIndex(
  analysis: DetectionResultsModel,
): Map<string, DetectionPoint[]> {
  const byId = new Map<string, DetectionPoint[]>();
  for (const frame of analysis.frames) {
    for (const obj of frame.objects) {
      const list = byId.get(obj.id) ?? [];
      list.push({ timestamp: frame.timestamp, bbox: obj.bbox });
      byId.set(obj.id, list);
    }
  }
  for (const points of byId.values()) {
    points.sort((a, b) => a.timestamp - b.timestamp);
  }
  return byId;
}

function interpolateBbox(a: Bbox, b: Bbox, ratio: number): Bbox {
  const t = Math.min(1, Math.max(0, ratio));
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    width: a.width + (b.width - a.width) * t,
    height: a.height + (b.height - a.height) * t,
  };
}

export function bboxAtTime(
  points: DetectionPoint[],
  t: number,
): Bbox | undefined {
  if (points.length === 0) {
    return undefined;
  }
  if (points.length === 1) {
    return points[0].bbox;
  }
  if (t <= points[0].timestamp) {
    return points[0].bbox;
  }
  const last = points[points.length - 1];
  if (t >= last.timestamp) {
    return last.bbox;
  }

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    if (t >= current.timestamp && t <= next.timestamp) {
      const span = next.timestamp - current.timestamp;
      const ratio = span > 0 ? (t - current.timestamp) / span : 0;
      return interpolateBbox(current.bbox, next.bbox, ratio);
    }
  }

  return last.bbox;
}

function denormalizeBbox(
  bbox: { x: number; y: number; width: number; height: number },
  videoWidth: number,
  videoHeight: number,
): Bbox {
  return {
    x: bbox.x * videoWidth,
    y: bbox.y * videoHeight,
    width: bbox.width * videoWidth,
    height: bbox.height * videoHeight,
  };
}

export function detectionsAtTime({
  tracks,
  detectionIndex,
  trackById,
  t,
  videoWidth,
  videoHeight,
}: {
  tracks: DetectionTrack[];
  detectionIndex: Map<string, DetectionPoint[]>;
  trackById: Map<string, DetectionTrack>;
  t: number;
  videoWidth: number;
  videoHeight: number;
}): { id: string; bbox: Bbox }[] {
  const activeIds = activeObjectIdsAtTime(tracks, t);
  if (activeIds.size === 0) {
    return [];
  }

  const result: { id: string; bbox: Bbox }[] = [];
  for (const objectId of activeIds) {
    const points = detectionIndex.get(objectId);
    let bbox = points ? bboxAtTime(points, t) : undefined;

    if (!bbox) {
      const track = trackById.get(objectId);
      if (track?.bbox) {
        bbox = denormalizeBbox(track.bbox, videoWidth, videoHeight);
      }
    }

    if (bbox) {
      result.push({ id: objectId, bbox });
    }
  }

  return result;
}
