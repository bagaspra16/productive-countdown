import React, { useState } from 'react';
import { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onSelectTask,
  onDeleteTask,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(activeTaskId);

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
    <div className="space-y-4">
      <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`mb-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer
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
      
      {selectedTaskId && selectedTaskId !== activeTaskId && (
        <div className="flex justify-between sticky bottom-0 pt-3 border-t border-dark-accent/10">
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
      
      <div className="flex justify-end mt-2">
        {selectedTaskId && (
          <button
            onClick={() => onDeleteTask(selectedTaskId)}
            className="btn btn-danger"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Selected Task
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskList; 