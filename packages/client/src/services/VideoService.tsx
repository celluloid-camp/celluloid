import * as queryString from "query-string";
import { last } from "ramda";
import { PeertubeVideoInfo } from "types/YoutubeTypes";
import { PeerTubeVideo } from "@celluloid/types";

class VideoApi {
  static async getPeerTubeVideoData(
    videoUrl: string
  ): Promise<PeertubeVideoInfo> {
    var parsed = new URL(videoUrl);

    const host = parsed.host;
    const videoId = last(parsed.pathname.split("/"));

    const headers = {
      Accepts: "application/json",
    };

    const url = `https://${host}/api/v1/videos/${videoId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: new Headers(headers),
    });

    if (response.status === 200) {
      const data: PeerTubeVideo = await response.json();
      return {
        id: data.shortUUID,
        host,
        title: data.name,
        thumbnailUrl: `https://${host}${data.thumbnailPath}`,
      };
    }
    throw new Error(
      `Could not perform YouTube API request (error ${response.status})`
    );
  }

  static async getPeerTubeVideo(
    host:string,
    videoId: string,
  ): Promise<PeerTubeVideo> {
   
    const headers = {
      Accepts: "application/json",
    };

    const url = `https://${host}/api/v1/videos/${videoId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: new Headers(headers),
    });

    if (response.status === 200) {
      const data: PeerTubeVideo = await response.json();
      return data
    }
    throw new Error(
      `Could not perform YouTube API request (error ${response.status})`
    );
  }

}

export default VideoApi;
