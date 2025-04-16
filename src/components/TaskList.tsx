import React, { useState, useEffect } from 'react';
import { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onClearCompleted?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onSelectTask,
  onDeleteTask,
  onClearCompleted,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(activeTaskId);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);
  
  // Handle task click to select/deselect
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  };

  // Start the selected task
  const handleStartTask = () => {
    if (selectedTaskId) {
      onSelectTask(selectedTaskId);
    }
  };

  // Show a brief "Saved" message with smooth transition when tasks change
  useEffect(() => {
    // Skip on initial render
    if (tasks.length === 0) return;
    
    // Begin showing message with transition in
    setShowSavedMessage(true);
    // Small delay before setting visible for transition to work
    setTimeout(() => {
      setSavedMessageVisible(true);
    }, 50);
    
    // Start hiding with transition out
    const hideTimer = setTimeout(() => {
      setSavedMessageVisible(false);
      
      // Remove from DOM after transition completes
      const removeTimer = setTimeout(() => {
        setShowSavedMessage(false);
      }, 300); // match the CSS transition duration
      
      return () => clearTimeout(removeTimer);
    }, 1500);
    
    return () => clearTimeout(hideTimer);
  }, [tasks]);

  // Count completed tasks
  const completedTaskCount = tasks.filter(task => task.isCompleted).length;

  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-text-secondary/50 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-text-secondary">No tasks added yet</p>
        <p className="text-text-secondary/70 text-sm mt-1">
          Add a task to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-220px)]">
      <div className="flex justify-between items-center mb-3 relative h-6">
        <div className="text-sm text-text-secondary">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {completedTaskCount} completed
        </div>
        
        {/* Saved locally message with smooth transitions */}
        {showSavedMessage && (
          <div 
            className={`absolute right-0 top-0 text-xs text-primary/80 flex items-center 
              bg-primary/5 rounded-full py-1 px-2 
              transition-all duration-300 ease-in-out
              ${savedMessageVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform -translate-y-2'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Saved locally
          </div>
        )}
      </div>

      {/* Task list with optimized scrolling */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-2 pr-1 custom-scrollbar task-scrollbar scroll-fade-bottom">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer
                ${task.isCompleted ? 'opacity-60 ' : ''}
                ${task.id === activeTaskId 
                  ? 'bg-primary/10 border-primary shadow-sm' 
                  : task.id === selectedTaskId 
                    ? 'bg-dark-accent/20 border-dark-accent/40 shadow-sm' 
                    : 'bg-card border-dark-accent/10 hover:border-dark-accent/30'
                }`}
              onClick={() => handleTaskClick(task.id)}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-text-primary flex items-center gap-2">
                    {task.title}
                    {task.isCompleted && (
                      <span className="text-xs px-2 py-1 bg-success/20 text-success rounded-full">
                        COMPLETED
                      </span>
                    )}
                    {task.id === activeTaskId && (
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                        ACTIVE
                      </span>
                    )}
                    {task.id === selectedTaskId && task.id !== activeTaskId && (
                      <span className="text-xs px-2 py-1 bg-dark-accent/20 text-text-secondary rounded-full">
                        SELECTED
                      </span>
                    )}
                  </h3>
                  {task.description && (
                    <p className="text-text-secondary text-sm mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="text-text-secondary text-sm">
                  {task.duration} min
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Task action buttons - sticky at the bottom */}
      <div className="mt-4 pt-3 border-t border-dark-accent/10">
        {selectedTaskId && selectedTaskId !== activeTaskId && !tasks.find(t => t.id === selectedTaskId)?.isCompleted && (
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setSelectedTaskId(null)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleStartTask}
              className="btn btn-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Start Task
            </button>
          </div>
        )}
        
        <div className="flex justify-between">
          {completedTaskCount > 0 && onClearCompleted && (
            <button
              onClick={onClearCompleted}
              className="btn btn-outline text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Clear Completed
            </button>
          )}
          
          {selectedTaskId && (
            <button
              onClick={() => onDeleteTask(selectedTaskId)}
              className="btn btn-danger ml-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList; 