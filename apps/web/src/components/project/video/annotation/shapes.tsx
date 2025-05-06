"use client";

import { Box } from "@mui/material";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Transformer,
  Line,
  Ellipse,
} from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { ShapeType, Toolbox } from "./toolbox";
import { Shape } from "./types";
import { useShapesStore } from "./shapes-store";

export function Annotator() {
  const [shapeType, setShapeType] = useState<ShapeType>("rect");
  const shapes = useShapesStore((state) => state.shapes);
  const addShape = useShapesStore((state) => state.addShape);
  const updateShapeStore = useShapesStore((state) => state.updateShape);
  const deleteShape = useShapesStore((state) => state.deleteShape);
  const deleteAllShapes = useShapesStore((state) => state.deleteAllShapes);
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

  // Memoize common props
  const commonProps = useMemo(
    () => ({
      stroke: "#FF6B6B",
      strokeWidth: 2,
      fill: "transparent",
      shadowColor: "black",
      shadowBlur: 5,
      shadowOpacity: 0.3,
      shadowOffset: { x: 2, y: 2 },
    }),
    [],
  );

  // Constants for minimum sizes
  const MIN_SIZE = useMemo(
    () => ({
      rect: { width: 20, height: 20 }, // minimum 20px
      circle: { radius: 10 }, // minimum 10px radius
      ellipse: { radiusX: 10, radiusY: 10 }, // minimum 10px radius
    }),
    [],
  );

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
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

  const handleMouseDown = useCallback(
    (e: any) => {
      if (shapes.length > 0) return;

      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const relX = pointer.x / dimensions.width;
      const relY = pointer.y / dimensions.height;

      if (shapeType === "polygon") {
        if (!drawing) {
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
          const firstPoint = [drawing.points![0], drawing.points![1]];
          const distance = Math.sqrt(
            Math.pow(pointer.x - firstPoint[0], 2) +
              Math.pow(pointer.y - firstPoint[1], 2),
          );
          if (distance < 10 && drawing.points!.length >= 6) {
            addShape(drawing);
            setDrawing(null);
            setCurrentPolygonPoints([]);
            setSelectedId(drawing.id);
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

      if (shapeType === "ellipse") {
        const newShape: Shape = {
          id: `shape-${Date.now()}`,
          type: "ellipse",
          x: relX,
          y: relY,
          radiusX: 0.001,
          radiusY: 0.001,
          stroke: "#FF6B6B",
          strokeWidth: 2,
        };
        setDrawing(newShape);
        return;
      }

      if (shapeType === "point") {
        const newShape: Shape = {
          id: `shape-${Date.now()}`,
          type: "point",
          x: relX,
          y: relY,
          stroke: "#FF6B6B",
          strokeWidth: 2,
        };
        addShape(newShape);
        setSelectedId(newShape.id);
        return;
      }

      if (shapeType === "rect") {
        const newShape: Shape = {
          id: `shape-${Date.now()}`,
          type: "rect",
          x: relX,
          y: relY,
          width: MIN_SIZE.rect.width / dimensions.width,
          height: MIN_SIZE.rect.height / dimensions.height,
          stroke: "#FF6B6B",
          strokeWidth: 2,
        };
        setDrawing(newShape);
        return;
      }

      if (shapeType === "circle") {
        const newShape: Shape = {
          id: `shape-${Date.now()}`,
          type: "circle",
          x: relX,
          y: relY,
          radius: MIN_SIZE.circle.radius / dimensions.width,
          stroke: "#FF6B6B",
          strokeWidth: 2,
        };
        setDrawing(newShape);
        return;
      }
    },
    [shapes.length, drawing, dimensions, shapeType, addShape],
  );

  const handleMouseMove = useCallback(
    (e: any) => {
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
        const minWidth = MIN_SIZE.rect.width / dimensions.width;
        const minHeight = MIN_SIZE.rect.height / dimensions.height;
        let width = Math.abs(deltaX);
        let height = Math.abs(deltaY);

        // If shift is pressed, make it a square
        if (e.evt.shiftKey) {
          const size = Math.max(width, height);
          width = size;
          height = size;
        }

        // Ensure minimum size
        width = Math.max(width, minWidth);
        height = Math.max(height, minHeight);

        updated.width = width;
        updated.height = height;

        // Adjust position to maintain minimum size when dragging in negative direction
        if (deltaX < 0) {
          updated.x = Math.min(relX, drawing.x - minWidth);
        }
        if (deltaY < 0) {
          updated.y = Math.min(relY, drawing.y - minHeight);
        }
      } else if (drawing.type === "circle") {
        const minRadius = MIN_SIZE.circle.radius / dimensions.width;
        updated.radius = Math.max(
          Math.sqrt(deltaX ** 2 + deltaY ** 2),
          minRadius,
        );
      } else if (drawing.type === "ellipse") {
        const minRadiusX = MIN_SIZE.ellipse.radiusX / dimensions.width;
        const minRadiusY = MIN_SIZE.ellipse.radiusY / dimensions.height;
        const radiusX = Math.max(Math.abs(deltaX), minRadiusX);
        const radiusY = Math.max(Math.abs(deltaY), minRadiusY);

        if (e.evt.shiftKey) {
          const radius = Math.max(radiusX, radiusY);
          updated.radiusX = radius;
          updated.radiusY = radius;
        } else {
          updated.radiusX = radiusX;
          updated.radiusY = radiusY;
        }
      }

      setDrawing(updated);
    },
    [drawing, dimensions, MIN_SIZE],
  );

  const handleMouseUp = useCallback(() => {
    if (!drawing) return;
    if (drawing.type === "polygon") return;

    addShape(drawing);
    setSelectedId(drawing.id);
    setDrawing(null);
  }, [drawing, addShape]);

  const handleStageDoubleClick = () => {
    if (drawing?.type === "polygon" && currentPolygonPoints.length >= 6) {
      addShape(drawing);
      setSelectedId(drawing.id);
      setDrawing(null);
      setCurrentPolygonPoints([]);
    }
  };

  const handleTransform = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const x = node.x();
      const y = node.y();

      if (!selectedId) return;

      const shape = shapes.find((s) => s.id === selectedId);
      if (!shape) return;

      if (shape.type === "rect") {
        const minWidth = MIN_SIZE.rect.width;
        const minHeight = MIN_SIZE.rect.height;
        let newWidth = Math.max(
          (shape.width || 0) * dimensions.width * scaleX,
          minWidth,
        );
        let newHeight = Math.max(
          (shape.height || 0) * dimensions.height * scaleY,
          minHeight,
        );

        // If shift is pressed, make it a square
        if (e.evt.shiftKey) {
          const size = Math.max(newWidth, newHeight);
          newWidth = size;
          newHeight = size;
        }

        updateShapeStore(selectedId, {
          x: x / dimensions.width,
          y: y / dimensions.height,
          width: newWidth / dimensions.width,
          height: newHeight / dimensions.height,
        });
      } else if (shape.type === "circle") {
        const minRadius = MIN_SIZE.circle.radius / dimensions.width;
        const newRadius = Math.max((shape.radius || 0) * scaleX, minRadius);

        updateShapeStore(selectedId, {
          x: shape.x,
          y: shape.y,
          radius: newRadius,
        });

        // Update the transformer size to match the new radius
        if (trRef.current) {
          const stage = node.getStage();
          if (!stage) return;

          const newWidth = newRadius * 2 * dimensions.width;
          trRef.current.nodes([node]);
          node.width(newWidth);
          node.height(newWidth);
          trRef.current.getLayer().batchDraw();
        }
      } else if (shape.type === "ellipse") {
        const minRadiusX = MIN_SIZE.ellipse.radiusX / dimensions.width;
        const minRadiusY = MIN_SIZE.ellipse.radiusY / dimensions.height;
        const newRadiusX = Math.max((shape.radiusX || 0) * scaleX, minRadiusX);
        const newRadiusY = Math.max((shape.radiusY || 0) * scaleY, minRadiusY);

        if (e.evt.shiftKey) {
          const radius = Math.max(newRadiusX, newRadiusY);
          updateShapeStore(selectedId, {
            x: shape.x,
            y: shape.y,
            radiusX: radius,
            radiusY: radius,
          });
        } else {
          updateShapeStore(selectedId, {
            x: shape.x,
            y: shape.y,
            radiusX: newRadiusX,
            radiusY: newRadiusY,
          });
        }

        if (trRef.current) {
          const stage = node.getStage();
          if (!stage) return;

          const newWidth = newRadiusX * 2 * dimensions.width;
          const newHeight = newRadiusY * 2 * dimensions.height;
          trRef.current.nodes([node]);
          node.width(newWidth);
          node.height(newHeight);
          trRef.current.getLayer().batchDraw();
        }
      }

      // Reset the transform
      node.scaleX(1);
      node.scaleY(1);
    },
    [selectedId, shapes, dimensions, MIN_SIZE, updateShapeStore],
  );

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

  const handleDeleteShape = useCallback(() => {
    if (selectedId) {
      deleteShape(selectedId);
      setSelectedId(null);
    } else {
      deleteAllShapes();
    }
  }, [selectedId, deleteShape, deleteAllShapes]);

  const handlePolygonVertexAdd = useCallback(
    (shape: Shape, pos: { x: number; y: number }) => {
      if (!shape.points) return;

      let minDist = Infinity;
      let insertIndex = -1;

      for (let i = 0; i < shape.points.length; i += 2) {
        const x1 = shape.points[i];
        const y1 = shape.points[i + 1];
        const x2 = shape.points[(i + 2) % shape.points.length];
        const y2 = shape.points[(i + 3) % shape.points.length];

        const A = pos.x - x1;
        const B = pos.y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
          xx = x1;
          yy = y1;
        } else if (param > 1) {
          xx = x2;
          yy = y2;
        } else {
          xx = x1 + param * C;
          yy = y1 + param * D;
        }

        const dx = pos.x - xx;
        const dy = pos.y - yy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist) {
          minDist = dist;
          insertIndex = i + 2;
        }
      }

      if (minDist < 10) {
        const closeToVertex = shape.points.some((_, index) => {
          if (index % 2 !== 0) return false;
          const dx = shape.points![index] - pos.x;
          const dy = shape.points![index + 1] - pos.y;
          return Math.sqrt(dx * dx + dy * dy) < 10;
        });

        if (!closeToVertex) {
          const newPoints = [...shape.points];
          newPoints.splice(insertIndex, 0, pos.x, pos.y);
          updateShapeStore(shape.id, { points: newPoints });
        }
      }
    },
    [updateShapeStore],
  );

  // Update the Transformer boundBoxFunc to enforce minimum size
  const transformerBoundBoxFunc = useCallback(
    (oldBox: any, newBox: any) => {
      const selectedShape = shapes.find((s) => s.id === selectedId);

      if (selectedShape?.type === "circle") {
        const minDiameter = MIN_SIZE.circle.radius * 2;
        const newWidth = Math.max(newBox.width, minDiameter);
        return {
          ...oldBox,
          width: newWidth,
          height: newWidth,
          x: oldBox.x,
          y: oldBox.y,
        };
      }

      if (selectedShape?.type === "ellipse") {
        const minWidth = MIN_SIZE.ellipse.radiusX * 2;
        const minHeight = MIN_SIZE.ellipse.radiusY * 2;
        const newWidth = Math.max(newBox.width, minWidth);
        const newHeight = Math.max(newBox.height, minHeight);
        return {
          ...oldBox,
          width: newWidth,
          height: newHeight,
          x: oldBox.x,
          y: oldBox.y,
        };
      }

      if (selectedShape?.type === "rect") {
        const minWidth = MIN_SIZE.rect.width;
        const minHeight = MIN_SIZE.rect.height;

        // If shift is pressed, make it a square
        if ((window.event as MouseEvent)?.shiftKey) {
          const size = Math.max(
            Math.max(newBox.width, minWidth),
            Math.max(newBox.height, minHeight),
          );
          return {
            ...newBox,
            width: size,
            height: size,
          };
        }

        // Enforce minimum size
        if (newBox.width < minWidth || newBox.height < minHeight) {
          return {
            ...oldBox,
            width: Math.max(oldBox.width, minWidth),
            height: Math.max(oldBox.height, minHeight),
          };
        }
      }

      const boundedX = Math.max(
        0,
        Math.min(newBox.x, dimensions.width - newBox.width),
      );
      const boundedY = Math.max(
        0,
        Math.min(newBox.y, dimensions.height - newBox.height),
      );
      const boundedWidth = Math.min(newBox.width, dimensions.width - boundedX);
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
    },
    [dimensions, MIN_SIZE, selectedId, shapes],
  );

  // Memoize the rendered shapes
  const renderedShapes = useMemo(
    () =>
      [...shapes, ...(drawing ? [drawing] : [])].map((shape) => {
        const x = shape.x * dimensions.width;
        const y = shape.y * dimensions.height;
        const isSelected = shape.id === selectedId;

        if (shape.type === "polygon") {
          const points = shape.points!;
          let livePoints = points;
          const drag = polygonDragState[shape.id];
          if (drag) {
            if (typeof drag.draggingPoint === "number") {
              const dx = (drag.lastX ?? drag.startX) - drag.startX;
              const dy = (drag.lastY ?? drag.startY) - drag.startY;
              livePoints = [...drag.startPoints];
              livePoints[drag.draggingPoint * 2] += dx;
              livePoints[drag.draggingPoint * 2 + 1] += dy;
            } else {
              const dx = (drag.lastX ?? drag.startX) - drag.startX;
              const dy = (drag.lastY ?? drag.startY) - drag.startY;
              livePoints = drag.startPoints.map((p, i) =>
                i % 2 === 0 ? p + dx : p + dy,
              );
            }
          }

          const xs = livePoints.filter((_, i) => i % 2 === 0);
          const ys = livePoints.filter((_, i) => i % 2 === 1);
          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          const maxX = Math.max(...xs);
          const maxY = Math.max(...ys);

          const insertPoint = (x: number, y: number) => {
            let minDist = Infinity;
            let insertIndex = -1;

            for (let i = 0; i < points.length; i += 2) {
              const x1 = points[i];
              const y1 = points[i + 1];
              const x2 = points[(i + 2) % points.length];
              const y2 = points[(i + 3) % points.length];

              const A = x - x1;
              const B = y - y1;
              const C = x2 - x1;
              const D = y2 - y1;

              const dot = A * C + B * D;
              const lenSq = C * C + D * D;
              let param = -1;

              if (lenSq !== 0) param = dot / lenSq;

              let xx, yy;

              if (param < 0) {
                xx = x1;
                yy = y1;
              } else if (param > 1) {
                xx = x2;
                yy = y2;
              } else {
                xx = x1 + param * C;
                yy = y1 + param * D;
              }

              const dx = x - xx;
              const dy = y - yy;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < minDist) {
                minDist = dist;
                insertIndex = i + 2;
              }
            }

            if (insertIndex !== -1) {
              const newPoints = [...points];
              newPoints.splice(insertIndex, 0, x, y);
              updateShapeStore(shape.id, {
                points: newPoints,
              });
            }
          };

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
              updateShapeStore(shape.id, {
                points: drag.startPoints.map((p, i) =>
                  i % 2 === 0 ? p + dx : p + dy,
                ),
              });
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
              />
              <Rect
                x={minX}
                y={minY}
                width={maxX - minX}
                height={maxY - minY}
                fill="rgba(0,0,0,0)"
                draggable={isSelected && selectedPointIndex === null}
                onMouseDown={() => setSelectedId(shape.id)}
                onDragStart={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grabbing";
                  handleDragStart(e);
                }}
                onDragMove={handleDragMove}
                onDragEnd={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grab";
                  handleDragEnd();
                }}
                onClick={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  const pos = stage.getPointerPosition();
                  if (!pos) return;

                  if (!isSelected) {
                    setSelectedId(shape.id);
                    return;
                  }

                  if (
                    selectedPointIndex !== null ||
                    polygonDragState[shape.id]
                  ) {
                    return;
                  }

                  handlePolygonVertexAdd(shape, pos);
                }}
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor =
                    isSelected && selectedPointIndex === null
                      ? "grab"
                      : "default";
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "default";
                }}
              />
              {(isSelected || shape === drawing) &&
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
                      draggable={isSelected}
                      onDragStart={(e) => {
                        if (!isSelected) return;
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
                        if (!isSelected) return;
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
                          updateShapeStore(shape.id, {
                            points: drag.startPoints.map((p, i) =>
                              i % 2 === 0 ? p + dx : p + dy,
                            ),
                          });
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
                        if (!isSelected) return;
                        setSelectedPointIndex(null);
                        setPolygonDragState((prev) => {
                          const updated = { ...prev };
                          delete updated[shape.id];
                          return updated;
                        });
                      }}
                      onMouseDown={(e) => {
                        if (!isSelected) return;
                        e.cancelBubble = true;
                        setSelectedPointIndex(pointIndex);
                      }}
                      onMouseUp={() => {
                        if (!isSelected) return;
                        setSelectedPointIndex(null);
                      }}
                      onDblClick={(e) => {
                        if (!isSelected) return;
                        e.cancelBubble = true;
                        if (points.length > 6) {
                          const newPoints = [...points];
                          newPoints.splice(pointIndex * 2, 2);
                          updateShapeStore(shape.id, {
                            points: newPoints,
                          });
                        }
                      }}
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
                onTransformEnd={handleTransform}
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grab";
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "default";
                }}
                onDragStart={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grabbing";
                }}
                onDragEnd={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grab";
                }}
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
                width={(shape.radius || 0) * 2 * dimensions.width}
                height={(shape.radius || 0) * 2 * dimensions.width}
                {...commonProps}
                draggable
                onClick={() => setSelectedId(shape.id)}
                onTap={() => setSelectedId(shape.id)}
                onTransformEnd={handleTransform}
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grab";
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "default";
                }}
                onDragStart={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grabbing";
                }}
                onDragEnd={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grab";
                }}
              />
            );
          case "ellipse":
            return (
              <Ellipse
                key={shape.id}
                id={shape.id}
                x={x}
                y={y}
                radiusX={(shape.radiusX || 0) * dimensions.width}
                radiusY={(shape.radiusY || 0) * dimensions.height}
                {...commonProps}
                draggable
                onClick={() => setSelectedId(shape.id)}
                onTap={() => setSelectedId(shape.id)}
                onTransformEnd={handleTransform}
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grab";
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "default";
                }}
                onDragStart={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grabbing";
                }}
                onDragEnd={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grab";
                }}
              />
            );
          case "point":
            return (
              <Circle
                key={shape.id}
                id={shape.id}
                x={x}
                y={y}
                radius={8}
                fill="#FF6B6B"
                stroke="white"
                strokeWidth={2}
                draggable
                onClick={() => setSelectedId(shape.id)}
                onTap={() => setSelectedId(shape.id)}
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grab";
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "default";
                }}
                onDragStart={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grabbing";
                }}
                onDragEnd={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  stage.container().style.cursor = "grab";

                  // Update the point's position after drag
                  const node = e.target;
                  updateShapeStore(shape.id, {
                    x: node.x() / dimensions.width,
                    y: node.y() / dimensions.height,
                  });
                }}
              />
            );
          default:
            return null;
        }
      }),
    [
      shapes,
      drawing,
      selectedId,
      dimensions,
      commonProps,
      handleTransform,
      polygonDragState,
      selectedPointIndex,
      setPolygonDragState,
      setSelectedPointIndex,
      handlePolygonVertexAdd,
      updateShapeStore,
    ],
  );

  const handleStageMouseEnter = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      if (shapes.length === 0 || drawing) {
        stage.container().style.cursor = "crosshair";
      } else {
        stage.container().style.cursor = "default";
      }
    },
    [shapes.length, drawing],
  );

  const handleStageMouseLeave = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      stage.container().style.cursor = "default";
    },
    [],
  );

  const setShapeTypeAndCursor = useCallback((type: ShapeType) => {
    setShapeType(type);
    setCurrentPolygonPoints([]);
    setDrawing(null);
    if (stageRef.current) {
      stageRef.current.container().style.cursor = "crosshair";
    }
  }, []);

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
      <Toolbox
        shapeType={shapeType}
        onShapeTypeChange={setShapeTypeAndCursor}
        onDelete={handleDeleteShape}
        hasSelectedShape={!!selectedId}
      />

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
        onMouseEnter={handleStageMouseEnter}
        onMouseLeave={handleStageMouseLeave}
      >
        <Layer>
          {renderedShapes}
          {selectedId &&
            shapes.find((s) => s.id === selectedId)?.type !== "polygon" &&
            shapes.find((s) => s.id === selectedId)?.type !== "point" && (
              <Transformer
                ref={trRef}
                rotateEnabled={false}
                boundBoxFunc={transformerBoundBoxFunc}
                borderStroke="#FF6B6B"
                anchorStroke="#FF6B6B"
                anchorFill="#fff"
                anchorSize={8}
                borderDash={[2, 2]}
                enabledAnchors={
                  shapes.find((s) => s.id === selectedId)?.type === "circle"
                    ? ["middle-right"]
                    : [
                        "top-left",
                        "top-center",
                        "top-right",
                        "middle-left",
                        "middle-right",
                        "bottom-left",
                        "bottom-center",
                        "bottom-right",
                      ]
                }
              />
            )}
        </Layer>
      </Stage>
    </Box>
  );
}
