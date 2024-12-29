import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

interface AccessibilityOptions {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  focusable?: boolean;
  autoFocus?: boolean;
  keyboardShortcuts?: {
    [key: string]: () => void;
  };
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    ariaLabel,
    ariaDescribedBy,
    role,
    tabIndex,
    focusable = true,
    autoFocus = false,
    keyboardShortcuts = {},
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const { fontSize, highContrast, reducedMotion } = useAppStore();

  // Manejar atajos de teclado
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey;
    const alt = event.altKey;
    const shift = event.shiftKey;

    // Construir la combinación de teclas
    const keyCombo = [
      ctrl ? 'ctrl' : '',
      alt ? 'alt' : '',
      shift ? 'shift' : '',
      key,
    ].filter(Boolean).join('+');

    // Ejecutar el atajo si existe
    if (keyboardShortcuts[keyCombo]) {
      event.preventDefault();
      keyboardShortcuts[keyCombo]();
    }
  }, [keyboardShortcuts]);

  // Configurar event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (Object.keys(keyboardShortcuts).length > 0) {
      element.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (Object.keys(keyboardShortcuts).length > 0) {
        element.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [handleKeyDown, keyboardShortcuts]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && elementRef.current) {
      elementRef.current.focus();
    }
  }, [autoFocus]);

  // Aplicar estilos de accesibilidad
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Aplicar clases según las preferencias
    element.classList.toggle('high-contrast', highContrast);
    element.classList.toggle('reduced-motion', reducedMotion);
    element.setAttribute('data-font-size', fontSize);

    // Configurar atributos ARIA
    if (ariaLabel) {
      element.setAttribute('aria-label', ariaLabel);
    }
    if (ariaDescribedBy) {
      element.setAttribute('aria-describedby', ariaDescribedBy);
    }
    if (role) {
      element.setAttribute('role', role);
    }
    if (typeof tabIndex === 'number') {
      element.setAttribute('tabindex', tabIndex.toString());
    }
    if (!focusable) {
      element.setAttribute('tabindex', '-1');
    }

    return () => {
      // Limpiar atributos al desmontar
      element.removeAttribute('aria-label');
      element.removeAttribute('aria-describedby');
      element.removeAttribute('role');
      element.removeAttribute('tabindex');
      element.removeAttribute('data-font-size');
      element.classList.remove('high-contrast', 'reduced-motion');
    };
  }, [ariaLabel, ariaDescribedBy, role, tabIndex, focusable, fontSize, highContrast, reducedMotion]);

  // Métodos de utilidad
  const focus = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.focus();
    }
  }, []);

  const blur = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.blur();
    }
  }, []);

  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');
    announcement.setAttribute('aria-live', 'polite');
    announcement.style.position = 'absolute';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.padding = '0';
    announcement.style.margin = '-1px';
    announcement.style.overflow = 'hidden';
    announcement.style.clip = 'rect(0, 0, 0, 0)';
    announcement.style.whiteSpace = 'nowrap';
    announcement.style.border = '0';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return {
    ref: elementRef,
    focus,
    blur,
    announceToScreenReader,
    // Props para el elemento
    accessibilityProps: {
      ref: elementRef,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      role,
      tabIndex: !focusable ? -1 : tabIndex,
      className: `
        ${highContrast ? 'high-contrast' : ''}
        ${reducedMotion ? 'reduced-motion' : ''}
        font-size-${fontSize}
      `.trim(),
    },
  };
};
