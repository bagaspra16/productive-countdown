import React, { useState } from 'react';

interface FABProps {
  onShowTaskList: () => void;
  onShowAddTask: () => void;
  onShowAbout?: () => void;
}

const FloatingActionButton: React.FC<FABProps> = ({ onShowTaskList, onShowAddTask }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleTaskListClick = () => {
    onShowTaskList();
    setIsOpen(false);
  };

  const handleAddTaskClick = () => {
    onShowAddTask();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 inline-flex flex-col items-center">
      {/* Child buttons - they appear when menu is open */}
      <div className={`flex flex-col items-center gap-3 mb-3 transition-all duration-500 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        {/* Task List button */}
        <button 
          className="w-10 h-10 rounded-full bg-primary-dark/90 backdrop-blur-sm shadow-lg border border-primary-light/30 flex items-center justify-center text-white 
                  transition-all duration-300 hover:scale-110 hover:shadow-glow"
          onClick={handleTaskListClick}
          aria-label="Show Task List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>
        
        {/* Add Task button */}
        <button 
          className="w-10 h-10 rounded-full bg-secondary/90 backdrop-blur-sm shadow-lg border border-secondary-light/30 flex items-center justify-center text-white 
                  transition-all duration-300 hover:scale-110 hover:shadow-glow"
          onClick={handleAddTaskClick}
          aria-label="Add Task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      {/* Main FAB button */}
      <button 
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary backdrop-blur-sm 
                border border-primary-light/30 shadow-glow flex items-center justify-center text-white
                transition-all duration-500 ease-in-out hover:rotate-180 ${isOpen ? 'rotate-45' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default FloatingActionButton; 