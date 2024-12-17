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
  Divider,
  Grid,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAutoDetectionStore } from "./store";
import * as faceapi from "@vladmandic/face-api";
import React from "react";

const modelPath = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

interface Props {
  positionFloored: number;
  // position: number;
  playing: boolean;
  projectId: string;
  onEmotionDetectedChange(emotion: string): void;
}

export const AutoDetectionDialog = React.memo(
  ({ positionFloored, playing, projectId, onEmotionDetectedChange }: Props) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const captureIntervalRef = useRef<number | null>(null);
    const startPositionRef = useRef<number>(0);
    // const annotations = useRef<AnnotationData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const videoRefTmp = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetection, setIsDetection] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    const setDetectedEmotion = useAutoDetectionStore(
      (state) => state.setDetectedEmotion
    );

    const handleClose = () => setIsOpen(false);

    useEffect(() => {
      startPositionRef.current = positionFloored;
    }, [positionFloored]);

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
          setIsDetection(true);

          const emotion = Object.entries(detections[0]?.expressions).sort(
            (a, b) => b[1] - a[1]
          )[0][0];

          setDetectedEmotion(emotion);

          // if (
          //   annotations.current.length !== 0 &&
          //   annotations.current[annotations.current.length - 1].emotion ===
          //     emotion
          // )
          //   annotations.current[annotations.current.length - 1].stopTime =
          //     startPositionRef.current;
          // else {
          //   if (annotations.current.length !== 0) {
          //     try {
          //       await AnnotationService.create(
          //         projectId,
          //         annotations.current[annotations.current.length - 1]
          //       );
          //     } catch (e) {
          //       setError(e);
          //     }

          //     annotations.current.pop();
          //   }

          //   const annotation: AnnotationData = {
          //     text: "",
          //     startTime: startPositionRef.current,
          //     stopTime: startPositionRef.current,
          //     pause: !playing,
          //     autoDetect: true,
          //     semiAutoAnnotation: false,
          //     semiAutoAnnotationMe: false,
          //     emotion,
          //     ontology: [],
          //   };

          //   annotations.current.push(annotation);
          // }
        } else {
          setIsDetection(false);
          onEmotionDetectedChange?.("");
        }

        await delay(100);

        requestAnimationFrame(() => captureFrame());
      }
    };

    useEffect(() => {
      const loadModels = async () => {
        setIsLoading(true);

        try {
          await Promise.all([
            await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
            // await faceapi.nets.tinyYolov2.loadFromUri(modelPath),
            // await faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
            await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
            await faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
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
            setError(
              `Camera Error: camera not available: ${err.message || err}`
            );
          return null;
        }
      };

      startStream();

      return () => {
        // console.log(annotations.current);
        clearInterval(captureIntervalRef.current as number);

        // const pushLastAnnotation = async () => {
        //   if (annotations.current.length !== 0) {
        //     try {
        //       await AnnotationService.create(
        //         projectId,
        //         annotations.current[annotations.current.length - 1]
        //       );
        //     } catch (e) {
        //       setError(e);
        //     }

        //     annotations.current.pop();
        //   }
        // };

        // pushLastAnnotation();

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
        {/* <canvas ref={canvasRef} style={{ display: 'none' }} /> */}
        {/* <canvas ref={canvasRef} style={{ height: '700px', width: '1000px' }} /> */}
        {/* <div
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', background: 'black', padding: '5px' }}>{positionFloored} -- {position}
        </div> */}

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

            {/* <Grid container>
              <Grid item>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >

                </div>
              </Grid>

              <Grid item>
                {isLoading && <Typography>Loading ...</Typography>}

                {!isLoading && isDetection && (
                  <Typography color="primary" paragraph>
                    Detection OK
                  </Typography>
                )}




                <Divider variant="middle" />

                <Link>Click here</Link>

                <Divider variant="middle" />
              </Grid>
            </Grid> */}
            {!isLoading && !isDetection && (
              <Box>
                <Typography color="error" paragraph>
                  Detection failed, please follow the recommendations
                </Typography>
                <Button>More Info</Button>
              </Box>
            )}

            {error && (
              <Typography color="error" paragraph>
                {error}
              </Typography>
            )}
          </DialogContent>

          <DialogActions>
            <Button autoFocus onClick={handleClose} variant="contained">
              Enable & Start
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
);
