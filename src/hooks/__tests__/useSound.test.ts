import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useSound from '../useSound';

// Mock de Audio
class AudioMock {
  src: string;
  volume: number;
  loop: boolean;
  currentTime: number;
  onended: (() => void) | null;
  
  constructor(src: string) {
    this.src = src;
    this.volume = 1;
    this.loop = false;
    this.currentTime = 0;
    this.onended = null;
  }

  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
}

// Reemplazar la clase Audio global
global.Audio = AudioMock as any;

describe('useSound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe crear instancias de Audio con las configuraciones correctas', () => {
    const { result } = renderHook(() => useSound());
    
    // Verificar que se crearon las instancias de Audio
    expect(global.Audio).toHaveBeenCalledWith('/sounds/spin.mp3');
    expect(global.Audio).toHaveBeenCalledWith('/sounds/win.mp3');
    expect(global.Audio).toHaveBeenCalledWith('/sounds/click.mp3');
    expect(global.Audio).toHaveBeenCalledWith('/sounds/error.mp3');
    expect(global.Audio).toHaveBeenCalledWith('/sounds/hover.mp3');
    expect(global.Audio).toHaveBeenCalledWith('/sounds/success.mp3');
  });

  it('debe reproducir un sonido correctamente', () => {
    const { result } = renderHook(() => useSound());
    
    result.current.playSound('spin');
    
    // Obtener la última instancia de Audio creada
    const lastAudio = (global.Audio as any).mock.instances[0];
    expect(lastAudio.play).toHaveBeenCalled();
  });

  it('debe detener un sonido correctamente', () => {
    const { result } = renderHook(() => useSound());
    
    result.current.playSound('spin');
    result.current.stopSound('spin');
    
    const lastAudio = (global.Audio as any).mock.instances[0];
    expect(lastAudio.pause).toHaveBeenCalled();
    expect(lastAudio.currentTime).toBe(0);
  });

  it('debe detener todos los sonidos correctamente', () => {
    const { result } = renderHook(() => useSound());
    
    // Reproducir varios sonidos
    result.current.playSound('spin');
    result.current.playSound('win');
    result.current.playSound('click');
    
    result.current.stopAllSounds();
    
    // Verificar que todos los sonidos se detuvieron
    const audioInstances = (global.Audio as any).mock.instances;
    audioInstances.forEach(audio => {
      expect(audio.pause).toHaveBeenCalled();
      expect(audio.currentTime).toBe(0);
    });
  });

  it('debe manejar errores de reproducción', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useSound());
    
    // Simular un error en la reproducción
    const error = new Error('Error playing sound');
    const lastAudio = (global.Audio as any).mock.instances[0];
    lastAudio.play.mockRejectedValueOnce(error);
    
    result.current.playSound('spin');
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(consoleWarnSpy).toHaveBeenCalledWith('Error playing sound:', error);
    
    consoleWarnSpy.mockRestore();
  });

  it('debe configurar el volumen correctamente', () => {
    renderHook(() => useSound());
    
    const audioInstances = (global.Audio as any).mock.instances;
    
    // Verificar el volumen del sonido de giro
    expect(audioInstances[0].volume).toBe(0.4); // spin
    expect(audioInstances[1].volume).toBe(0.6); // win
    expect(audioInstances[2].volume).toBe(0.3); // click
    expect(audioInstances[3].volume).toBe(0.4); // error
    expect(audioInstances[4].volume).toBe(0.2); // hover
    expect(audioInstances[5].volume).toBe(0.5); // success
  });

  it('debe configurar el loop correctamente', () => {
    renderHook(() => useSound());
    
    const audioInstances = (global.Audio as any).mock.instances;
    
    // Solo el sonido de giro debe estar en loop
    expect(audioInstances[0].loop).toBe(true); // spin
    expect(audioInstances[1].loop).toBe(false); // win
    expect(audioInstances[2].loop).toBe(false); // click
    expect(audioInstances[3].loop).toBe(false); // error
    expect(audioInstances[4].loop).toBe(false); // hover
    expect(audioInstances[5].loop).toBe(false); // success
  });

  it('debe reiniciar un sonido si ya está reproduciéndose', () => {
    const { result } = renderHook(() => useSound());
    
    result.current.playSound('click');
    const audio = (global.Audio as any).mock.instances[2]; // click es el tercer sonido
    
    // Simular que el sonido ya está reproduciéndose
    audio.currentTime = 1;
    
    result.current.playSound('click');
    
    expect(audio.currentTime).toBe(0);
    expect(audio.play).toHaveBeenCalledTimes(2);
  });
}); 