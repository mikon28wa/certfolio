import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with lazy loading and error handling
 * - Uses Intersection Observer for lazy loading
 * - Shows skeleton while loading
 * - Falls back to placeholder on error
 * - Supports responsive images
 */
export function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  fallback = "/placeholder-image.svg",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before image enters viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const imageSrc = hasError ? fallback : src;
  const shouldLoad = isVisible;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <Skeleton
          className="absolute inset-0 w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      )}
      <img
        ref={imgRef}
        src={shouldLoad ? imageSrc : undefined}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
}
