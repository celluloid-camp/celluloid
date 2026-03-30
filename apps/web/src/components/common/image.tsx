"use client";

import { Skeleton } from "@mui/material";
import NextImage from "next/image";
import { type ReactNode, useEffect, useState } from "react";

interface ImageProps {
  src?: string | null;
  alt: string;
  sizes?: string;
  /** Shown when the image fails to load or `src` is missing (replaces the default skeleton). */
  errorPlaceholder?: ReactNode;
}

export function Image({ src, alt, sizes, errorPlaceholder }: ImageProps) {
  const [isLoading, setIsLoading] = useState(Boolean(src));
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setIsLoading(Boolean(src));
    setHasError(!src);
  }, [src]);

  if (hasError) {
    if (errorPlaceholder != null) {
      return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[inherit]">
          {errorPlaceholder}
        </div>
      );
    }
    return (
      <Skeleton
        variant="rectangular"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          borderRadius: 2,
        }}
      />
    );
  }

  return (
    <>
      {isLoading ? (
        <Skeleton
          variant="rectangular"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            borderRadius: 2,
            zIndex: 1,
          }}
        />
      ) : null}
      <NextImage
        src={src as string}
        alt={alt}
        fill
        loading="lazy"
        sizes={
          sizes ?? "(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
        }
        style={{ objectFit: "cover" }}
        onLoad={() => {
          setIsLoading(false);
        }}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </>
  );
}
