export function getSpriteThumbnail(
  spriteUrl: string,
  spriteReference: string,
): string {
  if (spriteReference.includes("#xywh=")) {
    const coordsStr = spriteReference.split("#xywh=")[1];
    const [x, y, w, h] = coordsStr.split(",").map(Number);
    return `/api/sprite?url=${encodeURIComponent(spriteUrl)}&x=${x}&y=${y}&w=${w}&h=${h}`;
  }
  return "";
}
