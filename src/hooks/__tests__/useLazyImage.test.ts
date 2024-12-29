import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLazyImage } from '../useLazyImage';

describe('useLazyImage', () => {
  const mockSrc = 'https://example.com/image.jpg';
  const mockPlaceholder = 'placeholder.jpg';

  // Mock IntersectionObserver
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockImplementation((callback) => ({
    observe: vi.fn(() => callback([{ isIntersecting: true }])),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('inicia con el placeholder', () => {
    const { result } = renderHook(() =>
      useLazyImage(mockSrc, mockPlaceholder)
    );

    expect(result.current.currentSrc).toBe(mockPlaceholder);
    expect(result.current.isLoading).toBe(true);
  });

  it('carga la imagen cuando es visible', async () => {
    const onLoad = vi.fn();
    const { result } = renderHook(() =>
      useLazyImage(mockSrc, mockPlaceholder, { onLoad })
    );

    // Simular carga exitosa
    await act(async () => {
      const img = new Image();
      img.onload?.({} as Event);
    });

    expect(result.current.currentSrc).toBe(mockSrc);
    expect(result.current.isLoading).toBe(false);
    expect(onLoad).toHaveBeenCalled();
  });

  it('maneja errores de carga', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useLazyImage(mockSrc, mockPlaceholder, { onError })
    );

    // Simular error de carga
    await act(async () => {
      const img = new Image();
      img.onerror?.({} as Event);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
    expect(onError).toHaveBeenCalled();
  });

  it('permite reintentar la carga', async () => {
    const { result } = renderHook(() =>
      useLazyImage(mockSrc, mockPlaceholder)
    );

    // Simular error inicial
    await act(async () => {
      const img = new Image();
      img.onerror?.({} as Event);
    });

    expect(result.current.error).toBeTruthy();

    // Reintentar
    await act(async () => {
      result.current.retry();
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('permite precargar la imagen', async () => {
    const { result } = renderHook(() =>
      useLazyImage(mockSrc, mockPlaceholder)
    );

    await act(async () => {
      result.current.preload();
    });

    // Simular carga exitosa
    await act(async () => {
      const img = new Image();
      img.onload?.({} as Event);
    });

    expect(result.current.currentSrc).toBe(mockSrc);
  });

  it('limpia los observadores al desmontar', () => {
    const { unmount } = renderHook(() =>
      useLazyImage(mockSrc, mockPlaceholder)
    );

    unmount();

    // Verificar que se llamó a disconnect
    const observer = mockIntersectionObserver.mock.results[0].value;
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('maneja opciones personalizadas', () => {
    const options = {
      threshold: 0.5,
      rootMargin: '100px',
    };

    renderHook(() => useLazyImage(mockSrc, mockPlaceholder, options));

    // Verificar que se pasaron las opciones al IntersectionObserver
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      options
    );
  });

  it('proporciona props para el elemento img', () => {
    const { result } = renderHook(() =>
      useLazyImage(mockSrc, mockPlaceholder)
    );

    expect(result.current.imgProps).toEqual({
      ref: expect.any(Object),
      src: mockPlaceholder,
      alt: '',
    });
  });

  it('actualiza currentSrc solo después de cargar', async () => {
    const { result } = renderHook(() =>
      useLazyImage(mockSrc, mockPlaceholder)
    );

    expect(result.current.currentSrc).toBe(mockPlaceholder);

    // Simular carga exitosa
    await act(async () => {
      const img = new Image();
      img.onload?.({} as Event);
    });

    expect(result.current.currentSrc).toBe(mockSrc);
  });

  it('mantiene el placeholder durante la carga', () => {
    const { result } = renderHook(() =>
      useLazyImage(mockSrc, mockPlaceholder)
    );

    expect(result.current.currentSrc).toBe(mockPlaceholder);
    expect(result.current.isLoading).toBe(true);
  });
});
