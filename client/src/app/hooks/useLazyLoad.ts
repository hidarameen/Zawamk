import { useEffect, useRef, useState } from "react";

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Hook للتحميل الكسول (Lazy Loading)
 * يحمل المحتوى فقط عندما يصبح مرئياً في viewport
 */
export function useLazyLoad<T extends HTMLElement>(
  options: UseLazyLoadOptions = {}
) {
  const { threshold = 0.1, rootMargin = "50px" } = options;
  const elementRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, hasLoaded]);

  return { elementRef, isVisible, hasLoaded };
}

/**
 * Hook لتحميل الصور بشكل كسول
 */
export function useLazyImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { elementRef, isVisible } = useLazyLoad<HTMLImageElement>();

  useEffect(() => {
    if (!isVisible) return;

    setIsLoading(true);
    setError(false);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isVisible]);

  return { elementRef, imageSrc, isLoading, error };
}

/**
 * Hook لتحميل المكونات بشكل كسول
 */
export function useLazyComponent() {
  const { elementRef, isVisible, hasLoaded } = useLazyLoad<HTMLDivElement>();

  return {
    elementRef,
    shouldRender: isVisible || hasLoaded,
  };
}
