"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Normalized 0–1 coordinates (x, y, width, height) relative to the image viewport. */
export type ImageSpriteBbox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ImageSpriteProps = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  /** Draw a box overlay (e.g. detection bbox), normalized to the displayed image. */
  bbox?: ImageSpriteBbox | null;
  /** Classes for the bbox border (default: green ring). */
  bboxClassName?: string;
};

type LoadStatus = "loading" | "loaded" | "error";

/** Large enough for typical sprite sheets; `unoptimized` + `width/height: auto` keeps intrinsic sizing. */
const SPRITE_SHEET_MAX = 8192;

/**
 * Parses sprite URLs for cropping.
 * - `#xywh=x,y,w,h` (explicit Media Fragment)
 * - `#x,y,w,h` — same coords without `xywh=` (matches `getSpriteThumbnail` output:
 *   `${spriteUrl}#${coords}` → e.g. `.../sprite.png#960,0,160,90`)
 * - No crop: use URL without `#...` as `baseUrl` so `next/image` loads correctly
 *   (a raw `...png#960,0,160,90` would not match `#xywh=` and broke loading).
 */
function parseSpriteReference(source: string) {
  const normalizedSource = source.trim();
  if (!normalizedSource) {
    return {
      baseUrl: "",
      crop: null as null | { x: number; y: number; w: number; h: number },
    };
  }

  // Media Fragment: #xywh=x,y,w,h
  if (normalizedSource.includes("#xywh=")) {
    const [baseUrl, coords] = normalizedSource.split("#xywh=");
    if (!baseUrl || !coords) {
      return {
        baseUrl: normalizedSource.split("#")[0] ?? normalizedSource,
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

  // Short form: .../sprite.png#x,y,w,h (from getSpriteThumbnail: `${url}#${coords}`)
  const shortForm = normalizedSource.match(/^(.+)#(\d+),(\d+),(\d+),(\d+)$/);
  if (shortForm) {
    const baseUrl = shortForm[1];
    const x = Number(shortForm[2]);
    const y = Number(shortForm[3]);
    const w = Number(shortForm[4]);
    const h = Number(shortForm[5]);
    if (![x, y, w, h].some((n) => Number.isNaN(n) || n < 0) && w > 0 && h > 0) {
      return { baseUrl, crop: { x, y, w, h } };
    }
  }

  // Plain URL: strip fragment so Next/Image requests only the image resource
  const withoutHash = normalizedSource.split("#")[0] ?? normalizedSource;
  return {
    baseUrl: withoutHash,
    crop: null as null | { x: number; y: number; w: number; h: number },
  };
}

function BboxOverlay({
  bbox,
  bboxClassName,
}: {
  bbox: ImageSpriteBbox;
  bboxClassName?: string;
}) {
  const { x, y, width: w, height: h } = bbox;
  if (
    [x, y, w, h].some(
      (v) => typeof v !== "number" || !Number.isFinite(v) || v < 0,
    ) ||
    w === 0 ||
    h === 0
  ) {
    return null;
  }
  return (
    <div
      className={`pointer-events-none absolute z-20 box-border rounded-sm border-2 border-solid border-green-500 ${bboxClassName ?? ""}`}
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${w * 100}%`,
        height: `${h * 100}%`,
      }}
      aria-hidden
    />
  );
}

export function ImageSprite({
  src,
  width,
  height,
  alt = "sprite",
  className,
  style,
  onClick,
  bbox,
  bboxClassName,
}: ImageSpriteProps) {
  const { baseUrl, crop } = parseSpriteReference(src);
  const [status, setStatus] = useState<LoadStatus>(
    baseUrl ? "loading" : "error",
  );

  useEffect(() => {
    setStatus(baseUrl ? "loading" : "error");
  }, [baseUrl]);

  if (!baseUrl) {
    return (
      <Skeleton
        style={{ width, height }}
        className="relative z-10"
        role="img"
        aria-label={alt}
      />
    );
  }

  if (!crop) {
    return (
      <div
        className="relative inline-block"
        style={{ width, height }}
        onClick={onClick}
      >
        {status === "loading" && (
          <Skeleton
            className="pointer-events-none absolute inset-0 z-0 rounded-sm"
            aria-hidden
          />
        )}
        {status === "error" ? (
          <Skeleton
            style={{ width, height }}
            className="relative z-10"
            role="img"
            aria-label={alt}
          />
        ) : (
          <Image
            src={baseUrl}
            alt={alt}
            width={width}
            height={height}
            className={`relative z-10 transition-opacity duration-200 ${
              status === "loaded" ? "opacity-100" : "opacity-0"
            } ${className ?? ""}`}
            style={{
              objectFit: "cover",
              ...style,
            }}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
          />
        )}
        {bbox ? (
          <BboxOverlay bbox={bbox} bboxClassName={bboxClassName} />
        ) : null}
      </div>
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
      {status === "loading" && (
        <Skeleton
          className="pointer-events-none absolute inset-0 z-0 rounded-sm"
          aria-hidden
        />
      )}
      {status === "error" ? (
        <Skeleton
          style={{ width, height }}
          className="relative z-10"
          role="img"
          aria-label={alt}
        />
      ) : (
        <Image
          src={baseUrl}
          alt={alt}
          width={SPRITE_SHEET_MAX}
          height={SPRITE_SHEET_MAX}
          unoptimized
          className={`relative z-10 block max-w-none transition-opacity duration-200 ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          }`}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "auto",
            height: "auto",
            maxWidth: "none",
            transformOrigin: "top left",
            transform: `scale(${scaleX}, ${scaleY}) translate(${-crop.x}px, ${-crop.y}px)`,
          }}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
      {bbox ? <BboxOverlay bbox={bbox} bboxClassName={bboxClassName} /> : null}
    </div>
  );
}
