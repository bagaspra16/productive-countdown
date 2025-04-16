import React, { useState } from 'react';

interface TaskInputProps {
  onAddTask: (title: string, duration: number, description?: string) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('25');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && parseInt(duration) > 0) {
      onAddTask(title, parseInt(duration), description || undefined);
      // Reset form
      setTitle('');
      setDuration('25');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="title" className="form-label">
          Task Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          placeholder="Enter task title"
          required
          autoFocus
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="duration" className="form-label">
            Duration (minutes) *
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="form-input"
            min="1"
            max="240"
            required
          />
        </div>
        
        <div className="space-y-1">
          <label className="form-label">Quick Duration</label>
          <div className="flex gap-1 flex-wrap">
            {[5, 15, 25, 45, 60].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => setDuration(mins.toString())}
                className={`px-2 py-1 rounded-lg text-sm font-medium transition-all
                  ${duration === mins.toString() 
                    ? 'bg-primary text-white' 
                    : 'bg-dark-accent/30 text-text-secondary hover:bg-dark-accent/50'}
                `}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-1">
        <label htmlFor="description" className="form-label">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input"
          placeholder="Enter task description"
          rows={2}
        />
      </div>
      
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          className="btn btn-sm btn-primary w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Task
        </button>
      </div>
    </form>
  );
};

export default TaskInput; 