"use client";

import { Box, Typography } from "@mui/material";
import {
  MediaActionTypes,
  timeUtils,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import { useCallback, useRef, useState } from "react";

const { formatTime } = timeUtils;

const TRACK_HEIGHT = 2;
const TRACK_HEIGHT_HOVER = 5;

export const Seekbar = () => {
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);
  const [min = 0, max = 0] =
    useMediaSelector((state) => state.mediaSeekable) ?? [];
  const trackRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const duration = max - min || 1;
  const progress = Math.min(
    1,
    Math.max(0, ((mediaCurrentTime ?? 0) - min) / duration),
  );

  const handleSeek = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      const time = min + ratio * duration;
      dispatch({ type: MediaActionTypes.MEDIA_SEEK_REQUEST, detail: time });
    },
    [dispatch, min, duration],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      handleSeek(e.clientX);
    },
    [handleSeek],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      const time = min + ratio * duration;
      setHoverTime(time);
    },
    [min, duration],
  );

  const handleMouseLeave = useCallback(() => {
    setHover(false);
    setHoverTime(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const clientX = rect.left + rect.width * progress;
      handleSeek(clientX);
    },
    [handleSeek, progress],
  );

  return (
    <Box
      role="slider"
      aria-label="Seek"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={mediaCurrentTime ?? 0}
      tabIndex={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      sx={{
        flex: 1,
        mx: 2,
        cursor: "pointer",
        minWidth: 80,
        py: 1.5,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        ref={trackRef}
        sx={{
          width: "100%",
          height: hover ? TRACK_HEIGHT_HOVER : TRACK_HEIGHT,
          borderRadius: 0,
          bgcolor: "rgba(255, 255, 255, 0.3)",
          transition: "height 0.2s ease",
          position: "relative",
          overflow: "visible",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress * 100}%`,
            bgcolor: "primary.main",
            borderRadius: 0,
            pointerEvents: "none",
          }}
        />
        {hoverTime !== null && (
          <Box
            sx={{
              position: "absolute",
              bottom: "100%",
              left: `${((hoverTime - min) / duration) * 100}%`,
              transform: "translateX(-50%)",
              mb: 0.5,
              px: 1,
              py: 0.5,
              bgcolor: "rgba(0, 0, 0, 0.8)",
              borderRadius: 1,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            <Typography
              variant="caption"
              className="text-white"
              component="span"
            >
              {formatTime(hoverTime, max)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
