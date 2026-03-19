import type { CSSProperties } from "react";

type ImageSpriteProps = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
};

function parseSpriteReference(source: string) {
  const normalizedSource = source.trim();
  if (!normalizedSource) {
    return {
      baseUrl: "",
      crop: null as null | { x: number; y: number; w: number; h: number },
    };
  }

  if (!normalizedSource.includes("#xywh=")) {
    return {
      baseUrl: normalizedSource,
      crop: null as null | { x: number; y: number; w: number; h: number },
    };
  }

  const [baseUrl, coords] = normalizedSource.split("#xywh=");
  if (!baseUrl || !coords) {
    return {
      baseUrl: normalizedSource,
      crop: null as null | { x: number; y: number; w: number; h: number },
    };
  }

  const [x, y, w, h] = coords.split(",").map((value) => Number(value));
  if (
    [x, y, w, h].some((value) => Number.isNaN(value) || value < 0) ||
    w === 0 ||
    h === 0
  ) {
    return {
      baseUrl,
      crop: null as null | { x: number; y: number; w: number; h: number },
    };
  }

  return { baseUrl, crop: { x, y, w, h } };
}

export function ImageSprite({
  src,
  width,
  height,
  alt = "sprite",
  className,
  style,
  onClick,
}: ImageSpriteProps) {
  const { baseUrl, crop } = parseSpriteReference(src);

  if (!crop) {
    return (
      <img
        src={baseUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{
          objectFit: "cover",
          ...style,
        }}
        onClick={onClick}
      />
    );
  }

  const scaleX = width / crop.w;
  const scaleY = height / crop.h;

  return (
    <div
      className={className}
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
      onClick={onClick}
    >
      <img
        src={baseUrl}
        alt={alt}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "top left",
          // Apply translation in source space, then scale to viewport.
          transform: `scale(${scaleX}, ${scaleY}) translate(${-crop.x}px, ${-crop.y}px)`,
          maxWidth: "none",
          display: "block",
        }}
      />
    </div>
  );
}
