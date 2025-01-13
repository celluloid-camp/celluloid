import { useEffect, useRef, useState } from "react";
// import * as faceapi from "@vladmandic/face-api";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAutoDetectionStore, usePlayerModeStore } from "./store";
import * as faceapi from "@vladmandic/face-api";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  type ProjectById,
  trpc,
  type UserMe,
  type AnnotationAddInput,
} from "~/utils/trpc";
import { useVideoPlayerProgressValue } from "../project/useVideoPlayer";

const MODEL_URI = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

interface Props {
  project: ProjectById;
  user?: UserMe;
}

export const AutoDetectionDialog = React.memo(({ project, user }: Props) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureIntervalRef = useRef<number | null>(null);
  const startPositionRef = useRef<number>(0);
  const annotations = useRef<AnnotationAddInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const videoRefTmp = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetection, setIsDetection] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const videoProgress = useVideoPlayerProgressValue();
  const playerMode = usePlayerModeStore((state) => state.mode);

  const addMutation = trpc.annotation.add.useMutation();

  const setDetectedEmotion = useAutoDetectionStore(
    (state) => state.setDetectedEmotion
  );

  const handleClose = () => setIsOpen(false);

  function delay(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  const captureFrame = async () => {
    if (videoRef.current) {
      const video = videoRef.current;

      // Detect faces in the captured frame
      const detections = await faceapi
        .detectAllFaces(
          video as faceapi.TNetInput,
          new faceapi.TinyFaceDetectorOptions()
        )
        // .detectAllFaces(video as faceapi.TNetInput, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length) {
        if (isDetection === false) {
          setIsDetection(true);
        }

        const emotion = Object.entries(detections[0]?.expressions).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        setDetectedEmotion(emotion);

        if (
          annotations.current.length !== 0 &&
          annotations.current[annotations.current.length - 1].emotion ===
            emotion
        )
          annotations.current[annotations.current.length - 1].stopTime =
            startPositionRef.current;
        else {
          if (annotations.current.length !== 0) {
            try {
              await addMutation.mutateAsync({
                ...annotations.current[annotations.current.length - 1],
                projectId: project.id,
              });
            } catch (e) {
              console.error(e);
            }

            annotations.current.pop();
          }

          const annotation: AnnotationAddInput = {
            text: "",
            startTime: videoProgress,
            stopTime: videoProgress,
            pause: false,
            projectId: project.id,
            // autoDetect: true,
            // semiAutoAnnotation: false,
            // semiAutoAnnotationMe: false,
            emotion,
            detection: "auto",
            mode: playerMode,
            // ontology: [],
          };

          annotations.current.push(annotation);
        }
      } else {
        setIsDetection(false);
      }

      await delay(100);
      requestAnimationFrame(() => captureFrame());
    }
  };

  const pushLastAnnotation = async () => {
    if (annotations.current.length !== 0) {
      try {
        await addMutation.mutateAsync({
          ...annotations.current[annotations.current.length - 1],
          projectId: project.id,
        });
      } catch (e) {
        console.error(e);
      }
      annotations.current.pop();
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);

      try {
        await Promise.all([
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URI),
          // await faceapi.nets.tinyYolov2.loadFromUri(modelPath),
          // await faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URI),
          await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URI),
        ]);
      } catch (e) {
        setError("Failed to load the models ...");
      } finally {
        setIsLoading(false);
      }
    };

    let stream: MediaStream | null = null;

    const startStream = async () => {
      await loadModels();
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (stream && videoRef.current && videoRefTmp.current) {
          videoRef.current.srcObject = stream;
          videoRefTmp.current.srcObject = stream;
          await videoRefTmp.current.play();
          videoRef.current.play().then(() => {
            // if (videoRef.current)
            //   videoRef.current.currentTime = startPositionRef.current;
            // captureIntervalRef.current = window.setInterval(captureFrame, 500);
            captureFrame();
          });
        }
      } catch (err) {
        if (
          err.name === "PermissionDeniedError" ||
          err.name === "NotAllowedError"
        )
          setError(
            `Camera Error: camera permission denied: ${err.message || err}`
          );
        if (err.name === "SourceUnavailableError")
          setError(`Camera Error: camera not available: ${err.message || err}`);
        return null;
      }
    };

    startStream();

    return () => {
      clearInterval(captureIntervalRef.current as number);
      pushLastAnnotation();
      if (stream) {
        const tracks = stream.getTracks();
        for (const track of tracks) {
          track.stop();
        }
      }
    };
  }, []);

  return (
    <>
      <video ref={videoRef} style={{ display: "none" }}>
        <track kind="captions" />
      </video>
      <Dialog open={isOpen} onClose={handleClose}>
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Auto Detection Mode
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent dividers>
          <video
            ref={videoRefTmp}
            autoPlay
            style={{
              display: "block",
              width: "100%",
              height: "400px",
              backgroundColor: "black",
            }}
            id="video"
            playsInline
            className="video"
          >
            <track kind="captions" />
          </video>

          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box>
                <CircularProgress />
              </Box>
            </Box>
          )}
          {!isLoading && error ? (
            <Box>
              <Typography color="error" paragraph>
                Detection failed, please follow the recommendations
              </Typography>
              <Button>More Info</Button>
            </Box>
          ) : null}

          {error && (
            <Typography color="error" paragraph>
              {error}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            autoFocus
            onClick={handleClose}
            variant="contained"
            disabled={isLoading || !isDetection}
          >
            {t("emotion-detection.button.start")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
