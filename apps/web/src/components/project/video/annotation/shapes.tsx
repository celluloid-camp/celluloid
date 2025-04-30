"use client";

import { Box, IconButton, Tooltip } from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  RegularPolygon,
  Transformer,
  Line,
} from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import DeleteIcon from "@mui/icons-material/Delete";
import SquareIcon from "@mui/icons-material/Square";
import CircleIcon from "@mui/icons-material/Circle";
import PentagonIcon from "@mui/icons-material/Pentagon";

type ShapeType = "rect" | "circle" | "polygon";

interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  sides?: number;
  stroke: string;
  strokeWidth: number;
  points?: number[];
}

export function Annotator() {
  const [shapeType, setShapeType] = useState<ShapeType>("rect");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [drawing, setDrawing] = useState<Shape | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPolygonPoints, setCurrentPolygonPoints] = useState<number[]>(
    [],
  );
  const [dimensions, setDimensions] = useState({ width: 1440, height: 800 });
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    null,
  );
  const [polygonDragState, setPolygonDragState] = useState<{
    [id: string]: {
      startX: number;
      startY: number;
      startPoints: number[];
      draggingPoint?: number;
      lastX?: number;
      lastY?: number;
    };
  }>({});

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    // Use ResizeObserver for container, not window resize
    const observer = new window.ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      observer.disconnect();
    };
  }, []);

  const handleMouseDown = (e: any) => {
    if (shapes.length > 0) return;

    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const relX = pointer.x / dimensions.width;
    const relY = pointer.y / dimensions.height;

    if (shapeType === "polygon") {
      if (!drawing) {
        // Start new polygon: points in absolute canvas coordinates
        const newShape: Shape = {
          id: `shape-${Date.now()}`,
          type: "polygon",
          x: 0,
          y: 0,
          stroke: "#FF6B6B",
          strokeWidth: 2,
          points: [pointer.x, pointer.y],
        };
        setDrawing(newShape);
        setCurrentPolygonPoints([pointer.x, pointer.y]);
      } else {
        // Add new point in absolute canvas coordinates
        // Check if click is near first point (within 10 pixels)
        const firstPoint = [drawing.points![0], drawing.points![1]];
        const distance = Math.sqrt(
          Math.pow(pointer.x - firstPoint[0], 2) +
            Math.pow(pointer.y - firstPoint[1], 2),
        );
        if (distance < 10 && drawing.points!.length >= 6) {
          // Close the polygon
          setShapes((prev) => [...prev, drawing]);
          setDrawing(null);
          setCurrentPolygonPoints([]);
        } else {
          setCurrentPolygonPoints((prev) => [...prev, pointer.x, pointer.y]);
          setDrawing((prev) =>
            prev
              ? { ...prev, points: [...prev.points!, pointer.x, pointer.y] }
              : null,
          );
        }
      }
      return;
    }

    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type: shapeType,
      x: relX,
      y: relY,
      stroke: "#FF6B6B",
      strokeWidth: 2,
      ...(shapeType === "circle" && { radius: 0.001 }),
      ...(shapeType === "rect" && { width: 0.001, height: 0.001 }),
    };

    setDrawing(newShape);
  };

  const handleMouseMove = (e: any) => {
    if (!drawing) return;
    if (drawing.type === "polygon") return;

    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const relX = pointer.x / dimensions.width;
    const relY = pointer.y / dimensions.height;

    const deltaX = relX - drawing.x;
    const deltaY = relY - drawing.y;

    const updated: Shape = { ...drawing };

    if (drawing.type === "rect") {
      updated.width = Math.abs(deltaX);
      updated.height = Math.abs(deltaY);
      updated.x = deltaX < 0 ? relX : drawing.x;
      updated.y = deltaY < 0 ? relY : drawing.y;
    } else if (drawing.type === "circle") {
      updated.radius = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    }

    setDrawing(updated);
  };

  const handleMouseUp = () => {
    if (!drawing) return;
    if (drawing.type === "polygon") return;

    setShapes((prev) => [...prev, drawing]);
    setSelectedId(drawing.id);
    setDrawing(null);
  };

  const handleStageDoubleClick = () => {
    if (drawing?.type === "polygon" && currentPolygonPoints.length >= 6) {
      setShapes((prev) => [...prev, drawing]);
      setSelectedId(drawing.id);
      setDrawing(null);
      setCurrentPolygonPoints([]);
    }
  };

  const handleTransform = (e: KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const x = node.x();
    const y = node.y();

    if (!selectedId) return;

    const shape = shapes.find((s) => s.id === selectedId);
    if (!shape) return;

    if (shape.type === "rect") {
      updateShape(selectedId, {
        x: x / dimensions.width,
        y: y / dimensions.height,
        width: (shape.width || 0) * scaleX,
        height: (shape.height || 0) * scaleY,
      });
    } else if (shape.type === "circle") {
      updateShape(selectedId, {
        x: x / dimensions.width,
        y: y / dimensions.height,
        radius: (shape.radius || 0) * scaleX,
      });
    }

    // Reset the transform
    node.scaleX(1);
    node.scaleY(1);
  };

  const updateShape = (id: string, updates: Partial<Shape>) => {
    setShapes((prev) =>
      prev.map((shape) => {
        if (shape.id !== id) return shape;
        return { ...shape, ...updates };
      }),
    );
  };

  // Attach transformer to selected shape
  useEffect(() => {
    if (trRef.current && selectedId) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, shapes]);

  const handleDeleteShape = () => {
    if (!selectedId) return;
    setShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
    setSelectedId(null);
  };

  return (
    <Box
      ref={containerRef}
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
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: 1,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Tooltip title="Rectangle">
          <IconButton
            onClick={() => {
              setShapeType("rect");
              setCurrentPolygonPoints([]);
              setDrawing(null);
            }}
            color={shapeType === "rect" ? "primary" : "default"}
          >
            <SquareIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Circle">
          <IconButton
            onClick={() => {
              setShapeType("circle");
              setCurrentPolygonPoints([]);
              setDrawing(null);
            }}
            color={shapeType === "circle" ? "primary" : "default"}
          >
            <CircleIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Polygon">
          <IconButton
            onClick={() => {
              setShapeType("polygon");
              setCurrentPolygonPoints([]);
              setDrawing(null);
            }}
            color={shapeType === "polygon" ? "primary" : "default"}
          >
            <PentagonIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Selected">
          <IconButton
            onClick={handleDeleteShape}
            disabled={!selectedId}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedId(null);
            setSelectedPointIndex(null);
          }
          handleMouseDown(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleStageDoubleClick}
      >
        <Layer>
          {[...shapes, ...(drawing ? [drawing] : [])].map((shape) => {
            const x = shape.x * dimensions.width;
            const y = shape.y * dimensions.height;
            const isSelected = shape.id === selectedId;

            const commonProps = {
              stroke: shape.stroke,
              strokeWidth: shape.strokeWidth,
              fill: "transparent",
              shadowColor: "black",
              shadowBlur: 5,
              shadowOpacity: 0.3,
              shadowOffset: { x: 2, y: 2 },
            };

            if (shape.type === "polygon") {
              const points = shape.points!;
              const isPolygonDraggable =
                isSelected && selectedPointIndex === null;

              // Compute live points for bounding box (use drag state if dragging)
              let livePoints = points;
              const drag = polygonDragState[shape.id];
              if (drag) {
                if (typeof drag.draggingPoint === "number") {
                  // If dragging a point, update only that point
                  const dx = (drag.lastX ?? drag.startX) - drag.startX;
                  const dy = (drag.lastY ?? drag.startY) - drag.startY;
                  livePoints = [...drag.startPoints];
                  livePoints[drag.draggingPoint * 2] += dx;
                  livePoints[drag.draggingPoint * 2 + 1] += dy;
                } else {
                  // If dragging the whole polygon, update all points
                  const dx = (drag.lastX ?? drag.startX) - drag.startX;
                  const dy = (drag.lastY ?? drag.startY) - drag.startY;
                  livePoints = drag.startPoints.map((p, i) =>
                    i % 2 === 0 ? p + dx : p + dy,
                  );
                }
              }

              // Compute bounding box for drag handle and selection
              const xs = livePoints.filter((_, i) => i % 2 === 0);
              const ys = livePoints.filter((_, i) => i % 2 === 1);
              const minX = Math.min(...xs);
              const minY = Math.min(...ys);
              const maxX = Math.max(...xs);
              const maxY = Math.max(...ys);

              const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
                if (selectedPointIndex !== null) return;
                const stage = e.target.getStage();
                if (!stage) return;
                const pos = stage.getPointerPosition();
                if (!pos) return;
                setPolygonDragState((prev) => ({
                  ...prev,
                  [shape.id]: {
                    startX: pos.x,
                    startY: pos.y,
                    startPoints: [...points],
                    draggingPoint: undefined,
                  },
                }));
              };

              const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
                if (selectedPointIndex !== null) return;
                const stage = e.target.getStage();
                if (!stage) return;
                const pos = stage.getPointerPosition();
                if (!pos) return;
                setPolygonDragState((prev) => {
                  const drag = prev[shape.id];
                  if (!drag) return prev;
                  const dx = pos.x - drag.startX;
                  const dy = pos.y - drag.startY;
                  setShapes((shapes) =>
                    shapes.map((s) => {
                      if (s.id !== shape.id || !s.points) return s;
                      const newPoints = drag.startPoints.map((p, i) =>
                        i % 2 === 0 ? p + dx : p + dy,
                      );
                      return { ...s, points: newPoints };
                    }),
                  );
                  return {
                    ...prev,
                    [shape.id]: {
                      ...drag,
                      lastX: pos.x,
                      lastY: pos.y,
                    },
                  };
                });
              };

              const handleDragEnd = () => {
                setPolygonDragState((prev) => {
                  const updated = { ...prev };
                  delete updated[shape.id];
                  return updated;
                });
              };

              return (
                <React.Fragment key={shape.id}>
                  <Line
                    id={shape.id}
                    points={points}
                    closed={shape === drawing ? false : true}
                    {...commonProps}
                    onClick={() => setSelectedId(shape.id)}
                    onTap={() => setSelectedId(shape.id)}
                  />
                  <Rect
                    x={minX}
                    y={minY}
                    width={maxX - minX}
                    height={maxY - minY}
                    fill="rgba(0,0,0,0)"
                    draggable={isSelected && selectedPointIndex === null}
                    onMouseDown={() => setSelectedId(shape.id)}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedId(shape.id)}
                    onTap={() => setSelectedId(shape.id)}
                  />
                  {isSelected && shape.type === "polygon" && (
                    <Rect
                      x={minX}
                      y={minY}
                      width={maxX - minX}
                      height={maxY - minY}
                      stroke="#FF6B6B"
                      dash={[4, 4]}
                      listening={false}
                    />
                  )}
                  {isSelected &&
                    points.map((_, index) => {
                      if (index % 2 !== 0) return null;
                      const pointIndex = index / 2;
                      return (
                        <Circle
                          key={index}
                          x={points[index]}
                          y={points[index + 1]}
                          radius={6}
                          fill="#FF6B6B"
                          stroke="white"
                          strokeWidth={2}
                          draggable
                          onDragStart={(e) => {
                            const stage = e.target.getStage();
                            if (!stage) return;
                            const pos = stage.getPointerPosition();
                            if (!pos) return;
                            setSelectedPointIndex(pointIndex);
                            setPolygonDragState((prev) => ({
                              ...prev,
                              [shape.id]: {
                                startX: pos.x,
                                startY: pos.y,
                                startPoints: [...points],
                                draggingPoint: pointIndex,
                              },
                            }));
                          }}
                          onDragMove={(e) => {
                            const stage = e.target.getStage();
                            if (!stage) return;
                            const pos = stage.getPointerPosition();
                            if (!pos) return;
                            setPolygonDragState((prev) => {
                              const drag = prev[shape.id];
                              if (!drag || drag.draggingPoint !== pointIndex)
                                return prev;
                              const dx = pos.x - drag.startX;
                              const dy = pos.y - drag.startY;
                              setShapes((shapes) =>
                                shapes.map((s) => {
                                  if (s.id !== shape.id || !s.points) return s;
                                  const newPoints = [...drag.startPoints];
                                  newPoints[pointIndex * 2] =
                                    drag.startPoints[pointIndex * 2] + dx;
                                  newPoints[pointIndex * 2 + 1] =
                                    drag.startPoints[pointIndex * 2 + 1] + dy;
                                  return { ...s, points: newPoints };
                                }),
                              );
                              return {
                                ...prev,
                                [shape.id]: {
                                  ...drag,
                                  lastX: pos.x,
                                  lastY: pos.y,
                                },
                              };
                            });
                          }}
                          onDragEnd={() => {
                            setSelectedPointIndex(null);
                            setPolygonDragState((prev) => {
                              const updated = { ...prev };
                              delete updated[shape.id];
                              return updated;
                            });
                          }}
                          onMouseDown={(e) => {
                            e.cancelBubble = true;
                            setSelectedPointIndex(pointIndex);
                          }}
                          onMouseUp={() => setSelectedPointIndex(null)}
                        />
                      );
                    })}
                </React.Fragment>
              );
            }

            switch (shape.type) {
              case "rect":
                return (
                  <Rect
                    key={shape.id}
                    id={shape.id}
                    x={x}
                    y={y}
                    width={(shape.width || 0) * dimensions.width}
                    height={(shape.height || 0) * dimensions.height}
                    {...commonProps}
                    draggable
                    onClick={() => setSelectedId(shape.id)}
                    onTap={() => setSelectedId(shape.id)}
                    onTransformEnd={(e) => handleTransform(e)}
                  />
                );
              case "circle":
                return (
                  <Circle
                    key={shape.id}
                    id={shape.id}
                    x={x}
                    y={y}
                    radius={(shape.radius || 0) * dimensions.width}
                    {...commonProps}
                    draggable
                    onClick={() => setSelectedId(shape.id)}
                    onTap={() => setSelectedId(shape.id)}
                    onTransformEnd={(e) => handleTransform(e)}
                  />
                );
              default:
                return null;
            }
          })}
          {selectedId && (
            <Transformer
              ref={trRef}
              rotateEnabled={false}
              enabledAnchors={
                shapes.find((s) => s.id === selectedId)?.type === "polygon"
                  ? []
                  : undefined
              }
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                const boundedX = Math.max(
                  0,
                  Math.min(newBox.x, dimensions.width - newBox.width),
                );
                const boundedY = Math.max(
                  0,
                  Math.min(newBox.y, dimensions.height - newBox.height),
                );
                const boundedWidth = Math.min(
                  newBox.width,
                  dimensions.width - boundedX,
                );
                const boundedHeight = Math.min(
                  newBox.height,
                  dimensions.height - boundedY,
                );

                return {
                  ...newBox,
                  x: boundedX,
                  y: boundedY,
                  width: boundedWidth,
                  height: boundedHeight,
                };
              }}
              borderStroke="#FF6B6B"
              anchorStroke="#FF6B6B"
              anchorFill="#fff"
              anchorSize={8}
              borderDash={[2, 2]}
            />
          )}
        </Layer>
      </Stage>
    </Box>
  );
}
