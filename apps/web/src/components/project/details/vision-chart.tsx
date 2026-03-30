// ObjectTimeline.js
"use client";

import { useMediaSelector } from "media-chrome/react/media-store";
import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ImageSprite } from "@/components/common/image-sprite";
import { getSpriteThumbnail } from "@/lib/sprite";
import { VisionByProjectId } from "@/lib/trpc/types";
import { formatDuration } from "@/utils/duration";

export function VisionChart({
  data,
}: {
  data: NonNullable<VisionByProjectId>;
}) {
  const spriteUrl = data.spriteURL ?? "";
  const analysis = data.data;

  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);
  // Pre-process data once to be more efficient for the timeline
  const chartData = useMemo(() => {
    if (!analysis) {
      return null;
    }
    const objects: Record<string, any> = {};
    analysis.frames.forEach((frame) => {
      frame.objects.forEach((obj) => {
        if (!objects[obj.id]) {
          objects[obj.id] = {
            id: obj.id,
            className: obj.class_name,
            startTime: frame.timestamp,
            endTime: frame.timestamp,
            startFrame: frame.frame_idx,
            endFrame: frame.frame_idx,
            detections: [],
            bbox: obj.bbox,
            sprite: getSpriteThumbnail(spriteUrl, obj.thumbnail), // sprite from the first object
          };
        }
        objects[obj.id].endTime = frame.timestamp;
        objects[obj.id].endFrame = frame.frame_idx;
        objects[obj.id].detections.push({
          ...obj,
          frame_idx: frame.frame_idx,
          timestamp: frame.timestamp,
          sprite: getSpriteThumbnail(spriteUrl, obj.thumbnail),
        });
      });
    });
    const vw = analysis.metadata.video.width;
    const vh = analysis.metadata.video.height;

    return Object.values(objects)
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
      .map((obj) => {
        const b = obj.bbox as
          | { x: number; y: number; width: number; height: number }
          | undefined;
        const bboxNorm =
          b && vw > 0 && vh > 0
            ? {
                x: b.x / vw,
                y: b.y / vh,
                width: b.width / vw,
                height: b.height / vh,
              }
            : undefined;

        return {
          task: obj.id,
          duration: [obj.startTime, obj.endTime],
          sprite: obj.sprite,
          className: obj.class_name,
          bbox: bboxNorm,
          fill: "#8884d8",
        };
      });
  }, [analysis, spriteUrl]);

  if (!analysis || !chartData) {
    return null;
  }
  const duration =
    analysis.metadata.video.frame_count / analysis.metadata.video.fps;

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active: boolean;
    payload: any;
  }) => {
    const isVisible = active && payload && payload.length;
    const row = isVisible ? payload[0].payload : null;
    /** 16:9 preview */
    const previewW = 240;
    const previewH = 135;

    return (
      <div
        className="custom-tooltip"
        style={{ visibility: isVisible ? "visible" : "hidden" }}
      >
        {isVisible && row ? (
          <div className="aspect-video w-[240px] max-w-full overflow-hidden rounded-sm bg-black/5">
            <ImageSprite
              src={row.sprite}
              width={previewW}
              height={previewH}
              alt="Sprite preview"
              className="overflow-hidden rounded-sm"
              bbox={row.bbox}
            />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, Math.ceil(duration)]}
            label={{ value: "Time (s)", position: "insideBottom", offset: -5 }}
            tickFormatter={(value) => formatDuration(value)}
          />
          <YAxis type="category" dataKey="task" width={100} />
          <Tooltip content={CustomTooltip} />
          <Legend />
          <Bar dataKey="duration" fill="#8884d8">
            {/* This is how you can customize each bar if needed */}
          </Bar>
          {/* Custom element for the playhead */}
          <ReferenceLine x={mediaCurrentTime} stroke="red" strokeWidth={2} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
