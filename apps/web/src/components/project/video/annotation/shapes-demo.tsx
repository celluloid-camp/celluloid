"use client";

import { Box, Button, Stack } from "@mui/material";
import React, { useState } from "react";
import { ShapesEditor } from "./shapes-editor";
import { useShapesStore } from "./shapes-store";
import { ShapesViewer } from "./shapes-viewer";

type Mode = "edit" | "view";

export function ShapesDemo() {
  const [mode, setMode] = useState<Mode>("edit");

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        margin: 0,
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: 1,
          borderRadius: 1,
        }}
      >
        <Button
          variant={mode === "edit" ? "contained" : "outlined"}
          onClick={() => setMode("edit")}
          disabled={mode === "edit"}
        >
          Edit
        </Button>
        <Button
          variant={mode === "view" ? "contained" : "outlined"}
          onClick={() => setMode("view")}
          disabled={mode === "view"}
        >
          View
        </Button>
      </Stack>

      {mode === "edit" ? <ShapesEditor /> : <ShapesViewer />}
    </Box>
  );
}
