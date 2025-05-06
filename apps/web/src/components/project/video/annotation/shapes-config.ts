export const SHAPE_STYLES = {
  common: {
    stroke: "#FF6B6B",
    strokeWidth: 2,
    fill: "transparent",
    shadowColor: "black",
    shadowBlur: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: 2 },
  },
  point: {
    radius: 8,
    fill: "#FF6B6B",
    stroke: "white",
    strokeWidth: 2,
  },
} as const;

export const MIN_SHAPE_SIZES = {
  rect: { width: 20, height: 20 },
  circle: { radius: 10 },
  ellipse: { radiusX: 10, radiusY: 10 },
} as const;

export const DEFAULT_DIMENSIONS = {
  width: 1440,
  height: 800,
} as const;

export const SHAPE_TYPES = {
  RECT: "rect",
  CIRCLE: "circle",
  ELLIPSE: "ellipse",
  POLYGON: "polygon",
  POINT: "point",
} as const;

export type ShapeType = typeof SHAPE_TYPES[keyof typeof SHAPE_TYPES];
