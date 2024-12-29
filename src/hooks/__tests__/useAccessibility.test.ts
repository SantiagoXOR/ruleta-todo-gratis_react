import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAccessibility } from '../useAccessibility';

describe('useAccessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('aplica props de accesibilidad correctamente', () => {
    const options = {
      ariaLabel: 'Test Label',
      ariaDescribedBy: 'test-desc',
      role: 'button',
      tabIndex: 0,
      focusable: true,
    };

    const { result } = renderHook(() => useAccessibility(options));
    const { accessibilityProps } = result.current;

    expect(accessibilityProps['aria-label']).toBe(options.ariaLabel);
    expect(accessibilityProps['aria-describedby']).toBe(options.ariaDescribedBy);
    expect(accessibilityProps.role).toBe(options.role);
    expect(accessibilityProps.tabIndex).toBe(options.tabIndex);
  });

  it('maneja elementos no focusables', () => {
    const { result } = renderHook(() => useAccessibility({ focusable: false }));
    expect(result.current.accessibilityProps.tabIndex).toBe(-1);
  });

  it('maneja atajos de teclado', () => {
    const shortcutHandler = vi.fn();
    const options = {
      keyboardShortcuts: {
        'ctrl+s': shortcutHandler,
      },
    };

    const { result } = renderHook(() => useAccessibility(options));
    const element = document.createElement('div');
    Object.defineProperty(element, 'current', { value: element });
    result.current.ref.current = element;

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    act(() => {
      element.dispatchEvent(event);
    });

    expect(shortcutHandler).toHaveBeenCalled();
  });

  it('anuncia mensajes al lector de pantalla', () => {
    const { result } = renderHook(() => useAccessibility());
    const message = 'Test announcement';

    act(() => {
      result.current.announceToScreenReader(message);
    });

    const announcement = document.querySelector('[role="alert"]');
    expect(announcement).toBeTruthy();
    expect(announcement?.textContent).toBe(message);
  });

  it('maneja el auto-focus', () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    const { result } = renderHook(() => useAccessibility({ autoFocus: true }));
    
    const element = document.createElement('div');
    Object.defineProperty(element, 'current', { value: element });
    result.current.ref.current = element;

    act(() => {
      // Simular montaje
      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);
    });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('aplica clases de accesibilidad', () => {
    const { result } = renderHook(() => useAccessibility());
    const element = document.createElement('div');
    Object.defineProperty(element, 'current', { value: element });
    result.current.ref.current = element;

    expect(result.current.accessibilityProps.className).toContain('font-size-medium');
  });

  it('maneja métodos focus y blur', () => {
    const { result } = renderHook(() => useAccessibility());
    const element = document.createElement('div');
    const focusSpy = vi.spyOn(element, 'focus');
    const blurSpy = vi.spyOn(element, 'blur');

    Object.defineProperty(element, 'current', { value: element });
    result.current.ref.current = element;

    act(() => {
      result.current.focus();
    });
    expect(focusSpy).toHaveBeenCalled();

    act(() => {
      result.current.blur();
    });
    expect(blurSpy).toHaveBeenCalled();
  });

  it('limpia los atributos al desmontar', () => {
    const { result, unmount } = renderHook(() => useAccessibility({
      ariaLabel: 'Test',
      role: 'button',
    }));

    const element = document.createElement('div');
    Object.defineProperty(element, 'current', { value: element });
    result.current.ref.current = element;

    // Verificar que los atributos están presentes
    expect(element.getAttribute('aria-label')).toBe('Test');
    expect(element.getAttribute('role')).toBe('button');

    // Desmontar
    unmount();

    // Verificar que los atributos fueron removidos
    expect(element.getAttribute('aria-label')).toBeNull();
    expect(element.getAttribute('role')).toBeNull();
  });

  it('maneja múltiples atajos de teclado', () => {
    const handlers = {
      'ctrl+s': vi.fn(),
      'alt+a': vi.fn(),
      'shift+x': vi.fn(),
    };

    const { result } = renderHook(() => useAccessibility({
      keyboardShortcuts: handlers,
    }));

    const element = document.createElement('div');
    Object.defineProperty(element, 'current', { value: element });
    result.current.ref.current = element;

    // Probar diferentes combinaciones
    const events = [
      new KeyboardEvent('keydown', { key: 's', ctrlKey: true }),
      new KeyboardEvent('keydown', { key: 'a', altKey: true }),
      new KeyboardEvent('keydown', { key: 'x', shiftKey: true }),
    ];

    events.forEach((event, index) => {
      act(() => {
        element.dispatchEvent(event);
      });
    });

    expect(handlers['ctrl+s']).toHaveBeenCalled();
    expect(handlers['alt+a']).toHaveBeenCalled();
    expect(handlers['shift+x']).toHaveBeenCalled();
  });
});
