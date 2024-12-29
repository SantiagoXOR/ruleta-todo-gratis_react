import { useState, useEffect, useCallback, useRef } from 'react';

interface LazyImageOptions {
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const useLazyImage = (
  src: string,
  placeholderSrc?: string,
  options: LazyImageOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    onLoad,
    onError,
  } = options;

  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Cargar imagen cuando sea visible
  const loadImage = useCallback((imageUrl: string) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        setCurrentSrc(imageUrl);
        setIsLoading(false);
        onLoad?.();
        resolve();
      };

      img.onerror = () => {
        const error = new Error(`Failed to load image: ${imageUrl}`);
        setError(error);
        setIsLoading(false);
        onError?.(error);
        reject(error);
      };

      img.src = imageUrl;
    });
  }, [onLoad, onError]);

  // Configurar intersection observer
  useEffect(() => {
    if (!src || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(src).catch(() => {
              // Error ya manejado en loadImage
            });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;
    observer.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, threshold, rootMargin, loadImage]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Reintentar carga en caso de error
  const retry = useCallback(() => {
    if (!src) return;

    setError(null);
    setIsLoading(true);
    loadImage(src).catch(() => {
      // Error ya manejado en loadImage
    });
  }, [src, loadImage]);

  // Precargar imagen
  const preload = useCallback(() => {
    if (!src || currentSrc === src) return;
    loadImage(src).catch(() => {
      // Error ya manejado en loadImage
    });
  }, [src, currentSrc, loadImage]);

  return {
    imgRef,
    currentSrc,
    isLoading,
    error,
    retry,
    preload,
    // Props para el elemento img
    imgProps: {
      ref: imgRef,
      src: currentSrc || placeholderSrc,
      alt: '', // El alt debe ser proporcionado por el componente padre
    },
  };
};
