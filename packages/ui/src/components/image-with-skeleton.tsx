import { type ComponentProps, useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { Skeleton } from "./skeleton";

export interface ImageWithSkeletonProps extends ComponentProps<"img"> {
  skeletonClassName?: string;
  containerClassName?: string;
}

export function ImageWithSkeleton({
  src,
  alt = "",
  className,
  skeletonClassName,
  containerClassName,
  onLoad,
  onError,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `src` is the trigger: reset the loaded state whenever the image changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div
      className={cn("relative overflow-hidden size-full", containerClassName)}
    >
      {!isLoaded && !hasError && (
        <Skeleton
          className={cn("absolute inset-0 z-0 size-full", skeletonClassName)}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={(e) => {
          setIsLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setHasError(true);
          onError?.(e);
        }}
        className={cn(
          className,
          "transition-opacity duration-300",
          !isLoaded ? "opacity-0" : "opacity-100",
        )}
        {...props}
      />
    </div>
  );
}
