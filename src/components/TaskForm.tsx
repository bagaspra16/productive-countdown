import React, { useState } from 'react';
import { Task } from '../types/task';

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('25');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }
    
    if (isNaN(Number(duration)) || Number(duration) <= 0) {
      setError('Please enter a valid duration');
      return;
    }
    
    // Create new task and call the onAddTask function
    onAddTask({
      title: title.trim(),
      description: description.trim(),
      duration: Number(duration),
      isActive: false
    });
    
    // Reset form fields
    setTitle('');
    setDescription('');
    setDuration('25');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1.5">
          Task Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to focus on?"
          className="w-full px-4 py-2.5 rounded-lg border border-dark-accent/20 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
          autoFocus
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1.5">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any details about your task"
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-dark-accent/20 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
        />
      </div>
      
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-text-secondary mb-1.5">
          Duration (minutes)
        </label>
        <div className="flex items-center">
          <input
            id="duration"
            type="number"
            min="1"
            max="240"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-dark-accent/20 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
          />
          <div className="flex space-x-2 ml-3">
            {[5, 15, 25, 30, 45, 60].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setDuration(time.toString())}
                className={`text-xs py-1 px-2 rounded ${
                  Number(duration) === time
                    ? 'bg-primary/20 text-primary'
                    : 'bg-dark-accent/10 text-text-secondary hover:bg-dark-accent/20'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-dark-accent/20 hover:bg-dark-accent/10 text-text-secondary transition-colors duration-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Task
        </button>
      </div>
    </form>
  );
};

export default TaskForm; 