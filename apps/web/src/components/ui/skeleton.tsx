import type { HTMLAttributes } from "react";

/**
 * shadcn/ui-style skeleton — pulse placeholder block.
 * @see https://ui.shadcn.com/docs/components/skeleton
 */
export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-(--gray-3) ${className}`}
      {...props}
    />
  );
}
