import { useState, useEffect, useCallback, useRef } from 'react';

interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

interface VirtualItem<T> {
  index: number;
  item: T;
  style: {
    position: 'absolute';
    top: number;
    left: 0;
    width: '100%';
    height: number;
  };
}

export const useVirtualList = <T>(
  items: T[],
  options: VirtualListOptions
) => {
  const {
    itemHeight,
    overscan = 3,
    onEndReached,
    endReachedThreshold = 0.8,
  } = options;

  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const ticking = useRef(false);

  // Calcular el rango visible
  const getVisibleRange = useCallback(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const overscanCount = overscan * 2;
    
    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, start + visibleCount + overscan),
    };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  // Verificar si se alcanzó el final de la lista
  const checkEndReached = useCallback(() => {
    if (!onEndReached) return;

    const scrollHeight = items.length * itemHeight;
    const scrolledPercentage = (scrollTop + containerHeight) / scrollHeight;

    if (scrolledPercentage >= endReachedThreshold) {
      onEndReached();
    }
  }, [scrollTop, containerHeight, items.length, itemHeight, endReachedThreshold, onEndReached]);

  // Manejar el scroll
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement;
    const newScrollTop = target.scrollTop;

    // Evitar múltiples actualizaciones durante el scroll
    if (!ticking.current) {
      requestAnimationFrame(() => {
        setScrollTop(newScrollTop);
        lastScrollTop.current = newScrollTop;
        checkEndReached();
        ticking.current = false;
      });

      ticking.current = true;
    }
  }, [checkEndReached]);

  // Observar cambios en el tamaño del contenedor
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Configurar el scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Generar items virtuales
  const virtualItems = useCallback((): VirtualItem<T>[] => {
    const range = getVisibleRange();
    return items
      .slice(range.start, range.end)
      .map((item, index) => ({
        index: range.start + index,
        item,
        style: {
          position: 'absolute',
          top: (range.start + index) * itemHeight,
          left: 0,
          width: '100%',
          height: itemHeight,
        },
      }));
  }, [items, getVisibleRange, itemHeight]);

  // Calcular dimensiones del contenedor
  const containerStyle = {
    position: 'relative' as const,
    height: '100%',
    width: '100%',
    overflow: 'auto',
  };

  const contentStyle = {
    position: 'relative' as const,
    width: '100%',
    height: items.length * itemHeight,
  };

  // Métodos de utilidad
  const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current) return;

    let scrollPosition: number;
    switch (align) {
      case 'center':
        scrollPosition = index * itemHeight - containerHeight / 2 + itemHeight / 2;
        break;
      case 'end':
        scrollPosition = (index + 1) * itemHeight - containerHeight;
        break;
      default:
        scrollPosition = index * itemHeight;
    }

    containerRef.current.scrollTop = Math.max(0, scrollPosition);
  }, [containerHeight, itemHeight]);

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = items.length * itemHeight - containerHeight;
    }
  }, [items.length, itemHeight, containerHeight]);

  return {
    containerRef,
    virtualItems: virtualItems(),
    containerStyle,
    contentStyle,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    isScrolling: ticking.current,
    scrollTop,
    containerHeight,
  };
};
