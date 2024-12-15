import { Box } from "@mui/material";
import { useEffect, useState, useRef, type CSSProperties } from "react";

// import AnnotationService from 'services/AnnotationService';

interface Emoji {
  label: string;
  value: string;
}

interface EmotionRecommended {
  emotion: string;
  score: number;
}

const emojisArray: Emoji[] = [
  {
    label: "👍",
    value: "iLike",
  },
  {
    label: "👎",
    value: "iDontLike",
  },
  {
    label: "😐",
    value: "neutral",
  },
  {
    label: "😮",
    value: "surprised",
  },
  {
    label: "😄",
    value: "smile",
  },
  {
    label: "😂",
    value: "laugh",
  },
  {
    label: "😠",
    value: "angry",
  },
  {
    label: "☹️",
    value: "sad",
  },
  {
    label: "🥹",
    value: "empathy",
  },
  {
    label: "😨",
    value: "fearful",
  },
  {
    label: "🤮",
    value: "disgusted",
  },
  {
    label: "🤔",
    value: "itsStrange",
  },
];

const OFFSET = 10;

interface EmotionsPaletteProps {
  projectId: string;
  position: number;
  semiAutoAnnotation: boolean;
  semiAutoAnnotationMe: boolean;
  emotion?: string;
  emotionDetected: string;
  onEmotionChange(emotion: string | undefined): void;
  sx?: CSSProperties;
}

export function EmotionsPalette({
  position,
  projectId,
  semiAutoAnnotation = true,
  semiAutoAnnotationMe = false,
  emotion,
  sx,
  onEmotionChange,
}: EmotionsPaletteProps) {
  const [hoveredComponent, setHoveredComponent] = useState<number | null>(null);
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const captureIntervalRef = useRef<number | null>(null);
  const startPositionRef = useRef<number>(0);

  // Update position ref
  useEffect(() => {
    startPositionRef.current = position;
  }, [position]);

  // Others Detection/No Detection
  useEffect(() => {
    const mapEmotionToEmojis = (emotionDetected: string): Emoji[] => {
      const emojis = (() => {
        switch (emotionDetected) {
          case "neutral":
            return [emojisArray.find((emoji) => emoji.value === "neutral")];
          case "happy":
            return [
              emojisArray.find((emoji) => emoji.value === "laugh"),
              emojisArray.find((emoji) => emoji.value === "smile"),
            ];
          case "surprised":
            return [
              emojisArray.find((emoji) => emoji.value === "surprised"),
              emojisArray.find((emoji) => emoji.value === "fearful"),
            ];
          case "fearful":
            return [
              emojisArray.find((emoji) => emoji.value === "surprised"),
              emojisArray.find((emoji) => emoji.value === "fearful"),
            ];
          case "angry":
            return [
              emojisArray.find((emoji) => emoji.value === "angry"),
              emojisArray.find((emoji) => emoji.value === "sad"),
              emojisArray.find((emoji) => emoji.value === "disgusted"),
            ];
          case "disgusted":
            return [
              emojisArray.find((emoji) => emoji.value === "angry"),
              emojisArray.find((emoji) => emoji.value === "sad"),
              emojisArray.find((emoji) => emoji.value === "disgusted"),
            ];
          case "sad":
            return [
              emojisArray.find((emoji) => emoji.value === "angry"),
              emojisArray.find((emoji) => emoji.value === "sad"),
              emojisArray.find((emoji) => emoji.value === "disgusted"),
            ];
          case "iLike":
            return [emojisArray.find((emoji) => emoji.value === "neutral")];
          case "iDontLike":
            return [emojisArray.find((emoji) => emoji.value === "iDontLike")];
          case "laugh":
            return [emojisArray.find((emoji) => emoji.value === "laugh")];
          case "smile":
            return [emojisArray.find((emoji) => emoji.value === "smile")];
          case "empathy":
            return [emojisArray.find((emoji) => emoji.value === "empathy")];
          case "itsStrange":
            return [emojisArray.find((emoji) => emoji.value === "itsStrange")];
          default:
            return [emojisArray.find((emoji) => emoji.value === "neutral")];
        }
      })().filter((item): item is Emoji => item !== undefined);

      return emojis;
    };

    const generatePalette = (suggestions: EmotionRecommended[]): Emoji[] => {
      const emojisFlattened: Emoji[] = suggestions.flatMap(
        (emotionRecommended) => mapEmotionToEmojis(emotionRecommended.emotion)
      );

      const palette = Array.from(
        new Set(emojisFlattened.map((obj) => obj.value))
      )
        .map((value) => emojisFlattened.find((obj) => obj.value === value))
        .filter((item): item is Emoji => item !== undefined);

      return palette;
    };

    const updateEmojis = async () => {
      try {
        let startTimeParam: number = startPositionRef.current;

        if (semiAutoAnnotationMe) {
          if (startTimeParam - 10 >= 0) startTimeParam = startTimeParam - 10;
          else startTimeParam = 0;
        } else {
          if (startTimeParam - 5 >= 0) startTimeParam = startTimeParam - 5;
          else startTimeParam = 0;
        }

        const suggestions: EmotionRecommended[] = [];
        // await AnnotationService.getRecommendedEmotions(projectId, {
        //   onlyMe: semiAutoAnnotationMe,
        //   startTime: startTimeParam,
        //   offset: OFFSET + 5,
        //   limit: 4,
        // });

        const palette: Emoji[] = generatePalette(suggestions);

        if (!palette.length) {
          const neutralEmoji = emojisArray.find(
            (emoji) => emoji.value === "neutral"
          );

          if (neutralEmoji) palette.push(neutralEmoji);
        }

        // Always add like and dislike
        if (!palette.find((emotion) => emotion.value === "iDontLike"))
          palette.unshift(emojisArray[1]);

        if (!palette.find((emotion) => emotion.value === "iLike"))
          palette.unshift(emojisArray[0]);

        setEmojis(palette);
      } catch (e) {
        console.log(e);
      }
    };

    if (semiAutoAnnotation || semiAutoAnnotationMe) {
      updateEmojis();
      captureIntervalRef.current = window.setInterval(
        updateEmojis,
        OFFSET * 1000
      );
    } else setEmojis(emojisArray);

    return () => {
      clearInterval(captureIntervalRef.current as number);
    };
  }, [semiAutoAnnotation, semiAutoAnnotationMe, projectId]);

  // UI Code
  const handleHover = (index: number) => {
    setHoveredComponent(index);
  };

  const handleHoverLeave = () => {
    setHoveredComponent(null);
  };

  const elementStyle: CSSProperties = {
    display: "inline-block",
    fontSize: "1.3rem",
    borderRadius: "100%",
    width: "30px",
    height: "30px",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform .3s",
    boxShadow:
      "rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px",
  };

  return (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      justifyItems={"center"}
      gap="1px"
      height="2.5rem"
    >
      {emojis.map((emoji, index) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          key={emoji.value}
          onMouseEnter={() => handleHover(index)}
          onMouseLeave={handleHoverLeave}
          title={emoji.value}
          style={{
            ...elementStyle,
            transform:
              hoveredComponent === index ? "translateY(-20%) scale(2)" : "",
            backgroundColor: emotion === emoji.value ? "black" : "transparent",
          }}
          onClick={(_e) => {
            if (emoji.value !== emotion) onEmotionChange(emoji.value);
            else onEmotionChange(undefined);
          }}
        >
          {emoji.label}
        </div>
      ))}
    </Box>
  );
}
