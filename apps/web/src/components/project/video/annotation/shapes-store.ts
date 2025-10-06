import { AnnotationShape } from "@celluloid/prisma";
import { create } from "zustand";
import { Shape } from "./types";

interface ShapesState {
  shapes: AnnotationShape[];
  init: (shapes: AnnotationShape[]) => void;
  addShape: (shape: AnnotationShape) => void;
  updateShape: (id: string, updates: Partial<AnnotationShape>) => void;
  deleteShape: (id: string) => void;
  reset: () => void;
}

export const useShapesStore = create<ShapesState>((set) => ({
  shapes: [],
  init: (shapes) => set({ shapes }),
  addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
  updateShape: (id, updates) =>
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape,
      ),
    })),
  deleteShape: (id) =>
    set((state) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
    })),
  reset: () => set({ shapes: [] }),
}));
