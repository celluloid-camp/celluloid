declare global {
  // biome-ignore lint/style/noNamespace: used for prisma
  namespace PrismaJson {
    type AnnotationShape = {
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

      //old fields
      relativeX?: number;
      relativeY?: number;
      // parentWidth?: number;
      // parentHeight?: number;
    };
  }
}

// The file MUST be a module!
export {};
