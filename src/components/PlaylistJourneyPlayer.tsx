import React, { useState, useEffect, useRef } from 'react';
import { Playlist, Song } from '../types';
import { api } from '../lib/api';
import { 
  Music, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Headphones,
  Sparkles,
  Radio
} from 'lucide-react';

export const PlaylistJourneyPlayer: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progressPercent, setProgressPercent] = useState(25);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Web Audio Synth for ambient preview tone
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    async function loadPlaylists() {
      try {
        const res = await api.getPlaylists();
        setPlaylists(res.playlists || []);
        if (res.playlists && res.playlists.length > 0) {
          setSelectedPlaylist(res.playlists[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadPlaylists();
  }, []);

  const currentSong: Song | undefined = selectedPlaylist?.songs?.[currentSongIndex];

  // Ambient synth sound generator
  const startSynth = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create nodes: oscillator -> filter -> gain -> destination
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      // Gentle triangle wave for fewer high harmonics
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(432, ctx.currentTime); // calming base frequency

      // Lowpass filter to remove high-frequency buzz and tame harmonics
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(0.7, ctx.currentTime);

      // Very low output gain to avoid audible distortion; control via envelope
      const targetGain = isMuted ? 0 : 0.0025; // further reduced for minimal buzzing
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.6);

      // Subtle LFO to add life (slow vibrato), connected to oscillator frequency
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.18, ctx.currentTime); // slower 0.18 Hz wobble
      lfoGain.gain.setValueAtTime(2, ctx.currentTime); // +/-2 Hz modulation
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency as any);

      // Connect nodes
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      lfo.start();

      // Save refs for cleanup
      oscRef.current = osc;
      gainRef.current = gain;
      filterRef.current = filter;
      lfoRef.current = lfo;
      lfoGainRef.current = lfoGain;
    } catch (e) {
      console.warn('AudioContext failed:', e);
    }
  };

  const stopSynth = () => {
    const ctx = audioCtxRef.current;
    const now = ctx ? ctx.currentTime : 0;
    if (gainRef.current && ctx) {
      try {
        // Smoothly ramp gain down to avoid pops
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, now);
        gainRef.current.gain.linearRampToValueAtTime(0, now + 0.35);
      } catch (e) {}
    }

    // Stop and disconnect after envelope finishes
    setTimeout(() => {
      try {
        if (oscRef.current) {
          oscRef.current.stop();
          oscRef.current.disconnect();
          oscRef.current = null;
        }
        if (lfoRef.current) {
          lfoRef.current.stop();
          lfoRef.current.disconnect();
          lfoRef.current = null;
        }
        if (lfoGainRef.current) {
          lfoGainRef.current.disconnect();
          lfoGainRef.current = null;
        }
        if (filterRef.current) {
          filterRef.current.disconnect();
          filterRef.current = null;
        }
        if (gainRef.current) {
          gainRef.current.disconnect();
          gainRef.current = null;
        }
      } catch (e) {}
    }, 400);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      // pause audio if present, otherwise stop synth
      if (audioRef.current) {
        audioRef.current.pause();
      } else {
        stopSynth();
      }
    } else {
      setIsPlaying(true);
      // prefer real audio playback if available
      const rawUrl = currentSong?.audioPreviewUrl || currentSong?.externalUrl;
      const isPlayableAudio = (url?: string | null) => {
        if (!url) return false;
        return /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url);
      };
      const useServerProxy = selectedPlaylist && currentSong && isPlayableAudio(rawUrl);
      const audioUrl = useServerProxy
        ? `/api/playlists/${selectedPlaylist!.id}/songs/${currentSong!.id}/preview`
        : null;

      if (audioUrl) {
        ensureAudio();
        if (audioRef.current) {
          if (audioRef.current.src !== audioUrl) audioRef.current.src = audioUrl;
          audioRef.current.play().catch(err => {
            console.warn('Audio play failed:', err);
            // fallback to synth if audio plays fails
            startSynth();
          });
        }
        stopSynth();
      } else {
        startSynth();
      }
    }
  };

  const handleNext = () => {
    if (!selectedPlaylist || !selectedPlaylist.songs) return;
    const nextIdx = (currentSongIndex + 1) % selectedPlaylist.songs.length;
    setCurrentSongIndex(nextIdx);
    setProgressPercent(0);
  };

  const handlePrev = () => {
    if (!selectedPlaylist || !selectedPlaylist.songs) return;
    const prevIdx = (currentSongIndex - 1 + selectedPlaylist.songs.length) % selectedPlaylist.songs.length;
    setCurrentSongIndex(prevIdx);
    setProgressPercent(0);
  };

  // Progress ticker when playing
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      // If using HTML audio, sync with its timeupdate events instead
      if (audioRef.current) {
        const audio = audioRef.current;
        const onTime = () => {
          if (!audio.duration || isNaN(audio.duration) || audio.duration === Infinity) return;
          const pct = Math.round((audio.currentTime / audio.duration) * 100);
          setProgressPercent(pct);
        };
        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('ended', () => setIsPlaying(false));
        return () => {
          audio.removeEventListener('timeupdate', onTime);
        };
      }

      interval = setInterval(() => {
        setProgressPercent(prev => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Audio element management
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const a = new Audio();
      a.crossOrigin = 'anonymous';
      a.preload = 'auto';
      a.addEventListener('play', () => setIsPlaying(true));
      a.addEventListener('pause', () => setIsPlaying(false));
      a.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current = a;
    }
  };

  // Load selected song into audio when song or selectedPlaylist changes
  useEffect(() => {
    const audioUrl = currentSong?.audioPreviewUrl || currentSong?.externalUrl;
    const isPlayableAudio = (url?: string | null) => {
      if (!url) return false;
      return /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url);
    };
    if (audioUrl && isPlayableAudio(audioUrl)) {
      ensureAudio();
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        if (isPlaying) {
          audioRef.current.play().catch(err => console.warn('Audio play failed:', err));
        }
      }
      // stop synth when real audio is available
      stopSynth();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id, selectedPlaylist?.id]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        }
      } catch (e) {}
      stopSynth();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
        audioCtxRef.current = null;
      }
    };
  }, []);

  const filteredPlaylists = playlists.filter(p => {
    if (activeCategory === 'all') return true;
    return p.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3.5 py-1 rounded-full text-xs font-bold mb-3">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Saathi Journey Audio Companion</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-4xl tracking-tight leading-tight">
            Curated Indian Road Trip & Mood Playlists
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2">
            The perfect soundscape for every route — Vedic aartis in Varanasi, upbeat mountain highway rock in Himachal, and acoustic beach sunsets in Goa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Playlists Selection Grid (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {['all', 'Road Trip', 'Spiritual', 'Nature', 'Beaches'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Moods' : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPlaylists.map((pl) => {
              const isSelected = selectedPlaylist?.id === pl.id;
              return (
                <div
                  key={pl.id}
                  onClick={() => {
                    setSelectedPlaylist(pl);
                    setCurrentSongIndex(0);
                    setProgressPercent(0);
                  }}
                  className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md' 
                      : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={pl.coverImage} 
                      alt={pl.title}
                      className="w-16 h-16 rounded-2xl object-cover shadow-sm flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                        {pl.category}
                      </span>
                      <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 truncate mt-1">
                        {pl.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {pl.description}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {pl.songs?.length || pl.songsCount} Tracks • {pl.duration}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Music Player Widget (Right 1 col) */}
        {selectedPlaylist && currentSong && (
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
              
              <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-5 shadow-inner">
                <img 
                  src={selectedPlaylist.coverImage} 
                  alt={selectedPlaylist.title}
                  className={`w-full h-full object-cover transition-transform duration-1000 ${
                    isPlaying ? 'scale-110' : 'scale-100'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md">
                    {selectedPlaylist.title}
                  </span>
                </div>
              </div>

              {/* Current Track Info */}
              <div className="text-center mb-4">
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-white truncate">
                  {currentSong.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {currentSong.artist} • {currentSong.genre}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#6df5e1] h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>01:14</span>
                  <span>{currentSong.duration}</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                <button 
                  onClick={handlePrev}
                  className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-[#6df5e1] text-[#006b5f] flex items-center justify-center shadow-lg hover:scale-105 transition-all"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>

                <button 
                  onClick={handleNext}
                  className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* External Platform Links */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                {selectedPlaylist.spotifyUrl && (
                  <a
                    href={selectedPlaylist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/50 text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span>Listen on Spotify</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedPlaylist.youtubeUrl && (
                  <a
                    href={selectedPlaylist.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/50 text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
