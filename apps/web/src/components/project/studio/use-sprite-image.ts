import { useCallback, useEffect, useState } from "react";

export function useSpriteImage(spritePath: string) {

  const getSpriteThumbnail = useCallback(
    (spriteReference: string): string => {
      if (spriteReference.includes("#xywh=")) {
        const coordsStr = spriteReference.split("#xywh=")[1];
        const [x, y, w, h] = coordsStr.split(",").map(Number);
        return `/api/sprite?url=${encodeURIComponent(spritePath)}&x=${x}&y=${y}&w=${w}&h=${h}`;
      }
      return ""
    },
    [spritePath],
  );

  return { getSpriteThumbnail };
}
