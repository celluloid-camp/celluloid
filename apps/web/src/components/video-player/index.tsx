"use client";

import * as React from "react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ReactPlayer from "react-player";
import type { PlayerEntry } from "react-player";
import { Box, IconButton, Slider, Stack, Typography } from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  FastForward,
  FastRewind,
  ClosedCaption,
  ClosedCaptionDisabled,
} from "@mui/icons-material";
import { PeerTubePlayerComponent } from "./peertube-player";
import { useSetVideoPlayerProgress, useSetVideoPlayerState } from "./store";
import {
  useVideoPlayerEvent,
  useVideoPlayerSeekEvent,
} from "./user-video-player-events";

// Create a PlayerEntry for the PeerTube player
const peertubePlayerEntry: PlayerEntry = {
  key: "peertube",
  name: "PeerTube",
  canPlay: PeerTubePlayerComponent.canPlay,
  player: PeerTubePlayerComponent,
};

// Register the custom PeerTube player
if (typeof ReactPlayer.addCustomPlayer === "function") {
  ReactPlayer.addCustomPlayer(peertubePlayerEntry);
} else {
  console.warn(
    "ReactPlayer.addCustomPlayer is not available. PeerTube videos may not work.",
  );
}

interface OnProgressProps {
  playedSeconds: number;
  loadedSeconds: number;
}

interface VideoPlayerProps {
  url: string;
  height?: number | string;
}

// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const VideoPlayer = forwardRef(({ url, height }: VideoPlayerProps, ref) => {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [hasSubtitles, setHasSubtitles] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const setVideoPlayerProgress = useSetVideoPlayerProgress();
  const setVideoPlayerState = useSetVideoPlayerState();
  
  useImperativeHandle(ref, () => playerRef.current);

  const dispatcher = useVideoPlayerEvent();

  useVideoPlayerSeekEvent((event) => {
    if (playerRef.current && event.time !== undefined && isReady) {
      playerRef.current.seekTo(event.time);
    }
  });

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (playing) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }
  }, [playing]);

  const handleReady = () => {
    setIsReady(true);
    // Check if video has text tracks (subtitles)
    checkForSubtitles();
  };

  const checkForSubtitles = () => {
    try {
      const internalPlayer = playerRef.current?.getInternalPlayer();
      if (internalPlayer && internalPlayer.textTracks) {
        const tracks = Array.from(internalPlayer.textTracks);
        setHasSubtitles(tracks.length > 0);
      }
    } catch (error) {
      console.error("Error checking for subtitles:", error);
    }
  };

  const handleToggleSubtitles = () => {
    try {
      const internalPlayer = playerRef.current?.getInternalPlayer();
      if (internalPlayer && internalPlayer.textTracks) {
        const tracks = Array.from(internalPlayer.textTracks) as TextTrack[];
        if (tracks.length > 0) {
          // Toggle the first subtitle track
          const track = tracks[0];
          if (subtitlesEnabled) {
            track.mode = "hidden";
            setSubtitlesEnabled(false);
          } else {
            track.mode = "showing";
            setSubtitlesEnabled(true);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling subtitles:", error);
    }
  };

  const handlePlay = () => {
    if (!isReady) {
      setIsReady(true);
      setVideoPlayerState("READY");
      dispatcher({
        state: "READY",
        progress: playerRef.current?.getCurrentTime() || 0,
      });
    }
    setPlaying(true);
    setVideoPlayerState("PLAYING");
    dispatcher({
      state: "PLAYING",
      progress: playerRef.current?.getCurrentTime() || 0,
    });
  };

  const handlePause = () => {
    setPlaying(false);
    setVideoPlayerState("PAUSED");
    dispatcher({
      state: "PAUSED",
      progress: playerRef.current?.getCurrentTime() || 0,
    });
  };

  const handleProgress = ({ playedSeconds }: OnProgressProps) => {
    if (!seeking) {
      setPlayed(playedSeconds);
      setVideoPlayerProgress(playedSeconds);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleBuffer = () => {
    setVideoPlayerState("BUFFERING");
    dispatcher({
      state: "BUFFERING",
      progress: playerRef.current?.getCurrentTime() || 0,
    });
  };

  const handleSeek = (seconds: number) => {
    setVideoPlayerState("SEEK");
    dispatcher({
      state: "SEEK",
      progress: seconds,
    });
    setVideoPlayerProgress(seconds);
  };

  const handleError = (error: Error) => {
    setVideoPlayerState("ERROR");
    dispatcher({
      state: "ERROR",
      progress: 0,
      error,
    });
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const volumeValue = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(volumeValue);
    setMuted(volumeValue === 0);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (_event: Event, newValue: number | number[]) => {
    const seekValue = Array.isArray(newValue) ? newValue[0] : newValue;
    setPlayed(seekValue);
  };

  const handleSeekMouseUp = (_event: Event | React.SyntheticEvent, newValue: number | number[]) => {
    setSeeking(false);
    const seekValue = Array.isArray(newValue) ? newValue[0] : newValue;
    if (playerRef.current) {
      playerRef.current.seekTo(seekValue);
      handleSeek(seekValue);
    }
  };

  const handleSkipForward = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = Math.min(currentTime + 10, duration);
      playerRef.current.seekTo(newTime);
      handleSeek(newTime);
    }
  };

  const handleSkipBackward = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = Math.max(currentTime - 10, 0);
      playerRef.current.seekTo(newTime);
      handleSeek(newTime);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: height || "100%",
        backgroundColor: "#000",
        overflow: "hidden",
        "&:hover .video-controls": {
          opacity: 1,
        },
      }}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        height="100%"
        width="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        controls={false}
        config={{
          peertube: {
            controls: 0,
            controlBar: 0,
            peertubeLink: 0,
            title: 0,
            warningTitle: 0,
            p2p: 0,
            autoplay: 0,
          },
        }}
        onReady={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onBuffer={handleBuffer}
        onError={handleError}
        onSeek={handleSeek}
      />
      
      {/* Custom Material UI Controls */}
      <Box
        className="video-controls"
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
          padding: 2,
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {/* Progress bar */}
        <Slider
          size="small"
          value={played}
          min={0}
          max={duration}
          step={0.1}
          onChange={handleSeekChange}
          onMouseDown={handleSeekMouseDown}
          onChangeCommitted={handleSeekMouseUp}
          sx={{
            color: "primary.main",
            "& .MuiSlider-thumb": {
              width: 12,
              height: 12,
            },
          }}
        />
        
        {/* Control buttons */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={handlePlayPause}
            sx={{ color: "white" }}
            size="small"
          >
            {playing ? <Pause /> : <PlayArrow />}
          </IconButton>
          
          <IconButton
            onClick={handleSkipBackward}
            sx={{ color: "white" }}
            size="small"
          >
            <FastRewind />
          </IconButton>
          
          <IconButton
            onClick={handleSkipForward}
            sx={{ color: "white" }}
            size="small"
          >
            <FastForward />
          </IconButton>
          
          <IconButton
            onClick={handleToggleMute}
            sx={{ color: "white" }}
            size="small"
          >
            {muted || volume === 0 ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          
          <Slider
            size="small"
            value={muted ? 0 : volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            sx={{
              width: 80,
              color: "white",
              "& .MuiSlider-thumb": {
                width: 10,
                height: 10,
              },
            }}
          />
          
          <Typography
            variant="caption"
            sx={{ color: "white", minWidth: "80px", ml: 2 }}
          >
            {formatTime(played)} / {formatTime(duration)}
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {hasSubtitles && (
            <IconButton
              onClick={handleToggleSubtitles}
              sx={{ color: "white" }}
              size="small"
              title={subtitlesEnabled ? "Hide subtitles" : "Show subtitles"}
            >
              {subtitlesEnabled ? <ClosedCaption /> : <ClosedCaptionDisabled />}
            </IconButton>
          )}
          
          <IconButton
            onClick={handleFullscreen}
            sx={{ color: "white" }}
            size="small"
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
