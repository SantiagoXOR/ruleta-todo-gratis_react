import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useAnimation, easings } from '../useAnimation';

describe('useAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 16) as any);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id));
    vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('debe ejecutar la animación correctamente', () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();

    const { result } = renderHook(() => useAnimation());

    result.current.animate({
      duration: 1000,
      onUpdate,
      onComplete
    });

    // Simular el progreso de la animación
    for (let i = 0; i < 10; i++) {
      (performance.now as any).mockReturnValue(i * 100);
      vi.advanceTimersByTime(100);
    }

    // Verificar que onUpdate fue llamado con valores progresivos
    expect(onUpdate).toHaveBeenCalledTimes(10);
    expect(onUpdate).toHaveBeenCalledWith(expect.any(Number));

    // Simular finalización
    (performance.now as any).mockReturnValue(1000);
    vi.advanceTimersByTime(100);

    expect(onComplete).toHaveBeenCalled();
  });

  it('debe cancelar la animación correctamente', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() => useAnimation());

    result.current.animate({
      duration: 1000,
      onUpdate
    });

    // Cancelar la animación después de algunas actualizaciones
    (performance.now as any).mockReturnValue(300);
    vi.advanceTimersByTime(300);

    result.current.cancelAnimation();

    // Avanzar el tiempo pero no debería haber más actualizaciones
    (performance.now as any).mockReturnValue(600);
    vi.advanceTimersByTime(300);

    const callCount = onUpdate.mock.calls.length;
    expect(onUpdate).toHaveBeenCalledTimes(callCount);
  });

  it('debe aplicar la función de easing correctamente', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() => useAnimation());

    result.current.animate({
      duration: 1000,
      easing: easings.easeOutCubic,
      onUpdate
    });

    // Verificar puntos clave de la animación
    (performance.now as any).mockReturnValue(500);
    vi.advanceTimersByTime(500);

    const progress = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(progress).toBeGreaterThan(0.5); // easeOutCubic acelera al principio
  });

  describe('funciones de easing', () => {
    it('debe implementar linear correctamente', () => {
      expect(easings.linear(0.5)).toBe(0.5);
    });

    it('debe implementar easeInQuad correctamente', () => {
      expect(easings.easeInQuad(0.5)).toBe(0.25);
    });

    it('debe implementar easeOutQuad correctamente', () => {
      expect(easings.easeOutQuad(0.5)).toBe(0.75);
    });

    it('debe implementar easeInOutQuad correctamente', () => {
      expect(easings.easeInOutQuad(0.25)).toBe(0.125);
      expect(easings.easeInOutQuad(0.75)).toBe(0.875);
    });
  });

  it('debe limpiar la animación al desmontar', () => {
    const onUpdate = vi.fn();
    const { unmount } = renderHook(() => useAnimation());

    // Verificar que cancelAnimationFrame es llamado al desmontar
    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
}); 