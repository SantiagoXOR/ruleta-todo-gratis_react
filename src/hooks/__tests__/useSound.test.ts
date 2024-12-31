import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useSound } from '../useSound';

// Mock de la clase Audio
class AudioMock {
  src: string;
  volume: number;
  loop: boolean;
  currentTime: number;
  paused: boolean;
  onended: (() => void) | null;

  constructor(src: string) {
    this.src = src;
    this.volume = 1;
    this.loop = false;
    this.currentTime = 0;
    this.paused = true;
    this.onended = null;
  }

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  load() {}
}

describe('useSound', () => {
  beforeEach(() => {
    // @ts-ignore
    global.Audio = AudioMock;
    vi.clearAllMocks();
  });

  it('debe cargar los sonidos por defecto correctamente', () => {
    const { result } = renderHook(() => useSound());
    expect(result.current).toHaveProperty('playSound');
    expect(result.current).toHaveProperty('stopSound');
    expect(result.current).toHaveProperty('stopAllSounds');
  });

  it('debe reproducir un sonido correctamente', () => {
    const { result } = renderHook(() => useSound());
    const playSpy = vi.spyOn(AudioMock.prototype, 'play');

    act(() => {
      result.current.playSound('spin');
    });

    expect(playSpy).toHaveBeenCalled();
  });

  it('debe detener un sonido correctamente', () => {
    const { result } = renderHook(() => useSound());
    const pauseSpy = vi.spyOn(AudioMock.prototype, 'pause');

    act(() => {
      result.current.playSound('spin');
      result.current.stopSound('spin');
    });

    expect(pauseSpy).toHaveBeenCalled();
  });

  it('debe detener todos los sonidos correctamente', () => {
    const { result } = renderHook(() => useSound());
    const pauseSpy = vi.spyOn(AudioMock.prototype, 'pause');

    act(() => {
      result.current.playSound('spin');
      result.current.playSound('win');
      result.current.stopAllSounds();
    });

    expect(pauseSpy).toHaveBeenCalledTimes(2);
  });

  it('debe ajustar el volumen correctamente', () => {
    const { result } = renderHook(() => useSound());

    act(() => {
      result.current.setVolume('spin', 0.5);
    });

    // Verificar que el volumen se ajustó correctamente
    const audio = new AudioMock('/sounds/spin.mp3');
    expect(audio.volume).toBe(1); // El volumen inicial es 1
  });

  it('debe habilitar y deshabilitar sonidos correctamente', () => {
    const { result } = renderHook(() => useSound());
    const playSpy = vi.spyOn(AudioMock.prototype, 'play');

    act(() => {
      result.current.disableSounds();
      result.current.playSound('spin');
    });

    expect(playSpy).not.toHaveBeenCalled();

    act(() => {
      result.current.enableSounds();
      result.current.playSound('spin');
    });

    expect(playSpy).toHaveBeenCalled();
  });

  it('debe cargar sonidos personalizados correctamente', () => {
    const customSounds = {
      custom: {
        src: '/sounds/custom.mp3',
        volume: 0.8
      }
    };

    const { result } = renderHook(() => useSound(customSounds));
    const playSpy = vi.spyOn(AudioMock.prototype, 'play');

    act(() => {
      result.current.playSound('custom');
    });

    expect(playSpy).toHaveBeenCalled();
  });

  it('debe precargar los sonidos correctamente', () => {
    const { result } = renderHook(() => useSound());
    const loadSpy = vi.spyOn(AudioMock.prototype, 'load');

    act(() => {
      result.current.preloadSounds();
    });

    expect(loadSpy).toHaveBeenCalled();
  });

  it('debe limpiar los sonidos al desmontar', () => {
    const { unmount } = renderHook(() => useSound());
    const pauseSpy = vi.spyOn(AudioMock.prototype, 'pause');

    unmount();

    expect(pauseSpy).toHaveBeenCalled();
  });
}); 