import { MusicTrack } from '../types/music';

// This is a mock implementation since we can't directly access the file system in the browser
// In a real app, this would be handled by the backend or a file system API

/**
 * Scan and get music files from the assets/music directory
 * 
 * In a real implementation with server-side capabilities, this would directly scan the folder.
 * Since we're in a browser environment, we'll use an import.meta approach for Vite projects
 * or rely on the file structure pattern.
 */
export const getAllTracks = async (): Promise<MusicTrack[]> => {
  try {
    // In a real-world scenario, we would use an API endpoint to get the files
    // For demonstration purposes, we're simulating a dynamic import
    
    // Try to get all .mp3 files from the music directory
    let musicFiles: MusicTrack[] = [];
    
    try {
      // This syntax works in Vite - dynamically imports all mp3 files
      const modules = import.meta.glob('/src/assets/music/*.mp3');
      
      // Convert import.meta results to music tracks
      musicFiles = await Promise.all(
        Object.entries(modules).map(async ([path, importFn]) => {
          // Extract filename from path
          const filename = path.split('/').pop() || '';
          const id = filename.replace('.mp3', '');
          const title = formatTrackTitle(filename);
          
          // Use proper URL format for audio files
          const module = await importFn() as { default: string };
          const fileUrl = module.default || path.replace('/src', '');
          
          return {
            id,
            title,
            file: fileUrl
          };
        })
      );
    } catch (error) {
      console.warn('Dynamic import not supported, using direct path instead', error);
      
      // Try to use fetch to check available music files
      try {
        const response = await fetch('/api/music-files');
        if (response.ok) {
          const files = await response.json();
          musicFiles = files.map((filename: string) => ({
            id: filename.replace('.mp3', ''),
            title: formatTrackTitle(filename),
            file: `/assets/music/${filename}`
          }));
        }
      } catch (fetchError) {
        console.warn('Fetch API for music files failed, searching directly', fetchError);
        
        // If no API endpoint, try looking for the one file we know exists from the file listing
        const waltzFile = {
          id: 'waltz-no-2',
          title: 'Waltz No. 2',
          file: '/assets/music/Waltz No. 2.mp3'
        };
        
        // Only add it if we don't have any music files yet
        if (musicFiles.length === 0) {
          musicFiles = [waltzFile];
        }
      }
    }
    
    console.log('Music files found:', musicFiles);
    return musicFiles;
  } catch (error) {
    console.error('Error scanning music directory:', error);
    return [];
  }
};

/**
 * Format a filename to a readable title
 * e.g., "calm_piano.mp3" -> "Calm Piano"
 */
export const formatTrackTitle = (filename: string): string => {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Replace underscores and hyphens with spaces
  const nameWithSpaces = nameWithoutExt.replace(/[_-]/g, ' ');
  
  // Capitalize words
  return nameWithSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Save user preferences for the music player
 */
export const savePlayerPreferences = (prefs: { volume: number, lastTrackId?: string }) => {
  localStorage.setItem('musicPlayerPrefs', JSON.stringify(prefs));
};

/**
 * Load user preferences for the music player
 */
export const loadPlayerPreferences = (): { volume: number, lastTrackId?: string } => {
  const saved = localStorage.getItem('musicPlayerPrefs');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing music player preferences:', error);
    }
  }
  
  // Default preferences - start with 70% volume
  return { volume: 0.7 };
};

/**
 * Get the system volume level if available
 * This is a limited API and may not work in all browsers
 */
export const getSystemVolume = async (): Promise<number | null> => {
  try {
    // Check if the Audio Output Devices API is available
    if ('mediaDevices' in navigator && 'enumerateDevices' in navigator.mediaDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      
      if (audioOutputs.length > 0) {
        // We can detect audio devices, but getting their volume is restricted
        // by browser security. We'll need to use the Web Audio API to estimate.
        
        // Create an audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create an analyser
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;
        
        // Get the audio element and connect it to the analyser
        const audioElement = document.createElement('audio');
        audioElement.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAAH7/AAACABAAZGF0YQQAAAA='; // Silent audio
        
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // Play the audio briefly to get volume information
        await audioElement.play();
        
        // Get the volume data
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Stop the audio
        audioElement.pause();
        
        // Calculate average volume (0-1)
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const avg = sum / dataArray.length / 255;
        
        // Cleanup
        source.disconnect();
        analyser.disconnect();
        audioContext.close();
        
        return avg;
      }
    }
  } catch (error) {
    console.warn('Could not access system volume:', error);
  }
  
  return null;
}; 