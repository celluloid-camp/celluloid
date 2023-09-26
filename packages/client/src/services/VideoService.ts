import { PeerTubeVideo } from "@celluloid/types";
// import * as queryString from "query-string";
import { last } from "ramda";

export const getPeerTubeVideoData = async (
  url: string
): Promise<PeerTubeVideo[]> => {

  const parsed = new URL(url);
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
    return isPlaylist ? data.data.map((d) => d.video) : [data];

    // const data: PeerTubeVideo = await response.json();
    // return {
    //   id: data.shortUUID,
    //   host,
    //   title: data.name,
    //   thumbnailUrl: `https://${host}${data.thumbnailPath}`,
    // };
  }
  throw new Error(
    `Could not perform YouTube API request (error ${response.status})`
  );
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

    // const data: PeerTubeVideo = await response.json();
    // return {
    //   id: data.shortUUID,
    //   host,
    //   title: data.name,
    //   thumbnailUrl: `https://${host}${data.thumbnailPath}`,
    // };
  }
  throw new Error(
    `Could not perform YouTube API request (error ${response.status})`
  );
}


