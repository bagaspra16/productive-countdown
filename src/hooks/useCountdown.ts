import { useState, useEffect, useCallback, useRef } from 'react';

// Import audio assets
import tickSound from '../assets/sounds/tick.mp3';
import alarmSound from '../assets/sounds/alarm.mp3';
// Import a new beep sound for the last 10 seconds
import finalBeepSound from '../assets/sounds/finalBeep.mp3';

interface CountdownProps {
  initialTime: number; // Duration in minutes
  onComplete?: () => void;
}

interface CountdownState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  progress: number; // 0 to 1
  originalTime: number; // Original time in minutes
  isNearEnd: boolean; // Whether countdown is in final stages
  isAlmostEnd: boolean; // Whether countdown is in the last few seconds
  isCompleted: boolean; // Whether the countdown has completed
  finalMinutes: number; // Store the final minutes when completed
  finalSeconds: number; // Store the final seconds when completed
  showCompletionInfo: boolean; // Whether to show completion information
}

export function useCountdown({ initialTime, onComplete }: CountdownProps) {
  const [state, setState] = useState<CountdownState>({
    minutes: initialTime,
    seconds: 0,
    isRunning: false,
    progress: 0,
    originalTime: initialTime,
    isNearEnd: false,
    isAlmostEnd: false,
    isCompleted: false,
    finalMinutes: 0,
    finalSeconds: 0,
    showCompletionInfo: false,
  });

  const [showEndAlert, setShowEndAlert] = useState(false);
  
  // Audio ref for sound effects
  const tickingSoundRef = useRef<HTMLAudioElement | null>(null);
  const alarmSoundRef = useRef<HTMLAudioElement | null>(null);
  const finalBeepSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Track last second played to prevent multiple plays of finalBeep in the same second
  const lastSecondPlayedRef = useRef<number>(-1);
  
  // Flag to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Create audio elements when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Create new audio elements
        tickingSoundRef.current = new Audio();
        alarmSoundRef.current = new Audio();
        finalBeepSoundRef.current = new Audio();
        
        // Set sources
        if (tickingSoundRef.current) {
          tickingSoundRef.current.src = tickSound;
          tickingSoundRef.current.volume = 0.5;
          tickingSoundRef.current.load();
        }
        
        if (alarmSoundRef.current) {
          alarmSoundRef.current.src = alarmSound;
          alarmSoundRef.current.volume = 0.8;
          alarmSoundRef.current.load();
        }
        
        if (finalBeepSoundRef.current) {
          finalBeepSoundRef.current.src = finalBeepSound;
          finalBeepSoundRef.current.volume = 0.4; // Lower volume for countdown beep
          finalBeepSoundRef.current.load();
        }
        
        console.log('Audio elements created and loaded');
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    }
    
    // Set mounted flag
    isMountedRef.current = true;
    
    // Cleanup
    return () => {
      isMountedRef.current = false;
      
      if (tickingSoundRef.current) {
        tickingSoundRef.current.pause();
        tickingSoundRef.current = null;
      }
      
      if (alarmSoundRef.current) {
        alarmSoundRef.current.pause();
        alarmSoundRef.current = null;
      }
      
      if (finalBeepSoundRef.current) {
        finalBeepSoundRef.current.pause();
        finalBeepSoundRef.current = null;
      }
    };
  }, []);

  const startCountdown = useCallback(() => {
    // If the countdown was completed before, reset it first
    if (state.isCompleted) {
      setState(prev => ({
        ...prev,
        isRunning: true,
        isCompleted: false,
        minutes: prev.originalTime,
        seconds: 0,
        progress: 0,
        isNearEnd: false,
        isAlmostEnd: false,
        showCompletionInfo: false,
      }));
    } else {
      setState(prev => ({ ...prev, isRunning: true }));
    }
  }, [state.isCompleted]);

  const pauseCountdown = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
    
    // Stop sounds if paused
    if (tickingSoundRef.current) {
      tickingSoundRef.current.pause();
      tickingSoundRef.current.currentTime = 0;
    }
    
    if (finalBeepSoundRef.current) {
      finalBeepSoundRef.current.pause();
      finalBeepSoundRef.current.currentTime = 0;
    }
  }, []);

  const resetCountdown = useCallback(() => {
    // If we're showing completion info, just hide it first
    if (state.showCompletionInfo) {
      setState(prev => ({
        ...prev,
        showCompletionInfo: false
      }));
      return;
    }
    
    setState({
      minutes: initialTime,
      seconds: 0,
      isRunning: false,
      progress: 0,
      originalTime: initialTime,
      isNearEnd: false,
      isAlmostEnd: false,
      isCompleted: false,
      finalMinutes: 0,
      finalSeconds: 0,
      showCompletionInfo: false,
    });
    
    // Stop sounds on reset
    if (tickingSoundRef.current) {
      tickingSoundRef.current.pause();
      tickingSoundRef.current.currentTime = 0;
    }
    if (alarmSoundRef.current) {
      alarmSoundRef.current.pause();
      alarmSoundRef.current.currentTime = 0;
    }
    if (finalBeepSoundRef.current) {
      finalBeepSoundRef.current.pause();
      finalBeepSoundRef.current.currentTime = 0;
    }
    
    // Reset last second played
    lastSecondPlayedRef.current = -1;
    
    // Hide alert if it was showing
    setShowEndAlert(false);
  }, [initialTime, state.showCompletionInfo]);

  const setTime = useCallback((minutes: number) => {
    setState({
      minutes,
      seconds: 0,
      isRunning: false,
      progress: 0,
      originalTime: minutes,
      isNearEnd: false,
      isAlmostEnd: false,
      isCompleted: false,
      finalMinutes: 0,
      finalSeconds: 0,
      showCompletionInfo: false,
    });
    
    // Reset last second played
    lastSecondPlayedRef.current = -1;
    
    // Stop sounds on time change
    if (tickingSoundRef.current) {
      tickingSoundRef.current.pause();
      tickingSoundRef.current.currentTime = 0;
    }
    
    if (finalBeepSoundRef.current) {
      finalBeepSoundRef.current.pause();
      finalBeepSoundRef.current.currentTime = 0;
    }
    
    // Hide alert if it was showing
    setShowEndAlert(false);
  }, []);
  
  const closeAlert = useCallback(() => {
    console.log('Closing alert');
    setShowEndAlert(false);
    
    // Stop alarm sound when alert is closed
    if (alarmSoundRef.current) {
      alarmSoundRef.current.pause();
      alarmSoundRef.current.currentTime = 0;
    }
  }, []);

  // Play sound effect with explicit volume and preload
  const playSound = useCallback((audioRef: React.RefObject<HTMLAudioElement | null>) => {
    if (audioRef.current) {
      // Force preload and set volume
      audioRef.current.load();
      
      // Reset to start
      audioRef.current.currentTime = 0;
      
      // Create a promise to play the sound
      const playPromise = audioRef.current.play();
      
      // Handle promise to avoid uncaught promise rejection errors
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing sound:', error);
        });
      }
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (state.isRunning) {
      interval = setInterval(() => {
        setState(prev => {
          // Calculate total seconds remaining
          const totalSeconds = prev.minutes * 60 + prev.seconds;
          
          // Check if we've reached the end
          if (totalSeconds <= 0) {
            clearInterval(interval!);
            
            // Play alarm sound
            if (alarmSoundRef.current) {
              console.log('Playing alarm sound');
              playSound(alarmSoundRef);
            }
            
            // Show end alert
            console.log('Setting showEndAlert to true');
            setShowEndAlert(true);
            
            // Store the original time for display purposes
            const finalMinutes = prev.originalTime;
            const finalSeconds = 0;
            
            // Call onComplete with a delay to allow showing completion info
            if (onComplete) {
              setTimeout(() => {
                if (isMountedRef.current) {
                  onComplete();
                }
              }, 100);
            }
            
            return {
              ...prev,
              minutes: 0,
              seconds: 0,
              isRunning: false,
              progress: 1,
              isNearEnd: true,
              isAlmostEnd: true,
              isCompleted: true,
              finalMinutes,
              finalSeconds,
              showCompletionInfo: true,
            };
          }
          
          // Calculate new minutes and seconds
          const newTotalSeconds = totalSeconds - 1;
          const newMinutes = Math.floor(newTotalSeconds / 60);
          const newSeconds = newTotalSeconds % 60;
          
          // Calculate progress (0 to 1)
          const totalOriginalSeconds = prev.originalTime * 60;
          const progress = 1 - newTotalSeconds / totalOriginalSeconds;
          
          // Determine if we're near the end (last 10%)
          const isNearEnd = progress > 0.9;
          
          // Determine if we're in the last 10 seconds
          const isAlmostEnd = newTotalSeconds <= 10;
          
          // Play final beep sound in last 10 seconds, but only once per second
          if (isAlmostEnd && finalBeepSoundRef.current && newTotalSeconds > 0) {
            // Only play if we haven't played this second yet
            if (lastSecondPlayedRef.current !== newTotalSeconds) {
              console.log('Playing final beep sound at', newTotalSeconds, 'seconds');
              
              // Make sure the sound is loaded and volume is set
              finalBeepSoundRef.current.volume = 0.4; // Lower volume for repeating alarm sounds
              finalBeepSoundRef.current.load();
              
              // Play the sound
              playSound(finalBeepSoundRef);
              
              // Update the last second played
              lastSecondPlayedRef.current = newTotalSeconds;
            }
          }
          
          return {
            ...prev,
            minutes: newMinutes,
            seconds: newSeconds,
            progress,
            isNearEnd,
            isAlmostEnd,
          };
        });
      }, 1000);
    } else {
      // Stop sounds when not running
      if (tickingSoundRef.current) {
        tickingSoundRef.current.pause();
        tickingSoundRef.current.currentTime = 0;
      }
      
      if (finalBeepSoundRef.current) {
        finalBeepSoundRef.current.pause();
        finalBeepSoundRef.current.currentTime = 0;
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isRunning, onComplete, playSound]);

  return {
    minutes: state.minutes,
    seconds: state.seconds,
    isRunning: state.isRunning,
    progress: state.progress,
    isNearEnd: state.isNearEnd,
    isAlmostEnd: state.isAlmostEnd,
    isCompleted: state.isCompleted,
    originalTime: state.originalTime,
    finalMinutes: state.finalMinutes,
    finalSeconds: state.finalSeconds,
    showEndAlert,
    showCompletionInfo: state.showCompletionInfo,
    start: startCountdown,
    pause: pauseCountdown,
    reset: resetCountdown,
    setTime,
    closeAlert,
  };
} 