"use client";
import { Box, List } from "@mui/material";
import type * as React from "react";

import type { AnnotationByProjectId, ProjectById } from "@/lib/trpc/types";

import type { User } from "@/lib/auth-client";
import { AnnotationItem } from "./annotation-item";
import { EmptyAnnotation } from "./empty";
import { AnnotationForm } from "./form";

interface AnnotationPanelProps {
  project: ProjectById;
  annotations: AnnotationByProjectId[];
  user?: User;
}

export const AnnotationList: React.FC<
  Omit<AnnotationPanelProps, "annotationCount" | "onShowHintsClick">
> = ({ project, annotations = [], user }) => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <List
        dense={true}
        sx={{
          flex: 1,
          overflow: "auto",
          paddingX: 2,
          position: "relative",
          "& ul": { padding: 0 },
        }}
      >
        {annotations.map((annotation: AnnotationByProjectId) => (
          <AnnotationItem
            annotation={annotation}
            key={annotation.id}
            user={user}
            project={project}
          />
        ))}

        {annotations.length === 0 && <EmptyAnnotation />}
      </List>

      <Box display={"flex"} flexDirection={"column"}>
        {project.annotable && user ? (
          <AnnotationForm
            duration={project.duration}
            project={project}
            user={user}
          />
        ) : null}
      </Box>
    </Box>
  );
};
