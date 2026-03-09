import { z } from "zod";

export const ShapeTypeSchema = z.enum([
  "rect",
  "circle",
  "polygon",
  "ellipse",
  "point",
]);

export type ShapeType = z.infer<typeof ShapeTypeSchema>;

export const AnnotationShapeSchema = z.object({
  id: z.string(),
  type: ShapeTypeSchema,
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  radiusX: z.number().optional(),
  radiusY: z.number().optional(),
  sides: z.number().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  points: z.array(z.number()).optional(),
});

export type AnnotationShape = z.infer<typeof AnnotationShapeSchema>;
