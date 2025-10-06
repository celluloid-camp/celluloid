import { DetectionResultsModel } from "./generated/models";

declare global {
  // biome-ignore lint/style/noNamespace: used for prisma
  namespace PrismaJson {

    type VisionProcessing = DetectionResultsModel

  }
}

// The file MUST be a module!
export { };
