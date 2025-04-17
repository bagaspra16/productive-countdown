import React, { useState, useRef, useEffect } from 'react';
import { MusicTrack } from '../types/music';
import { getAllTracks, savePlayerPreferences, loadPlayerPreferences, getSystemVolume } from '../services/musicService';

interface MusicPlayerProps {
  className?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ className = '' }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(true);
  const [isVolumeSliderActive, setIsVolumeSliderActive] = useState(false);
  const [currentVolumeAction, setCurrentVolumeAction] = useState<'increase' | 'decrease' | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const playlistRef = useRef<HTMLDivElement>(null);
  const volumeTimerRef = useRef<number | null>(null);
  
  const currentTrack = tracks[currentTrackIndex];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Check initially
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load tracks and user preferences
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        setIsLoading(true);
        
        // Try to get system volume if available
        const systemVol = await getSystemVolume();
        
        // Load tracks from music directory
        const musicTracks = await getAllTracks();
        
        // If no tracks were found, add a direct reference to Waltz No. 2
        if (musicTracks.length === 0) {
          console.warn('No tracks returned from getAllTracks, adding direct reference to Waltz');
          musicTracks.push({
            id: 'waltz-no-2',
            title: 'Waltz No. 2',
            file: '/assets/music/Waltz No. 2.mp3'
          });
        }
        
        setTracks(musicTracks);
        
        // Load user preferences
        const prefs = loadPlayerPreferences();
        
        // Use system volume if available, otherwise use saved preference
        if (systemVol !== null) {
          setVolume(systemVol);
        } else {
          setVolume(prefs.volume);
        }
        
        // Set last played track if available
        if (prefs.lastTrackId && musicTracks.length > 0) {
          const trackIndex = musicTracks.findIndex(t => t.id === prefs.lastTrackId);
          if (trackIndex !== -1) {
            setCurrentTrackIndex(trackIndex);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing music player:', error);
        setIsLoading(false);
      }
    };
    
    initializePlayer();
    
    // Add media session API support for controlling music via device controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
      navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
    }
    
    return () => {
      // Cleanup media session
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
      }
    };
  }, []);

  // Update metadata when current track changes
  useEffect(() => {
    // Update media session metadata
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: 'Productive Countdown',
        album: 'Focus Music',
      });
    }
  }, [currentTrack]);

  // Save user preferences when they change
  useEffect(() => {
    if (!isLoading && tracks.length > 0) {
      savePlayerPreferences({
        volume,
        lastTrackId: currentTrack?.id
      });
    }
  }, [volume, currentTrackIndex, isLoading, tracks, currentTrack]);

  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Log attempt to play audio
        console.log('Attempting to play track:', currentTrack);
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Change track
  const changeTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(false);
    
    // Small delay to ensure state updates before playing
    setTimeout(() => {
      if (audioRef.current) {
        // Log loading new track
        console.log('Loading new track:', tracks[index]);
        audioRef.current.load();
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
        setIsPlaying(true);
      }
    }, 50);
  };

  // Next track
  const nextTrack = () => {
    if (tracks.length === 0) return;
    const newIndex = (currentTrackIndex + 1) % tracks.length;
    changeTrack(newIndex);
  };

  // Previous track
  const prevTrack = () => {
    if (tracks.length === 0) return;
    const newIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    changeTrack(newIndex);
  };

  // Update volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    applyVolume(newVolume);
  };
  
  // Apply volume with visual feedback
  const applyVolume = (newVolume: number) => {
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    
    // Set volume action for visual feedback
    setCurrentVolumeAction(newVolume > volume ? 'increase' : 'decrease');
    
    // Clear existing timer if any
    if (volumeTimerRef.current) {
      window.clearTimeout(volumeTimerRef.current);
    }
    
    // Set timer to clear volume action
    volumeTimerRef.current = window.setTimeout(() => {
      setCurrentVolumeAction(null);
    }, 1000);
  };
  
  // Increase volume by 10%
  const increaseVolume = () => {
    applyVolume(volume + 0.1);
  };
  
  // Decrease volume by 10%
  const decreaseVolume = () => {
    applyVolume(volume - 0.1);
  };

  // Handle track end (auto play next)
  useEffect(() => {
    const audioElement = audioRef.current;
    
    const handleEnded = () => {
      nextTrack();
    };
    
    if (audioElement) {
      audioElement.addEventListener('ended', handleEnded);
      audioElement.loop = false; // We handle looping through the playlist ourselves
      audioElement.volume = volume;
    }
    
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', handleEnded);
      }
      
      // Clear volume action timer on unmount
      if (volumeTimerRef.current) {
        window.clearTimeout(volumeTimerRef.current);
      }
    };
  }, [currentTrackIndex, tracks.length, volume]);

  // Handle click outside to collapse playlist
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (playlistRef.current && !playlistRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Ensure selected track is visible in the scrollable list
  useEffect(() => {
    if (isExpanded && tracks.length > 3) {
      // Find the currently playing track element and scroll it into view if needed
      const currentTrackElement = document.getElementById(`track-${currentTrackIndex}`);
      if (currentTrackElement) {
        currentTrackElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentTrackIndex, isExpanded, tracks.length]);

  return (
    <div className={`music-player fixed ${isMobile ? 'left-2 bottom-6 sm:bottom-6' : 'left-4 sm:left-8 bottom-6 sm:bottom-8'} z-30 ${className}`}>
      <div 
        className={`relative bg-dark-surface/90 border border-dark-accent/30 rounded-lg shadow-lg transition-all duration-300 overflow-hidden ${
          isExpanded 
            ? isMobile ? 'w-[85vw] max-w-[280px] h-auto' : 'w-72 h-auto' 
            : 'w-auto h-auto'
        }`}
      >
        {/* Main player controls (always visible) */}
        <div className="flex items-center p-2 bg-dark-accent/5">
          <button 
            onClick={togglePlay} 
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              isLoading ? 'bg-dark-accent/10 text-text-secondary/50 cursor-not-allowed' : 'bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer active:scale-95'
            } transition-colors transition-transform duration-200`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            disabled={isLoading || tracks.length === 0}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <div className="ml-2 flex-1 overflow-hidden">
            <div className="truncate text-xs font-medium text-text-primary">
              {isLoading ? 'Loading...' : currentTrack?.title || 'No track selected'}
            </div>
            <div className="truncate text-xs text-text-secondary">
              Music Player
            </div>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-dark-accent/30 text-text-secondary transition-colors"
            aria-label={isExpanded ? 'Collapse player' : 'Expand player'}
            disabled={isLoading}
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Expanded player content */}
        {isExpanded && (
          <div ref={playlistRef} className="p-3 border-t border-dark-accent/10">
            {/* Additional controls */}
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={prevTrack}
                className={`w-7 h-7 flex items-center justify-center rounded-full ${
                  tracks.length === 0 ? 'text-text-secondary/50 cursor-not-allowed' : 'hover:bg-dark-accent/30 text-text-secondary cursor-pointer'
                } transition-colors`}
                aria-label="Previous track"
                disabled={tracks.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Improved Volume Control */}
              <div className="flex items-center justify-center space-x-1">
                <div 
                  className="relative group" 
                  onMouseEnter={() => setIsVolumeSliderActive(true)}
                  onMouseLeave={() => setIsVolumeSliderActive(false)}
                  onTouchStart={() => setIsVolumeSliderActive(true)} 
                >
                  {/* Volume icon button */}
                  <button 
                    onClick={() => volume > 0 ? applyVolume(0) : applyVolume(0.7)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-dark-accent/30 text-text-secondary transition-colors"
                    aria-label={volume === 0 ? "Unmute" : "Mute"}
                  >
                    {volume === 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : volume < 0.5 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Expanded volume control */}
                  <div className={`volume-control-panel absolute ${isMobile ? '-top-16 left-0' : '-top-10 left-1/2 transform -translate-x-1/2'} bg-dark-surface/95 border border-dark-accent/30 rounded-lg p-2 shadow-lg transition-all duration-200 z-50 ${
                    isVolumeSliderActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={decreaseVolume}
                        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-dark-accent/30 text-text-secondary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <div className="flex flex-col items-center w-32">
                        <div className="w-full h-4 relative">
                          <div className="absolute top-1/2 transform -translate-y-1/2 left-0 h-1 w-full bg-dark-accent/30 rounded-full"></div>
                          <div 
                            className="absolute top-1/2 transform -translate-y-1/2 left-0 h-1 bg-primary/70 rounded-full" 
                            style={{ width: `${volume * 100}%` }}
                          ></div>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={volume}
                            onChange={handleVolumeChange}
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <span className="text-xs text-text-secondary mt-1">{Math.round(volume * 100)}%</span>
                      </div>
                      
                      <button 
                        onClick={increaseVolume}
                        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-dark-accent/30 text-text-secondary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Volume change indicator */}
                {currentVolumeAction && (
                  <div className="ml-1 flex items-center text-xs text-text-secondary bg-dark-accent/20 rounded-full px-2 py-0.5">
                    {currentVolumeAction === 'increase' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {Math.round(volume * 100)}%
                  </div>
                )}
              </div>
              
              <button 
                onClick={nextTrack}
                className={`w-7 h-7 flex items-center justify-center rounded-full ${
                  tracks.length === 0 ? 'text-text-secondary/50 cursor-not-allowed' : 'hover:bg-dark-accent/30 text-text-secondary cursor-pointer'
                } transition-colors`}
                aria-label="Next track"
                disabled={tracks.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Playlist - with dynamic height based on track count */}
            <div 
              className={`mt-2 ${tracks.length > 3 ? 'overflow-y-auto custom-scrollbar task-scrollbar' : ''}`}
              style={{ 
                maxHeight: tracks.length > 3 ? (isMobile ? '35vh' : '12rem') : 'auto',
                minHeight: tracks.length > 0 ? '3.5rem' : 'auto',
                scrollbarWidth: 'thin'
              }}
            >
              {isLoading ? (
                <div className="flex justify-center items-center py-4 text-text-secondary/70 text-sm">
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading tracks...
                </div>
              ) : tracks.length === 0 ? (
                <div className="text-center py-3 text-text-secondary/70 text-xs">
                  No music tracks found in assets/music
                  <div className="mt-1 text-primary/80">Add .mp3 files to that folder</div>
                </div>
              ) : (
                <div className="space-y-1">
                  {tracks.map((track, index) => (
                    <div 
                      key={track.id}
                      id={`track-${index}`}
                      className={`px-2 py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center
                        ${index === currentTrackIndex 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-dark-accent/20 text-text-secondary'
                        }`}
                      onClick={() => changeTrack(index)}
                    >
                      <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center mr-2">
                        {index === currentTrackIndex && isPlaying ? (
                          <span className="flex items-center space-x-0.5">
                            <span className="music-bar music-bar-1"></span>
                            <span className="music-bar music-bar-2"></span>
                            <span className="music-bar music-bar-3"></span>
                          </span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className="truncate">{track.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        preload="auto" 
        onError={(e) => console.error('Audio error:', e)}
        onCanPlay={() => console.log('Audio can play now')}
      >
        {currentTrack?.file ? (
          <source 
            src={currentTrack.file.startsWith('/') ? currentTrack.file : `/${currentTrack.file}`} 
            type="audio/mpeg" 
          />
        ) : null}
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

// Add CSS for music bars animation and custom scrollbar - ini hanya fallback jika stylesheet tidak dimuat
const styleElement = document.createElement('style');
styleElement.textContent = `
  /* Fallback styles jika file CSS tidak dimuat */
  .music-bar {
    display: inline-block;
    width: 2px;
    height: 8px;
    background-color: currentColor;
    margin: 0 1px;
    border-radius: 1px;
    animation: music-bar-animation 1.5s ease-in-out infinite;
    transform-origin: bottom;
  }
  
  .music-bar-1 { animation-delay: 0s; }
  .music-bar-2 { animation-delay: 0.2s; }
  .music-bar-3 { animation-delay: 0.4s; }
  
  @keyframes music-bar-animation {
    0%, 100% { transform: scaleY(0.5); }
    50% { transform: scaleY(1); }
  }
`;

// Append style element to document head if it doesn't exist already
if (!document.getElementById('music-player-fallback-styles')) {
  styleElement.id = 'music-player-fallback-styles';
  document.head.appendChild(styleElement);
}

export default MusicPlayer; 