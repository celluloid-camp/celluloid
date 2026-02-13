// ObjectTimeline.js

import type { DetectionResultsModel } from "@celluloid/vision";
import { Box } from "@mui/material";
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
import { getSpriteThumbnail } from "@/lib/sprite";
import { formatDuration } from "@/utils/duration";

export function VisionChart({ analysis }: { analysis: DetectionResultsModel }) {
  const spriteUrl = analysis.metadata.sprite.path;
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);
  // Pre-process data once to be more efficient for the timeline
  const objectsByTime = useMemo(() => {
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
    return Object.values(objects).sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true }),
    );
  }, [analysis]);

  // Format data for Recharts Gantt chart
  const chartData = objectsByTime.map((obj) => ({
    task: obj.id,
    duration: [obj.startTime, obj.endTime],
    sprite: obj.sprite,
    className: obj.class_name,
    fill: "#8884d8",
  }));

  const duration =
    analysis.metadata.video.frame_count / analysis.metadata.video.fps;

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

const CustomTooltip = ({
  active,
  payload,
}: {
  active: boolean;
  payload: any;
}) => {
  const isVisible = active && payload && payload.length;
  return (
    <div
      className="custom-tooltip"
      style={{ visibility: isVisible ? "visible" : "hidden" }}
    >
      {isVisible && (
        <Box
          component="img"
          src={payload[0].payload.sprite}
          sx={{
            width: 60,
            height: 60,
            objectFit: "cover",
            borderRadius: 1,
            overflow: "hidden",
          }}
        />
      )}
    </div>
  );
};
