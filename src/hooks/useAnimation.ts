import { useRef, useEffect, useCallback } from 'react';

interface AnimationConfig {
  duration: number;
  easing?: (t: number) => number;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

export const useAnimation = () => {
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const configRef = useRef<AnimationConfig>();

  // Función de easing por defecto (easeOutCubic)
  const defaultEasing = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  const cancelAnimation = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  }, []);

  const animate = useCallback((config: AnimationConfig) => {
    cancelAnimation();
    configRef.current = {
      ...config,
      easing: config.easing || defaultEasing
    };
    startTimeRef.current = performance.now();

    const animateFrame = (currentTime: number) => {
      if (!startTimeRef.current || !configRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const { duration, easing, onUpdate, onComplete } = configRef.current;
      
      let progress = Math.min(elapsed / duration, 1);

      if (easing) {
        progress = easing(progress);
      }

      onUpdate(progress);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animateFrame);
      } else {
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animateFrame);

    return cancelAnimation;
  }, [cancelAnimation]);

  // Limpiar la animación cuando el componente se desmonte
  useEffect(() => {
    return cancelAnimation;
  }, [cancelAnimation]);

  return {
    animate,
    cancelAnimation
  };
};

// Funciones de easing comunes
export const easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
}; 