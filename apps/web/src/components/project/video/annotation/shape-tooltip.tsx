"use client";

import { Avatar, Box, colors, Paper, Stack, Typography } from "@mui/material";
import { Shape } from "./types";
import { MultiLineTypography } from "@/components/common/multiline-typography";
import { grey } from "@mui/material/colors";
import { AnnotationShapeWithMetadata } from "./shapes-viewer";

interface ShapeTooltipProps {
  data: AnnotationShapeWithMetadata;
  x: number;
  y: number;
}

export function ShapeTooltip({ data, x, y }: ShapeTooltipProps) {
  const userColor = "red";
  return (
    <Paper
      elevation={2}
      sx={{
        position: "absolute",
        left: x + 10,
        top: y + 10,
        padding: 1,
        zIndex: 1000,
        pointerEvents: "none",
        borderRadius: 1,
        margin: 0,
        "&:hover": {
          filter: "brightness(85%)",
        },
        color: "white",
        maxWidth: 300,
        minWidth: 150,
        backgroundColor: grey[900],
        borderColor: grey[800],
        borderWidth: 1,
        borderStyle: "solid",
      }}
    >
      <Stack sx={{ py: 1 }} spacing={1}>
        <Box>
          <Stack direction={"row"} spacing={1} alignItems={"center"}>
            <Avatar
              sx={{
                background: data.metadata.color,
                width: 24,
                height: 24,
                borderWidth: 2,
                borderColor: data.metadata.color,
                borderStyle: "solid",
              }}
              src={""}
            >
              {data.metadata.initial}
            </Avatar>
            <Stack>
              <Typography component="span" color="white" variant="body2">
                {data.metadata.username}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <MultiLineTypography
          variant="caption"
          color="gray"
          lineLimit={1}
          text={data.metadata.text}
        />
      </Stack>
    </Paper>
  );
}
