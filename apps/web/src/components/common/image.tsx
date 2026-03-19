"use client";

import { Skeleton } from "@mui/material";
import NextImage from "next/image";
import { useEffect, useState } from "react";

interface ImageProps {
  src?: string | null;
  alt: string;
  sizes?: string;
}

export function Image({ src, alt, sizes }: ImageProps) {
  const [isLoading, setIsLoading] = useState(Boolean(src));
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setIsLoading(Boolean(src));
    setHasError(!src);
  }, [src]);

  if (hasError) {
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
