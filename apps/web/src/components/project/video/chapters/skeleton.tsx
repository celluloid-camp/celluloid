import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  Skeleton,
} from "@mui/lab";
import { timelineOppositeContentClasses } from "@mui/lab";
import { Stack } from "@mui/material";

export function ChapterListSkeleton() {
  return (
    <Timeline
      sx={{
        position: "relative",
        height: "100%",
        overflow: "auto",
        [`& .${timelineOppositeContentClasses.root}`]: {
          flex: 0,
        },
      }}
    >
      <TimelineItem sx={{ minHeight: 120 }}>
        <TimelineOppositeContent>
          <Skeleton
            variant="rectangular"
            width={120}
            height={80}
            sx={{ borderRadius: 2, backgroundColor: "grey.800" }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Skeleton
              variant="text"
              width={30}
              sx={{ backgroundColor: "grey.800" }}
            />
            <Skeleton
              variant="text"
              width={100}
              sx={{ backgroundColor: "grey.800" }}
            />
          </Stack>
        </TimelineOppositeContent>
        <TimelineSeparator color="primary">
          <TimelineDot
            variant="outlined"
            sx={{ borderWidth: 0, backgroundColor: "grey.800" }}
          />
          <TimelineConnector sx={{ backgroundColor: "grey.800" }} />
        </TimelineSeparator>
        <TimelineContent>
          <Skeleton
            variant="text"
            width="80%"
            height={24}
            sx={{ backgroundColor: "grey.800" }}
          />
          <Skeleton
            variant="text"
            width="60%"
            height={20}
            sx={{ backgroundColor: "grey.800" }}
          />
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
