import { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';

import { Track } from '../types';

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  allTracks: Track[];
  currentIndex: number;
  isBuffering: boolean;
  playTrack: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setPlaylist: (tracks: Track[], startIndex?: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'one' | 'all'>('none');
  const [isBuffering, setIsBuffering] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('playerState');
      if (savedState) {
        const { track, q, vol, rep, shuf } = JSON.parse(savedState);
        if (track) setCurrentTrack(track);
        if (q) setQueue(q);
        if (vol !== undefined) setVolumeState(vol);
        if (rep) setRepeat(rep);
        if (shuf !== undefined) setShuffle(shuf);
      }
    } catch (e) {
      console.error('Failed to parse playerState from localStorage', e);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('playerState', JSON.stringify({
        track: currentTrack,
        q: queue,
        vol: volume,
        rep: repeat,
        shuf: shuffle
      }));
    } catch (e) {
      console.error('Failed to save playerState to localStorage', e);
    }
  }, [currentTrack, queue, volume, repeat, shuffle]);

  // Mutable ref to always have fresh state in async callbacks
  const stateRef = useRef({
    allTracks: [] as Track[],
    currentIndex: -1,
    repeat: 'none' as 'none' | 'one' | 'all',
    shuffle: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    currentTrack: null as Track | null,
    queue: [] as Track[],
  });

  // Keep ref in sync with state (runs synchronously before render commits)
  stateRef.current = {
    allTracks,
    currentIndex,
    repeat,
    shuffle,
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrack,
    queue,
  };

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const isDemoUrl = (url?: string) =>
    !url || url.includes('example.com') || url.startsWith('https://example');

  // Track play on backend for stats + history
  const recordPlay = async (track: Track) => {
    try {
      await fetch(`https://music.hidar.eu.cc/api/tracks/${track.id}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: track.duration || 0 })
      });
    } catch {}
  };

  // Advance to next track based on repeat/shuffle settings
  const doAdvance = (
    tracks: Track[],
    idx: number,
    rep: 'none' | 'one' | 'all',
    shuf: boolean,
  ) => {
    if (rep === 'one' && tracks[idx]) {
      internalPlay(tracks[idx], idx);
      return;
    }

    if (tracks.length === 0) {
      const q = stateRef.current.queue;
      if (q.length > 0) {
        const [next, ...rest] = q;
        setQueue(rest);
        internalPlay(next, -1);
      } else {
        setIsPlaying(false);
      }
      return;
    }

    let nextIdx: number;
    if (shuf) {
      do {
        nextIdx = Math.floor(Math.random() * tracks.length);
      } while (nextIdx === idx && tracks.length > 1);
    } else {
      nextIdx = idx + 1;
      if (nextIdx >= tracks.length) {
        if (rep === 'all') {
          nextIdx = 0;
        } else {
          const q = stateRef.current.queue;
          if (q.length > 0) {
            const [next, ...rest] = q;
            setQueue(rest);
            internalPlay(next, -1);
          } else {
            setIsPlaying(false);
          }
          return;
        }
      }
    }
    internalPlay(tracks[nextIdx], nextIdx);
  };

  // Simulation tick for demo URLs
  const startTick = (dur: number, from = 0) => {
    clearTick();
    let t = from;
    tickRef.current = setInterval(() => {
      t += 1;
      setCurrentTime(t);
      if (t >= dur) {
        clearTick();
        const { allTracks, currentIndex, repeat, shuffle } = stateRef.current;
        doAdvance(allTracks, currentIndex, repeat, shuffle);
      }
    }, 1000);
  };

  const internalPlay = (track: Track, index: number) => {
    clearTick();
    setCurrentTrack(track);
    setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(track.duration);
    setIsPlaying(true);
    setIsBuffering(false);

    // Performance + analytics: record play (fire and forget)
    recordPlay(track);

    if (isDemoUrl(track.audioUrl)) {
      // Simulate playback for demo/example URLs
      startTick(track.duration, 0);
    } else {
      setIsBuffering(true);
      if (audioRef.current) {
        audioRef.current.src = track.audioUrl || '';
        audioRef.current.volume = stateRef.current.volume;
        audioRef.current
          .play()
          .then(() => setIsBuffering(false))
          .catch(() => {
            setIsBuffering(false);
            startTick(track.duration, 0);
          });
      }
    }
  };

  const playTrack = (track: Track) => {
    const idx = stateRef.current.allTracks.findIndex(t => t.id === track.id);
    internalPlay(track, idx >= 0 ? idx : stateRef.current.currentIndex);
  };

  const setPlaylist = (tracks: Track[], startIndex = 0) => {
    setAllTracks(tracks);
    stateRef.current.allTracks = tracks; // Sync update for immediate use
    if (tracks.length > 0) {
      const idx = Math.max(0, Math.min(startIndex, tracks.length - 1));
      internalPlay(tracks[idx], idx);
    }
  };

  const pause = () => {
    setIsPlaying(false);
    clearTick();
    audioRef.current?.pause();
  };

  const resume = () => {
    const { currentTrack: ct, currentTime: ct2, duration: d } = stateRef.current;
    if (!ct) return;
    setIsPlaying(true);
    if (isDemoUrl(ct.audioUrl)) {
      startTick(d, ct2);
    } else {
      audioRef.current?.play().catch(() => startTick(d, ct2));
    }
  };

  const playNext = () => {
    const { allTracks, currentIndex, repeat, shuffle } = stateRef.current;
    doAdvance(allTracks, currentIndex, repeat, shuffle);
  };

  const playPrevious = () => {
    const { allTracks, currentIndex: idx, currentTime: ct, repeat } = stateRef.current;
    if (ct > 3) {
      seek(0);
    } else if (allTracks.length > 0) {
      let prevIdx = idx - 1;
      if (prevIdx < 0) {
        prevIdx = repeat === 'all' ? allTracks.length - 1 : 0;
      }
      internalPlay(allTracks[prevIdx], prevIdx);
    }
  };

  const seek = (time: number) => {
    const { duration: d, isPlaying: ip, currentTrack: ct } = stateRef.current;
    const clampedTime = Math.max(0, Math.min(time, d));
    setCurrentTime(clampedTime);
    if (audioRef.current && !isDemoUrl(ct?.audioUrl || '')) {
      audioRef.current.currentTime = clampedTime;
    }
    if (ip && ct && isDemoUrl(ct.audioUrl)) {
      startTick(d, clampedTime);
    }
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  };

  const addToQueue = (track: Track) => setQueue(q => [...q, track]);
  const removeFromQueue = (trackId: string) => setQueue(q => q.filter(t => t.id !== trackId));
  const clearQueue = () => setQueue([]);
  const toggleShuffle = () => setShuffle(s => !s);
  const toggleRepeat = () =>
    setRepeat(r => (r === 'none' ? 'all' : r === 'all' ? 'one' : 'none'));

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (stateRef.current.currentTrack) {
            stateRef.current.isPlaying ? pause() : resume();
          }
          break;
        case 'ArrowRight':
          if (e.metaKey || e.ctrlKey) return; // let browser forward
          playNext();
          break;
        case 'ArrowLeft':
          if (e.metaKey || e.ctrlKey) return;
          playPrevious();
          break;
        case 'KeyM':
          setVolume(stateRef.current.volume === 0 ? 0.7 : 0);
          break;
        case 'KeyS':
          if (e.shiftKey) toggleShuffle();
          break;
        case 'KeyR':
          if (e.shiftKey) toggleRepeat();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync Media Session
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artistName,
        album: currentTrack.albumName || '',
        artwork: [
          { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', resume);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime) seek(details.seekTime);
      });
    }
  }, [currentTrack]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        duration,
        queue,
        shuffle,
        repeat,
        allTracks,
        currentIndex,
        isBuffering,
        playTrack,
        pause,
        resume,
        playNext,
        playPrevious,
        seek,
        setVolume,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleShuffle,
        toggleRepeat,
        setPlaylist,
        audioRef,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            const d = audioRef.current.duration;
            if (d && isFinite(d)) {
              setDuration(d);
              clearTick(); // Real audio loaded, stop simulation
            }
          }
          setIsBuffering(false);
        }}
        onEnded={() => {
          const { allTracks, currentIndex, repeat, shuffle } = stateRef.current;
          doAdvance(allTracks, currentIndex, repeat, shuffle);
        }}
        onError={() => {
          setIsBuffering(false);
          const { isPlaying: ip, currentTrack: ct, currentTime: ct2 } = stateRef.current;
          if (ip && ct) startTick(ct.duration, ct2);
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
