
export interface PeerTubeVideo {
  id: number;
  uuid: string;
  shortUUID: string;
  url: string;
  name: string;
  category: Category;
  licence: Category;
  language: Language;
  privacy: Category;
  nsfw: boolean;
  description: string;
  isLocal: boolean;
  duration: number;
  views: number;
  viewers: number;
  likes: number;
  dislikes: number;
  thumbnailPath: string;
  previewPath: string;
  embedPath: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  originallyPublishedAt: Date;
  isLive: boolean;
  account: Account;
  channel: Account;
  blacklisted: boolean;
  blacklistedReason: null;
  streamingPlaylists: StreamingPlaylist[];
  files: File[];
  support: string;
  descriptionPath: string;
  tags: string[];
  commentsEnabled: boolean;
  downloadEnabled: boolean;
  waitTranscoding: boolean;
  state: Category;
  trackerUrls: string[];
}

interface Account {
  url: string;
  name: string;
  host: string;
  avatars: Avatar[];
  avatar: Avatar;
  id: number;
  followingCount: number;
  followersCount: number;
  createdAt: Date;
  banners: Record<string, unknown>;
  displayName: string;
  description: string;
  updatedAt: Date;
  support?: string;
  isLocal?: boolean;
  ownerAccount?: Account;
}

interface Avatar {
  width: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: number;
  label: string;
}

interface File {
  id: number;
  resolution: Category;
  magnetUri: string;
  size: number;
  fps: number;
  torrentUrl: string;
  torrentDownloadUrl: string;
  fileUrl: string;
  fileDownloadUrl: string;
  metadataUrl: string;
}

interface Language {
  id: string;
  label: string;
}

interface StreamingPlaylist {
  id: number;
  type: number;
  playlistUrl: string;
  segmentsSha256Url: string;
  redundancies: Record<string, unknown>
  files: File[];
}



export interface Playlist {
  id: number
  position: number
  startTimestamp: number | null
  stopTimestamp: number | null
  type: number
  video: PeerTubeVideo
}
