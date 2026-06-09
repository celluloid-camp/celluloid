import { fetchPeerTubeVideoDownloadInfo } from "./video";

const result = await fetchPeerTubeVideoDownloadInfo({
  baseUrl: "https://celluloid.cloud",
  videoId: "i7149LBNzaPDCDZmAmq8ru",
});

console.log(result);
