export function getSpriteThumbnail(
  spriteUrl: string,
  spriteReference: string,
): string {
  if (spriteReference.includes("#xywh=")) {
    const coordsStr = spriteReference.split("#xywh=")[1];
    return `${spriteUrl}#${coordsStr}`;
  }
  return "";
}
