import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Countdown from './components/Countdown';
import TaskList from './components/TaskList';
import TaskInput from './components/TaskInput';
import Modal from './components/Modal';
import FloatingActionButton from './components/FloatingActionButton';
import AnimatedBackground from './components/AnimatedBackground';
import MusicPlayer from './components/MusicPlayer';
import { useTasks } from './hooks/useTasks';
import './styles/music-player.css';

const App: React.FC = () => {
  const [taskListModalOpen, setTaskListModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

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

  const activeTask = getActiveTask();

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

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary relative overflow-hidden">
      {/* Animated interactive background */}
      <AnimatedBackground />
      
      {/* Content with lighter blur */}
      <div className="relative z-10 w-full h-full mx-auto flex flex-col min-h-screen backdrop-blur-[2px] bg-dark-bg/20">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 flex flex-col flex-1 max-w-full sm:max-w-7xl">
          <Header onShowAbout={() => setAboutModalOpen(true)} />
          
          <main className="py-2 sm:py-4 flex-1 flex flex-col items-center justify-center">
            {/* Centered countdown */}
            <div className="w-full max-w-xl sm:max-w-2xl px-2">
              <Countdown 
                activeTask={activeTask} 
                onCompleteTask={completeActiveTask}
                onShowTaskList={() => setTaskListModalOpen(true)}
              />
            </div>
          </main>
          
          <footer className="py-2 sm:py-3 text-center text-text-muted text-xs sm:text-sm border-t border-dark-accent/20">
            <p>&copy;{new Date().getFullYear()} Productive Countdown. Built for your better productivity.</p>
            <p className="mt-1">Created by <a href="https://bagaspra16-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light transition-colors">bagaspra16</a></p>
          </footer>
        </div>
      </div>
      
      {/* Music Player - positioned in the bottom left of the screen */}
      <MusicPlayer />
      
      {/* Floating Action Button - positioned away from screen edges on mobile */}
      <div className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-30">
        <FloatingActionButton 
          onShowTaskList={() => setTaskListModalOpen(true)}
          onShowAddTask={() => setAddTaskModalOpen(true)}
        />
      </div>
      
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
            <p className="text-text-secondary max-w-xl mx-auto text-xs sm:text-sm">Your personal productivity timer for focused work sessions</p>
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
                <li>Create a new task using the <strong>+</strong> button</li>
                <li>Give your task a title and duration</li>
                <li>Select a task from your task list</li>
                <li>Use the controls to manage your countdown</li>
                <li>Mark tasks as complete when done</li>
              </ol>
            </div>

            <div className="card bg-dark-accent/10 p-3 sm:p-4 hover:shadow-glow transition-all duration-300 border-l-4 border-l-secondary">
              <h3 className="font-semibold text-sm sm:text-base text-secondary mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Tips for Productivity
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-text-secondary text-xs sm:text-sm">
                <li>Break larger tasks into smaller chunks</li>
                <li>Use the 25-minute "Pomodoro" technique</li>
                <li>Take short breaks between work sessions</li>
                <li>Track completed tasks for motivation</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-dark-accent/20">
            <p className="text-text-secondary text-xs">
              Productive Countdown helps you stay focused and manage your time effectively.
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
