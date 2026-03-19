export type Scene = {
  id: number;
  startTime: number;
  endTime: number;
  thumbnailPath: string;
};

export type ScenesResult = {
  outputDir: string;
  scenes: Scene[];
};
