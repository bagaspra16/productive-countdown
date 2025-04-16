import React from 'react';

interface HeaderProps {
  onShowAbout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowAbout }) => {
  return (
    <header className="py-3 px-1 sm:px-2 flex items-center justify-between w-full">
      <div className="flex items-center space-x-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gradient">Productive Countdown</h1>
      </div>
      
      <div className="flex items-center">
        {onShowAbout && (
          <button 
            onClick={onShowAbout}
            className="btn btn-outline btn-sm ml-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About
          </button>
        )}
      </div>
    </header>
  );
};

export default Header; 