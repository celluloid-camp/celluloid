import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from "@mui/lab/TimelineOppositeContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

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
