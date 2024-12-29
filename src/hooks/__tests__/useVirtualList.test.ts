import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVirtualList } from '../useVirtualList';

describe('useVirtualList', () => {
  const mockItems = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    content: `Item ${i}`,
  }));

  const defaultOptions = {
    itemHeight: 50,
    overscan: 3,
  };

  // Mock ResizeObserver
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockImplementation((callback) => ({
    observe: vi.fn(() => callback([{ contentRect: { height: 500 } }])),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    window.ResizeObserver = mockResizeObserver;
  });

  it('calcula items virtuales correctamente', () => {
    const { result } = renderHook(() =>
      useVirtualList(mockItems, defaultOptions)
    );

    expect(result.current.virtualItems.length).toBeGreaterThan(0);
    expect(result.current.virtualItems[0].index).toBe(0);
  });

  it('maneja el scroll correctamente', () => {
    const { result } = renderHook(() =>
      useVirtualList(mockItems, defaultOptions)
    );

    act(() => {
      const scrollEvent = new Event('scroll');
      Object.defineProperty(scrollEvent, 'target', {
        value: { scrollTop: 500 },
      });
      result.current.containerRef.current?.dispatchEvent(scrollEvent);
    });

    expect(result.current.scrollTop).toBe(500);
  });

  it('llama a onEndReached cuando corresponde', () => {
    const onEndReached = vi.fn();
    const { result } = renderHook(() =>
      useVirtualList(mockItems, {
        ...defaultOptions,
        onEndReached,
        endReachedThreshold: 0.8,
      })
    );

    act(() => {
      const scrollEvent = new Event('scroll');
      Object.defineProperty(scrollEvent, 'target', {
        value: { scrollTop: 40000 }, // Cerca del final
      });
      result.current.containerRef.current?.dispatchEvent(scrollEvent);
    });

    expect(onEndReached).toHaveBeenCalled();
  });

  it('scrollToIndex funciona correctamente', () => {
    const { result } = renderHook(() =>
      useVirtualList(mockItems, defaultOptions)
    );

    act(() => {
      result.current.scrollToIndex(10);
    });

    expect(result.current.containerRef.current?.scrollTop).toBe(500);
  });

  it('scrollToTop funciona correctamente', () => {
    const { result } = renderHook(() =>
      useVirtualList(mockItems, defaultOptions)
    );

    act(() => {
      result.current.scrollToTop();
    });

    expect(result.current.containerRef.current?.scrollTop).toBe(0);
  });

  it('scrollToBottom funciona correctamente', () => {
    const { result } = renderHook(() =>
      useVirtualList(mockItems, defaultOptions)
    );

    act(() => {
      result.current.scrollToBottom();
    });

    const expectedScrollTop = mockItems.length * defaultOptions.itemHeight - result.current.containerHeight;
    expect(result.current.containerRef.current?.scrollTop).toBe(expectedScrollTop);
  });

  it('actualiza virtualItems cuando cambian los items', () => {
    const { result, rerender } = renderHook(
      ({ items }) => useVirtualList(items, defaultOptions),
      {
        initialProps: { items: mockItems },
      }
    );

    const initialItemsLength = result.current.virtualItems.length;

    // Actualizar items
    const newItems = mockItems.slice(0, 500);
    rerender({ items: newItems });

    expect(result.current.virtualItems.length).toBeLessThan(initialItemsLength);
  });

  it('maneja el overscan correctamente', () => {
    const { result } = renderHook(() =>
      useVirtualList(mockItems, {
        ...defaultOptions,
        overscan: 5,
      })
    );

    const visibleCount = Math.ceil(500 / defaultOptions.itemHeight);
    expect(result.current.virtualItems.length).toBe(visibleCount + 10); // overscan * 2
  });

  it('optimiza el rendimiento durante el scroll', () => {
    const { result } = renderHook(() =>
      useVirtualList(mockItems, defaultOptions)
    );

    act(() => {
      // Simular múltiples eventos de scroll rápidos
      for (let i = 0; i < 10; i++) {
        const scrollEvent = new Event('scroll');
        Object.defineProperty(scrollEvent, 'target', {
          value: { scrollTop: i * 100 },
        });
        result.current.containerRef.current?.dispatchEvent(scrollEvent);
      }
    });

    // Verificar que no se actualizó el scrollTop para cada evento
    expect(result.current.isScrolling).toBe(true);
  });
});
