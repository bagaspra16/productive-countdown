import React, { useEffect, useCallback } from 'react';
import { Task } from '../types/task';
import { SessionType } from '../types/pomodoro';
import { useCountdown } from '../hooks/useCountdown';

interface CountdownProps {
  activeTask: Task | null;
  onCompleteTask: () => void;
  onShowTaskList?: () => void;
  sessionType?: SessionType;
  sessionDuration?: number;
  onStartNextSession?: (completedSessionType: SessionType) => void;
}

const Countdown: React.FC<CountdownProps> = ({
  activeTask,
  onCompleteTask,
  onShowTaskList,
  sessionType = SessionType.FOCUS,
  sessionDuration,
  onStartNextSession,
}) => {
  // Track which session type just completed (before it changes to the next one)
  const [completedSessionType, setCompletedSessionType] = React.useState<SessionType | null>(null);

  const {
    minutes,
    seconds,
    isRunning,
    progress,
    isNearEnd,
    isAlmostEnd,
    showEndAlert,
    showCompletionInfo,
    originalTime,
    start,
    pause,
    reset,
    stopAlarm,
  } = useCountdown({
    initialTime: sessionDuration || activeTask?.duration || 25,
    onComplete: () => {
      // Store the session type that just completed BEFORE calling onCompleteTask
      setCompletedSessionType(sessionType);
      onCompleteTask();
    },
  });

  // Handle stopping the alarm and starting next session
  const handleStopAlarm = useCallback(() => {
    console.log('=== COUNTDOWN STOP ALARM DEBUG ===');
    console.log('completedSessionType:', completedSessionType);
    console.log('current sessionType prop:', sessionType);

    stopAlarm();
    // Reset the timer first to clear completion state
    reset();
    // Then start the next session after a brief delay, passing the COMPLETED session type
    if (onStartNextSession && completedSessionType) {
      setTimeout(() => {
        console.log('Calling onStartNextSession with completedSessionType:', completedSessionType);
        onStartNextSession(completedSessionType);
        // Clear the completed session type after using it
        setCompletedSessionType(null);
      }, 200);
    }
    console.log('=== END COUNTDOWN DEBUG ===');
  }, [stopAlarm, reset, onStartNextSession, completedSessionType]);

  // Update document title with session type
  useEffect(() => {
    const formatTime = (val: number) => val.toString().padStart(2, '0');
    const timeStr = `${formatTime(minutes)}:${formatTime(seconds)}`;

    // Use completedSessionType when showing completion, otherwise use current sessionType
    const displaySessionType = showCompletionInfo && completedSessionType ? completedSessionType : sessionType;
    const sessionName = displaySessionType === SessionType.FOCUS ? 'Focus' : 'Rest';

    if (showCompletionInfo) {
      document.title = `${sessionName} - Complete!`;
    } else if (isRunning) {
      document.title = `${timeStr} - ${sessionName}`;
    } else if (minutes > 0 || seconds > 0) {
      document.title = `${timeStr} - ${sessionName}`;
    } else {
      document.title = 'Productive Countdown';
    }
  }, [minutes, seconds, isRunning, showCompletionInfo, sessionType, completedSessionType]);

  // Reset timer when active task changes or session duration changes
  // BUT NOT when we're showing completion info or alarm
  useEffect(() => {
    if ((activeTask || sessionDuration) && !showCompletionInfo && !showEndAlert) {
      reset();
    }
  }, [activeTask, sessionDuration, reset, showCompletionInfo, showEndAlert]);

  // Format time (00:00)
  const formatTime = (val: number) => val.toString().padStart(2, '0');

  // Format minutes (for elapsed/remaining time)
  const formatMinutes = (mins: number) => {
    if (mins < 60) {
      return `${mins}`;
    }
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  // Get dynamic classes based on countdown state and session type
  const getCountdownClasses = () => {
    const baseClasses = "text-[12rem] sm:text-[16rem] md:text-[20rem] font-bold leading-none tracking-tight transition-all duration-300";

    if (isAlmostEnd) {
      return `${baseClasses} text-danger animate-pulse`;
    }

    if (isNearEnd) {
      return `${baseClasses} text-warning`;
    }

    if (sessionType === SessionType.REST) {
      return `${baseClasses} text-secondary`;
    }

    return `${baseClasses} text-primary`;
  };

  // Get progress bar classes based on countdown state and session type
  const getProgressBarClasses = () => {
    const baseClasses = "h-full rounded-full transition-all duration-300 ease-out";

    if (isAlmostEnd) {
      return `${baseClasses} bg-danger animate-pulse`;
    }

    if (isNearEnd) {
      return `${baseClasses} bg-warning`;
    }

    if (sessionType === SessionType.REST) {
      return `${baseClasses} bg-gradient-to-r from-secondary to-secondary-light`;
    }

    return `${baseClasses} bg-gradient-to-r from-primary to-secondary-light`;
  };

  // Get session badge color
  const getSessionBadgeClasses = () => {
    if (sessionType === SessionType.REST) {
      return "bg-secondary/20 text-secondary border-secondary/30";
    }
    return "bg-primary/20 text-primary border-primary/30";
  };

  // If no active task, show placeholder
  if (!activeTask && !sessionDuration) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-2xl sm:text-3xl font-bold text-gradient mb-6">No Active Session</h2>
        <div className="text-[8rem] sm:text-[12rem] font-bold opacity-20 text-text-muted mb-8 leading-none">
          00:00
        </div>
        <p className="text-text-secondary text-center mb-8 max-w-md text-sm sm:text-base">
          Select a Pomodoro method to start your productive session.
        </p>

        {onShowTaskList && (
          <button
            onClick={onShowTaskList}
            className="btn btn-primary btn-lg animate-pulse-slow backdrop-blur-sm shadow-glow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Select a Task
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
        {/* Session Type Badge */}
        <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getSessionBadgeClasses()} mb-4 sm:mb-6 text-sm sm:text-base font-semibold`}>
          {/* Show completed session type when showing completion info, otherwise show current session type */}
          {(showCompletionInfo && completedSessionType ? completedSessionType : sessionType) === SessionType.FOCUS ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Focus Time
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Rest Time
            </>
          )}
        </div>

        {/* Main Timer Display */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {showCompletionInfo ? (
            <div className="text-center animate-fadeIn" onClick={handleStopAlarm}>
              <div className="text-[8rem] sm:text-[12rem] font-bold text-success mb-6 leading-none cursor-pointer">
                ✓
              </div>
              <p className="text-text-primary text-xl sm:text-2xl mb-2 font-bold">
                {completedSessionType === SessionType.FOCUS ? 'Focus Session Completed!' : 'Rest Time Completed!'}
              </p>
              <p className="text-text-secondary mb-6">
                Session duration: <span className="font-medium">{originalTime} minutes</span>
              </p>
              <div className={`${completedSessionType === SessionType.FOCUS ? 'bg-secondary/20' : 'bg-primary/20'} rounded-lg p-4 mb-6 max-w-xs mx-auto`}>
                <p className={`${completedSessionType === SessionType.FOCUS ? 'text-secondary-light' : 'text-primary-light'} font-medium`}>
                  {completedSessionType === SessionType.FOCUS ? 'Time for a rest!' : 'Ready for focus!'}
                </p>
                <p className="text-text-secondary text-sm mt-2">
                  {completedSessionType === SessionType.FOCUS ? 'Take a break and recharge' : 'Let\'s get back to work'}
                </p>
              </div>
              <p className="text-text-muted text-xs mt-2">
                Click anywhere to stop alarm
              </p>
            </div>
          ) : (
            <>
              <div className={getCountdownClasses()} onClick={showEndAlert ? handleStopAlarm : undefined} style={{ cursor: showEndAlert ? 'pointer' : 'default' }}>
                {formatTime(minutes)}:{formatTime(seconds)}
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-2xl h-3 bg-dark-accent/30 rounded-full mb-4 overflow-hidden">
                <div
                  className={getProgressBarClasses()}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              {/* Time metrics */}
              <div className="flex justify-between w-full max-w-2xl text-text-secondary text-sm sm:text-base mb-8">
                <div>
                  <span className="font-medium">Elapsed: </span>
                  {formatMinutes(Math.floor((sessionDuration || activeTask?.duration || 25) * progress))} min
                </div>
                <div>
                  <span className="font-medium">Remaining: </span>
                  {formatMinutes(Math.ceil((sessionDuration || activeTask?.duration || 25) * (1 - progress)))} min
                </div>
              </div>
            </>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mt-auto">
          {showEndAlert && (
            <button
              onClick={handleStopAlarm}
              className="btn btn-danger btn-lg animate-pulse"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Stop Alarm
            </button>
          )}

          {!showCompletionInfo && !showEndAlert && isRunning ? (
            <button
              onClick={pause}
              className={`btn ${isAlmostEnd ? 'btn-danger' : isNearEnd ? 'btn-warning' : sessionType === SessionType.REST ? 'btn-secondary' : 'btn-primary'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Pause
            </button>
          ) : !showCompletionInfo && (
            <button
              onClick={start}
              className={`btn ${isAlmostEnd ? 'btn-danger' : isNearEnd ? 'btn-warning' : sessionType === SessionType.REST ? 'btn-secondary' : 'btn-primary'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start
            </button>
          )}

          {!showCompletionInfo && !showEndAlert && (
            <button
              onClick={reset}
              className="btn btn-outline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Countdown;