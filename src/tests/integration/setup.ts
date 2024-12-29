import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Configuración global para tests
beforeAll(() => {
  // Mock de funciones del navegador
  global.URL.createObjectURL = vi.fn();
  global.URL.revokeObjectURL = vi.fn();
});

// Limpiar después de cada test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Restaurar todos los mocks después de todos los tests
afterAll(() => {
  vi.restoreAllMocks();
});

// Mock de IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock de funciones de animación
window.requestAnimationFrame = vi.fn().mockImplementation(callback => {
  return setTimeout(() => callback(Date.now()), 0);
});

window.cancelAnimationFrame = vi.fn().mockImplementation(id => {
  clearTimeout(id);
});

// Mock de console.error para tests más limpios
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalError.call(console, ...args);
}; 