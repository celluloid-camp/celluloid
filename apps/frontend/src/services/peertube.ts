import { PeerTubeVideo, Playlist } from "@celluloid/types";
// import * as queryString from "query-string";
import { last } from "ramda";


export type PeerTubeVideoWithThumbnail = PeerTubeVideo & {
  thumbnailURL: string;
  duration: number;
  metadata: JSON;
}

export type PeerTubeVideoDataResult = {
  videos: PeerTubeVideoWithThumbnail[];
  orignalURL: string;
  apiURL: string;
  isPlaylist: boolean;
  _raw: JSON
}

export const getPeerTubeVideoData = async (
  url: string
): Promise<PeerTubeVideoDataResult | null> => {

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch (e) {
    //throw new Error("Invalid URL provided.");
    return null;
  }

  const host = parsed.host;
  const videoId = last(parsed.pathname.split("/"));

  const headers = {
    Accepts: "application/json",
  };

  const isPlaylist = parsed.pathname.includes("/w/p");

  // https://p.lu/w/p/9d9CdgkCuFSemYQba1DW2u
  const apiUrl = isPlaylist ? `https://${host}/api/v1/video-playlists/${videoId}/videos` : `https://${host}/api/v1/videos/${videoId}`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: new Headers(headers),
  });

  if (response.status === 200) {
    const data = await response.json();

    console.log(data);
    return {
      isPlaylist,
      orignalURL: url,
      apiURL: apiUrl,
      videos: isPlaylist ? data.data.map((d: Playlist) => ({ ...d.video, duration: d.video.duration, thumbnailURL: `https://${host}${d.video.thumbnailPath}`, metadata: d.video })) : [{ ...data, duration: data.duration, thumbnailURL: `https://${host}${data.thumbnailPath}`, metadata: data }],
      _raw: data
    }
  } else {
    throw new Error(
      `Could not perform PeerTube API request (error ${response.status})`
    );
  }

}


export const getPeerTubeThumbnail = async (
  url: string
): Promise<string> => {

  const parsed = new URL(url);
  const host = parsed.host;
  const videoId = last(parsed.pathname.split("/"));

  const headers = {
    Accepts: "application/json",
  };

  // https://p.lu/w/p/9d9CdgkCuFSemYQba1DW2u
  const apiUrl = `https://${host}/api/v1/videos/${videoId}`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: new Headers(headers),
  });

  if (response.status === 200) {
    const data = await response.json();
    return data.thumbnailPath;
  }
  throw new Error(
    `Could not perform PeerTube API request (error ${response.status})`
  );
}


