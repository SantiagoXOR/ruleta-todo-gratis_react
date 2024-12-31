import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock de fetch
global.fetch = vi.fn();

// Mock de IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

// Mock de ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

// Mock de canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn().mockImplementation(() => Promise.resolve()),
}));

// Mock de canvas
const canvasMock = {
  getContext: () => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  }),
  toDataURL: vi.fn(),
  toBlob: vi.fn(),
};

Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  value: function() {
    return canvasMock.getContext();
  },
});

// Mock de requestAnimationFrame
window.requestAnimationFrame = vi.fn().mockImplementation((callback) => {
  return setTimeout(() => callback(Date.now()), 0);
});

// Mock de cancelAnimationFrame
window.cancelAnimationFrame = vi.fn().mockImplementation((id) => {
  clearTimeout(id);
});

// Mock de matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
}); 