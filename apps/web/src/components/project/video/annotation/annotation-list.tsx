import InfoIcon from "@mui/icons-material/Info";
import { Box, Grow, List, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AnnotationByProjectId, ProjectById } from "@/lib/trpc/types";

import { AnnotationForm } from "./form";
import { AnnotationItem } from "./annotation-item";
import type { User } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

const EmptyAnnotation = () => {
  const t = useTranslations();
  return (
    <Grow in={true}>
      <Stack
        spacing={1}
        alignContent={"center"}
        alignItems={"center"}
        sx={{
          paddingY: 5,
          paddingX: 5,
          borderRadius: 1,
          borderStyle: "dashed",
          borderWidth: 1,
          borderColor: grey[800],
          marginBottom: 1,
        }}
      >
        <InfoIcon sx={{ fontSize: 30, color: "gray" }} />
        <Typography variant="body2" color="gray" textAlign={"center"}>
          {t("project.annotaions.empty")}
        </Typography>
      </Stack>
    </Grow>
  );
};

interface AnnotationPanelProps {
  project: ProjectById;
  annotations: AnnotationByProjectId[];
  annotationCount: number;
  playerIsReady: boolean;
  user?: User;
}

export const AnnotationList: React.FC<
  Omit<AnnotationPanelProps, "annotationCount" | "onShowHintsClick">
> = ({ project, annotations = [], user, playerIsReady }) => {
  const containerRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);

  const [listHeight, setListHeight] = useState<number | "auto">("auto");

  const updateListHeight = useCallback(() => {
    if (containerRef.current && formRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const formHeight = formRef.current.offsetHeight + 20;
      setListHeight(containerHeight - formHeight);
    }
  }, []);

  useEffect(() => {
    updateListHeight();
  }, [playerIsReady]);

  useEffect(() => {
    // Initial calculation
    updateListHeight();

    // Listen to resize events
    const resizeObserver = new ResizeObserver(() => {
      updateListHeight();
    });

    if (formRef.current) {
      resizeObserver.observe(formRef.current);
    }

    return () => {
      if (formRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        resizeObserver.unobserve(formRef.current);
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
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

          // height: `${listHeight}px`,
          // maxHeight: `${listHeight}px`,
          // minHeight: 600,
          // maxHeight: 600,
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
