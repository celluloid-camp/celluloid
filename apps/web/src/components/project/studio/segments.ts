import type { DetectionResultsModel } from "@celluloid/vision-api/types";

/** A contiguous appearance of a tracked object on the timeline. */
export interface DetectionSegment {
  actionId: string;
  objectId: string;
  start: number;
  end: number;
  className: string;
  /** Representative sprite reference, e.g. "sprite.jpg#xywh=0,0,160,90". */
  thumbnail: string;
  count: number;
  /** Detection timestamps included in this segment. */
  timestamps: number[];
}

/** One tracked object id, with all of its appearance segments. */
export interface DetectionTrack {
  objectId: string;
  className: string;
  thumbnail: string;
  count: number;
  segments: DetectionSegment[];
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Typical spacing between sampled frames, used to size segments and split gaps. */
function frameStep(analysis: DetectionResultsModel): number {
  const timestamps = Array.from(
    new Set(analysis.frames.map((f) => f.timestamp)),
  ).sort((a, b) => a - b);
  const diffs: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    const d = timestamps[i] - timestamps[i - 1];
    if (d > 1e-6) diffs.push(d);
  }
  const step = median(diffs);
  return step > 0 ? step : 0.2;
}

/**
 * Turn per-frame detection points into per-object timeline tracks. Consecutive
 * detections closer than the gap threshold are merged into a single segment.
 */
export function buildTracks(analysis: DetectionResultsModel): DetectionTrack[] {
  const step = frameStep(analysis);
  const gapThreshold = Math.max(0.6, step * 3);

  type Point = {
    timestamp: number;
    className: string;
    thumbnail: string;
  };
  const pointsById = new Map<string, Point[]>();
  const orderedIds: string[] = [];

  for (const frame of analysis.frames) {
    for (const obj of frame.objects) {
      if (!pointsById.has(obj.id)) {
        pointsById.set(obj.id, []);
        orderedIds.push(obj.id);
      }
      pointsById.get(obj.id)!.push({
        timestamp: frame.timestamp,
        className: obj.class_name,
        thumbnail: obj.thumbnail,
      });
    }
  }

  return orderedIds.map((objectId) => {
    const points = pointsById
      .get(objectId)!
      .sort((a, b) => a.timestamp - b.timestamp);

    const segments: DetectionSegment[] = [];
    let segStart = points[0].timestamp;
    let prev = points[0].timestamp;
    let segCount = 1;
    let segThumb = points[0].thumbnail;
    let segTimestamps = [points[0].timestamp];

    const pushSegment = (end: number) => {
      segments.push({
        actionId: `${objectId}#${segments.length}`,
        objectId,
        start: segStart,
        end: end + step,
        className: points[0].className,
        thumbnail: segThumb,
        count: segCount,
        timestamps: segTimestamps,
      });
    };

    for (let i = 1; i < points.length; i++) {
      const ts = points[i].timestamp;
      if (ts - prev > gapThreshold) {
        pushSegment(prev);
        segStart = ts;
        segCount = 1;
        segThumb = points[i].thumbnail;
        segTimestamps = [ts];
      } else {
        segCount++;
        segTimestamps.push(ts);
      }
      prev = ts;
    }
    pushSegment(prev);

    return {
      objectId,
      className: points[0].className,
      thumbnail: points[0].thumbnail,
      count: points.length,
      segments,
    };
  });
}

/**
 * Merge several object tracks into the first selected id by reassigning the ids
 * of the others and rebuilding the frame list.
 */
export function mergeTracks(
  analysis: DetectionResultsModel,
  ids: string[],
): DetectionResultsModel {
  if (ids.length < 2) return analysis;
  const [target, ...rest] = ids;
  const restSet = new Set(rest);

  const frames = analysis.frames.map((frame) => ({
    ...frame,
    objects: frame.objects.map((obj) =>
      restSet.has(obj.id) ? { ...obj, id: target } : obj,
    ),
  }));

  return { ...analysis, frames };
}

type FlatDetection = {
  frame_idx: number;
  timestamp: number;
  object: DetectionResultsModel["frames"][number]["objects"][number];
};

function flattenDetections(analysis: DetectionResultsModel): FlatDetection[] {
  const flat: FlatDetection[] = [];
  for (const frame of analysis.frames) {
    for (const obj of frame.objects) {
      flat.push({
        frame_idx: frame.frame_idx,
        timestamp: frame.timestamp,
        object: { ...obj },
      });
    }
  }
  return flat;
}

function rebuildFrames(flat: FlatDetection[]): DetectionResultsModel["frames"] {
  const frameMap = new Map<string, DetectionResultsModel["frames"][number]>();
  for (const det of flat) {
    const key = `${det.frame_idx}|${det.timestamp}`;
    if (!frameMap.has(key)) {
      frameMap.set(key, {
        frame_idx: det.frame_idx,
        timestamp: det.timestamp,
        objects: [],
      });
    }
    frameMap.get(key)!.objects.push(det.object);
  }
  return Array.from(frameMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp,
  );
}

/**
 * Apply timeline drag/resize edits back onto per-frame detection timestamps.
 */
export function applyTimelineChange(
  analysis: DetectionResultsModel,
  tracks: DetectionTrack[],
  editorData: {
    id: string;
    actions: { id: string; start: number; end: number }[];
  }[],
): DetectionResultsModel {
  const segmentByActionId = new Map<string, DetectionSegment>();
  for (const track of tracks) {
    for (const segment of track.segments) {
      segmentByActionId.set(segment.actionId, segment);
    }
  }

  const fps = analysis.metadata.video.fps;
  const flat = flattenDetections(analysis);
  let changed = false;

  for (const row of editorData) {
    for (const action of row.actions) {
      const segment = segmentByActionId.get(action.id);
      if (!segment) continue;

      const idChanged = row.id !== segment.objectId;
      const startChanged = Math.abs(action.start - segment.start) > 1e-6;
      const endChanged = Math.abs(action.end - segment.end) > 1e-6;
      if (!idChanged && !startChanged && !endChanged) continue;

      changed = true;
      const timestampSet = new Set(segment.timestamps);
      const oldStart = segment.start;
      const oldEnd = segment.end;
      const oldDuration = oldEnd - oldStart || 1;

      for (const det of flat) {
        if (
          det.object.id !== segment.objectId ||
          !timestampSet.has(det.timestamp)
        ) {
          continue;
        }

        if (idChanged) {
          det.object.id = row.id;
        }

        const relative = (det.timestamp - oldStart) / oldDuration;
        det.timestamp = action.start + relative * (action.end - action.start);
        det.frame_idx = Math.round(det.timestamp * fps);
      }
    }
  }

  if (!changed) return analysis;
  return { ...analysis, frames: rebuildFrames(flat) };
}
