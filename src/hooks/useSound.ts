import { useCallback, useEffect, useRef } from 'react';

interface SoundMap {
  [key: string]: HTMLAudioElement;
}

interface SoundConfig {
  volume?: number;
  loop?: boolean;
}

export const useSound = () => {
  const soundsRef = useRef<SoundMap>({});
  const currentlyPlayingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Precarga los sonidos con configuraciones específicas
    const soundConfigs: { [key: string]: SoundConfig } = {
      spin: { volume: 0.4, loop: true },
      win: { volume: 0.6 },
      click: { volume: 0.3 },
      error: { volume: 0.4 },
      hover: { volume: 0.2 },
      success: { volume: 0.5 }
    };

    // Crear y configurar los sonidos
    soundsRef.current = {
      spin: new Audio('/sounds/spin.mp3'),
      win: new Audio('/sounds/win.mp3'),
      click: new Audio('/sounds/click.mp3'),
      error: new Audio('/sounds/error.mp3'),
      hover: new Audio('/sounds/hover.mp3'),
      success: new Audio('/sounds/success.mp3')
    };

    // Configurar cada sonido
    Object.entries(soundsRef.current).forEach(([name, audio]) => {
      const config = soundConfigs[name] || {};
      audio.volume = config.volume || 0.5;
      audio.loop = config.loop || false;
    });

    return () => {
      // Limpia los sonidos al desmontar
      Object.values(soundsRef.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      currentlyPlayingRef.current.clear();
    };
  }, []);

  const playSound = useCallback((soundName: string) => {
    const sound = soundsRef.current[soundName];
    if (!sound) return;

    // Si el sonido ya está reproduciéndose y no es un sonido en loop
    if (currentlyPlayingRef.current.has(soundName) && !sound.loop) {
      sound.currentTime = 0;
    } else {
      currentlyPlayingRef.current.add(soundName);
      sound.play().catch(error => {
        console.warn(`Error playing sound: ${error}`);
      });
    }

    // Para sonidos que no están en loop, eliminarlos de la lista cuando terminan
    if (!sound.loop) {
      sound.onended = () => {
        currentlyPlayingRef.current.delete(soundName);
      };
    }
  }, []);

  const stopSound = useCallback((soundName: string) => {
    const sound = soundsRef.current[soundName];
    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;
    currentlyPlayingRef.current.delete(soundName);
  }, []);

  const stopAllSounds = useCallback(() => {
    Object.values(soundsRef.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    currentlyPlayingRef.current.clear();
  }, []);

  return { playSound, stopSound, stopAllSounds };
};

export default useSound; 