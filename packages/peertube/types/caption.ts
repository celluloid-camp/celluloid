export interface PeerTubeCaptionLanguage {
  id: "fr" | "en" | string;
  label: string;
}

export interface PeerTubeCaption {
  language: PeerTubeCaptionLanguage;
  automaticallyGenerated: boolean;
  captionPath?: string;
  fileUrl?: string;
  updatedAt: string;
}

export interface PeerTubeCaptionResponse {
  total: number;
  data: PeerTubeCaption[];
}
