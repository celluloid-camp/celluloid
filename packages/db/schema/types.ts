export type ShapeType = "rect" | "circle" | "polygon" | "ellipse" | "point";

export type AnnotationShape = {
  id: string;
  type: "point" | "rect" | "circle" | "ellipse" | "polygon";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  radiusX?: number;
  radiusY?: number;
  sides?: number;
  stroke?: string;
  strokeWidth?: number;
  points?: number[];
};
