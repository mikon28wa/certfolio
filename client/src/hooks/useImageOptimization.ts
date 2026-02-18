import { useState, useEffect } from "react";

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

/**
 * Hook for optimizing images before upload
 * - Resizes images to max dimensions
 * - Compresses images to target quality
 * - Converts to optimal format (WebP when supported)
 * - Returns optimized blob and data URL
 */
export function useImageOptimization() {
  const [isProcessing, setIsProcessing] = useState(false);

  const optimizeImage = async (
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<{ blob: Blob; dataUrl: string; originalSize: number; optimizedSize: number }> => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85,
      format = "webp",
    } = options;

    setIsProcessing(true);

    try {
      // Load image
      const img = await loadImage(file);

      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas and draw resized image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      const mimeType = format === "webp" ? "image/webp" : `image/${format}`;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Failed to create blob"));
          },
          mimeType,
          quality
        );
      });

      // Create data URL for preview
      const dataUrl = canvas.toDataURL(mimeType, quality);

      return {
        blob,
        dataUrl,
        originalSize: file.size,
        optimizedSize: blob.size,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return { optimizeImage, isProcessing };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Hook for caching images in memory
 * - Stores data URLs in memory for quick access
 * - Automatically cleans up old entries
 */
export function useImageCache(maxSize: number = 50) {
  const [cache] = useState<Map<string, string>>(new Map());

  const getCachedImage = (key: string): string | undefined => {
    return cache.get(key);
  };

  const setCachedImage = (key: string, dataUrl: string) => {
    // Remove oldest entry if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(key, dataUrl);
  };

  const clearCache = () => {
    cache.clear();
  };

  return { getCachedImage, setCachedImage, clearCache };
}
