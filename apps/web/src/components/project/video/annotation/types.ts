import { ShapeType } from "./toolbox";

export interface Shape {
  id: string;
  type: ShapeType;
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
}
