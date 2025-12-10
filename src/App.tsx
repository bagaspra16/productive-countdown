import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Countdown from './components/Countdown';
import TaskList from './components/TaskList';
import TaskInput from './components/TaskInput';
import Modal from './components/Modal';
import AnimatedBackground from './components/AnimatedBackground';
import MusicPlayer from './components/MusicPlayer';
import PomodoroMethodSelector from './components/PomodoroMethodSelector';
import { useTasks } from './hooks/useTasks';
import { usePomodoro } from './hooks/usePomodoro';
import { PomodoroMethod, SessionType } from './types/pomodoro';
import './styles/music-player.css';

const App: React.FC = () => {
  const [taskListModalOpen, setTaskListModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [methodSelectorOpen, setMethodSelectorOpen] = useState(false);
  const [lastCompletedSessionType, setLastCompletedSessionType] = useState<SessionType | null>(null);

  const {
    tasks,
    activeTaskId,
    addTask,
    removeTask,
    startTask,
    completeActiveTask,
    getActiveTask,
    clearCompletedTasks,
  } = useTasks();

  const {
    currentMethod,
    currentSession,
    cycleCount,
    setMethod,
    startFocusSession,
    completeCurrentSession,
    startNextSession,
    clearMethod,
  } = usePomodoro({
    onSessionComplete: (session) => {
      console.log('Session completed:', session);
      // Store the completed session type so it persists after currentSession becomes null
      setLastCompletedSessionType(session.type);
    },
  });

  const activeTask = getActiveTask();

  // Show method selector if no method is selected
  useEffect(() => {
    if (!currentMethod) {
      setMethodSelectorOpen(true);
    } else {
      setMethodSelectorOpen(false);
    }
  }, [currentMethod]);

  // Auto-start first focus session when method is selected
  useEffect(() => {
    if (currentMethod && !currentSession) {
      startFocusSession();
    }
  }, [currentMethod, currentSession, startFocusSession]);

  const handleAddTask = (title: string, duration: number, description?: string) => {
    const newTaskId = addTask({ title, duration, description });
    setAddTaskModalOpen(false);

    // Option to start the task immediately
    if (tasks.length === 0) {
      startTask(newTaskId);
    }
  };

  const handleSelectTask = (taskId: string) => {
    startTask(taskId);
    setTaskListModalOpen(false);
  };

  const handleSelectMethod = (method: PomodoroMethod) => {
    setMethod(method);
    setMethodSelectorOpen(false);
  };

  const handleChangeMethod = () => {
    clearMethod();
    setMethodSelectorOpen(true);
  };

  const handleCompleteSession = () => {
    completeCurrentSession();
  };

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary relative overflow-hidden">
      {/* Animated interactive background */}
      <AnimatedBackground />

      {/* Content with lighter blur */}
      <div className="relative z-10 w-full h-full mx-auto flex flex-col min-h-screen backdrop-blur-[2px] bg-dark-bg/20">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 flex flex-col flex-1 max-w-full sm:max-w-7xl">
          <Header onShowAbout={() => setAboutModalOpen(true)} />

          <main className="py-2 sm:py-4 flex-1 flex flex-col items-center justify-center">
            {/* Show method selector or countdown */}
            {methodSelectorOpen ? (
              <PomodoroMethodSelector onSelectMethod={handleSelectMethod} />
            ) : (
              <div className="w-full max-w-6xl px-2">
                {/* Pomodoro Info Bar */}
                {currentMethod && (
                  <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-6 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-text-secondary">
                        <span className="font-semibold text-text-primary">{currentMethod.name}</span>
                        <span className="mx-2">•</span>
                        <span>{currentMethod.focusDuration}m focus / {currentMethod.restDuration}m rest</span>
                      </div>
                      {cycleCount > 0 && (
                        <>
                          <span className="text-text-muted">•</span>
                          <div className="text-sm text-text-secondary">
                            <span className="font-semibold text-primary">{cycleCount}</span> cycles completed
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={handleChangeMethod}
                      className="btn btn-sm btn-outline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Change Method
                    </button>
                  </div>
                )}

                <Countdown
                  activeTask={activeTask}
                  onCompleteTask={handleCompleteSession}
                  onShowTaskList={() => setTaskListModalOpen(true)}
                  sessionType={currentSession?.type || lastCompletedSessionType || SessionType.FOCUS}
                  sessionDuration={currentSession?.duration}
                  onStartNextSession={startNextSession}
                />
              </div>
            )}
          </main>

          <footer className="py-2 sm:py-3 text-center text-text-muted text-xs sm:text-sm border-t border-dark-accent/20">
            <p>&copy;{new Date().getFullYear()} Productive Countdown. Built for your better productivity.</p>
            <p className="mt-1">Created by <a href="https://bagaspra16-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light transition-colors">bagaspra16</a></p>
          </footer>
        </div>
      </div>

      {/* Music Player - positioned in the bottom left of the screen */}
      <MusicPlayer />

      {/* Task List Modal */}
      <Modal
        isOpen={taskListModalOpen}
        onClose={() => setTaskListModalOpen(false)}
        title="Task Management"
      >
        <TaskList
          tasks={tasks}
          activeTaskId={activeTaskId}
          onSelectTask={handleSelectTask}
          onDeleteTask={removeTask}
          onClearCompleted={clearCompletedTasks}
        />
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={addTaskModalOpen}
        onClose={() => setAddTaskModalOpen(false)}
        title="Add New Task"
      >
        <div className="px-2">
          <TaskInput onAddTask={handleAddTask} />
        </div>
      </Modal>

      {/* About Modal */}
      <Modal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        title="About Productive Countdown"
      >
        <div className="p-3 space-y-4 sm:space-y-6 custom-scrollbar">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gradient mb-2">Welcome to Productive Countdown</h2>
            <p className="text-text-secondary max-w-xl mx-auto text-xs sm:text-sm">Your personal Pomodoro timer for focused work sessions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="card bg-dark-accent/10 p-3 sm:p-4 hover:shadow-glow transition-all duration-300 border-l-4 border-l-primary">
              <h3 className="font-semibold text-sm sm:text-base text-primary mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Getting Started
              </h3>
              <ol className="list-decimal pl-5 space-y-1 text-text-secondary text-xs sm:text-sm">
                <li>Choose a Pomodoro method (Classic 25/5 or Extended 45/15)</li>
                <li>Or create your own custom focus/rest intervals</li>
                <li>Start your focus session and stay productive</li>
                <li>Take breaks when the rest timer begins</li>
                <li>Track your completed cycles</li>
              </ol>
            </div>

            <div className="card bg-dark-accent/10 p-3 sm:p-4 hover:shadow-glow transition-all duration-300 border-l-4 border-l-secondary">
              <h3 className="font-semibold text-sm sm:text-base text-secondary mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Pomodoro Benefits
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-text-secondary text-xs sm:text-sm">
                <li>Improved focus and concentration</li>
                <li>Better time management</li>
                <li>Reduced mental fatigue</li>
                <li>Increased productivity</li>
                <li>Regular breaks prevent burnout</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-dark-accent/20">
            <p className="text-text-secondary text-xs">
              Productive Countdown helps you stay focused with the proven Pomodoro Technique.
              <br />
              Built with modern web technologies.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
