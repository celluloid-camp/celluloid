import type { PeerTubeVideo } from "@celluloid/types";


export const getPeerTubeVideoData = async ({
  videoId,
  host
}: {
  videoId: string;
  host: string
}): Promise<PeerTubeVideo | null> => {


  const headers = {
    Accepts: "application/json",
  };

  const apiUrl = `https://${host}/api/v1/videos/${videoId}`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: new Headers(headers),
  });

  if (response.status === 200) {
    const data = await response.json();
    return data as PeerTubeVideo;
  }
  throw new Error(
    `Could not perform PeerTube API request (error ${response.status})`
  );

}
