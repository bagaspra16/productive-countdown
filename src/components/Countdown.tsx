import React, { useEffect, useCallback } from 'react';
import { Task } from '../types/task';
import { useCountdown } from '../hooks/useCountdown';
import CountdownAlert from './CountdownAlert';

interface CountdownProps {
  activeTask: Task | null;
  onCompleteTask: () => void;
  onShowTaskList?: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ activeTask, onCompleteTask, onShowTaskList }) => {
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
    closeAlert,
  } = useCountdown({
    initialTime: activeTask?.duration || 25,
    onComplete: onCompleteTask,
  });

  // Handle task completion and alert closing
  const handleCloseAlert = useCallback(() => {
    console.log('Countdown component: closing alert');
    closeAlert();
  }, [closeAlert]);

  // Reset timer when active task changes
  useEffect(() => {
    if (activeTask) {
      reset();
    }
  }, [activeTask, reset]);

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

  // Get dynamic classes based on countdown state
  const getCountdownClasses = () => {
    const baseClasses = "countdown mb-6";
    
    if (isAlmostEnd) {
      return `${baseClasses} text-danger animate-pulse`;
    }
    
    if (isNearEnd) {
      return `${baseClasses} text-warning`;
    }
    
    return baseClasses;
  };

  // Get progress bar classes based on countdown state
  const getProgressBarClasses = () => {
    const baseClasses = "h-full rounded-full transition-all duration-300 ease-out";
    
    if (isAlmostEnd) {
      return `${baseClasses} bg-danger animate-pulse`;
    }
    
    if (isNearEnd) {
      return `${baseClasses} bg-warning`;
    }
    
    return `${baseClasses} bg-gradient-to-r from-primary to-secondary-light`;
  };

  // Background classes for the card based on countdown state
  const getCardClasses = () => {
    const baseClasses = "card h-[62vh] flex flex-col backdrop-blur-lg bg-dark-surface/70 border-dark-accent/30 shadow-lg transition-all duration-500";
    
    if (isAlmostEnd) {
      return `${baseClasses} border-danger border-2 shadow-danger/20`;
    }
    
    if (isNearEnd) {
      return `${baseClasses} border-warning/70 shadow-warning/20`;
    }
    
    return baseClasses;
  };

  // If no active task, show placeholder
  if (!activeTask) {
    return (
      <div className="card h-[62vh] flex flex-col items-center justify-center backdrop-blur-lg bg-dark-surface/60 border-dark-accent/20 shadow-lg">
        <h2 className="text-xl font-bold text-gradient mb-4">No Active Task</h2>
        <div className="countdown opacity-30 mb-6">
          00:00
        </div>
        <p className="text-text-secondary text-center mb-6 max-w-md text-sm">
          Use the button below to select a task and start your productive countdown.
        </p>
        
        {onShowTaskList && (
          <button 
            onClick={onShowTaskList}
            className="btn btn-primary mt-2 animate-pulse-slow backdrop-blur-sm shadow-glow"
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
      <div className={getCardClasses()}>
        <div className="text-center mb-2">
          <h2 className={`text-xl font-bold ${isAlmostEnd ? 'text-danger' : isNearEnd ? 'text-warning' : 'text-gradient'}`}>
            {activeTask.title}
          </h2>
          
          {activeTask.description && (
            <p className="text-text-secondary mt-1 max-w-md mx-auto text-sm">
              {activeTask.description}
            </p>
          )}
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          {showCompletionInfo ? (
            <div className="text-center mb-4 animate-fadeIn">
              <div className="countdown mb-6 text-success">
                Completed!
              </div>
              <p className="text-text-primary mb-2">
                You've completed <span className="font-bold text-success">{activeTask.title}</span>
              </p>
              <p className="text-text-secondary mb-4">
                Task duration: <span className="font-medium">{originalTime} minutes</span>
              </p>
              <div className="bg-success/20 rounded-lg p-3 mb-4 max-w-xs mx-auto">
                <p className="text-success-light font-medium">Great job! 👏</p>
                <p className="text-text-secondary text-sm">Press Reset to start a new countdown</p>
              </div>
            </div>
          ) : (
            <>
              <div className={getCountdownClasses()}>
                {formatTime(minutes)}:{formatTime(seconds)}
              </div>
              
              {/* Progress bar */}
              <div className="w-full max-w-md h-2 bg-dark-accent/30 rounded-full mb-2 overflow-hidden">
                <div 
                  className={getProgressBarClasses()}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              
              {/* Time metrics */}
              <div className="flex justify-between w-full max-w-md text-text-secondary text-xs mb-4">
                <div>
                  <span className="font-medium">Time Elapsed: </span>
                  {formatMinutes(Math.floor(activeTask.duration * progress))} min
                </div>
                <div>
                  <span className="font-medium">Time Remaining: </span>
                  {formatMinutes(Math.ceil(activeTask.duration * (1 - progress)))} min
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mt-auto">
          {!showCompletionInfo && isRunning ? (
            <button
              onClick={pause}
              className={`btn btn-sm ${isAlmostEnd ? 'btn-danger' : isNearEnd ? 'btn-warning' : 'btn-primary'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Pause
            </button>
          ) : !showCompletionInfo && (
            <button
              onClick={start}
              className={`btn btn-sm ${isAlmostEnd ? 'btn-danger' : isNearEnd ? 'btn-warning' : 'btn-primary'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start
            </button>
          )}
          
          <button
            onClick={reset}
            className={`btn btn-sm ${showCompletionInfo ? 'btn-success' : 'btn-outline'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            {showCompletionInfo ? 'Start New Countdown' : 'Reset'}
          </button>
          
          {!showCompletionInfo && (
            <button
              onClick={onCompleteTask}
              className="btn btn-sm btn-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Complete
            </button>
          )}
          
          {onShowTaskList && (
            <button
              onClick={onShowTaskList}
              className="btn btn-sm btn-outline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Change Task
            </button>
          )}
        </div>
      </div>
      
      {/* End alert modal */}
      {activeTask && (
        <CountdownAlert 
          isOpen={showEndAlert} 
          taskTitle={activeTask.title}
          onClose={handleCloseAlert} 
        />
      )}
    </>
  );
};

export default Countdown; 