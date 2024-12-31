import { useRef, useCallback, useEffect } from 'react';

interface SoundConfig {
  src: string;
  volume?: number;
  loop?: boolean;
}

type SoundMap = {
  [key: string]: SoundConfig;
};

const DEFAULT_SOUNDS: SoundMap = {
  spin: {
    src: '/sounds/spin.mp3',
    volume: 0.7
  },
  win: {
    src: '/sounds/win.mp3',
    volume: 0.8
  },
  click: {
    src: '/sounds/click.mp3',
    volume: 0.5
  },
  error: {
    src: '/sounds/error.mp3',
    volume: 0.6
  }
};

export const useSound = (customSounds?: SoundMap) => {
  const audioMap = useRef<Map<string, HTMLAudioElement>>(new Map());
  const isEnabled = useRef<boolean>(true);

  // Cargar y cachear los sonidos
  useEffect(() => {
    const sounds = { ...DEFAULT_SOUNDS, ...customSounds };

    Object.entries(sounds).forEach(([key, config]) => {
      const audio = new Audio(config.src);
      audio.volume = config.volume || 1;
      audio.loop = config.loop || false;
      audioMap.current.set(key, audio);
    });

    // Limpiar los sonidos al desmontar
    return () => {
      audioMap.current.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioMap.current.clear();
    };
  }, [customSounds]);

  const playSound = useCallback((soundId: string) => {
    if (!isEnabled.current) return;

    const audio = audioMap.current.get(soundId);
    if (audio) {
      // Reiniciar el audio si ya está reproduciéndose
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.warn(`Error playing sound ${soundId}:`, error);
      });
    }
  }, []);

  const stopSound = useCallback((soundId: string) => {
    const audio = audioMap.current.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAllSounds = useCallback(() => {
    audioMap.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const setVolume = useCallback((soundId: string, volume: number) => {
    const audio = audioMap.current.get(soundId);
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const enableSounds = useCallback(() => {
    isEnabled.current = true;
  }, []);

  const disableSounds = useCallback(() => {
    isEnabled.current = false;
    stopAllSounds();
  }, [stopAllSounds]);

  const preloadSounds = useCallback(() => {
    audioMap.current.forEach(audio => {
      audio.load();
    });
  }, []);

  return {
    playSound,
    stopSound,
    stopAllSounds,
    setVolume,
    enableSounds,
    disableSounds,
    preloadSounds
  };
};

export default useSound; 