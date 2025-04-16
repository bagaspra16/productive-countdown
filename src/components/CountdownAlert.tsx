import React, { useEffect, useState } from 'react';

interface CountdownAlertProps {
  isOpen: boolean;
  taskTitle: string;
  onClose: () => void;
}

const CountdownAlert: React.FC<CountdownAlertProps> = ({ isOpen, taskTitle, onClose }) => {
  // State to ensure animation works properly
  const [isVisible, setIsVisible] = useState(false);
  
  // Control visibility with animation delay
  useEffect(() => {
    let timeout: number | undefined;
    
    if (isOpen) {
      console.log("Alert opening");
      // Small delay for proper animation
      timeout = window.setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
    
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [isOpen]);

  // Add keyboard event listener to close alert with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => e.stopPropagation()} // Prevent click-through
    >
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-dark-bg/80 backdrop-blur-md"
        onClick={onClose}
      ></div>
      
      {/* Alert content */}
      <div className={`relative bg-gradient-to-br from-danger/90 to-danger-dark/90 rounded-xl shadow-xl p-5 max-w-sm w-full z-10 
                     border-2 border-danger-light transition-all duration-300 transform ${isVisible ? 'scale-100' : 'scale-95'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-full bg-danger-light/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-danger-light animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-danger-dark text-white transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">Waktu Sudah Habis!</h2>
        <p className="text-white/80 mb-4 text-sm">
          Tugas <span className="font-semibold text-white">"{taskTitle}"</span> telah selesai.
        </p>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-full py-2 bg-white text-danger font-medium rounded-lg hover:bg-white/90 transition-colors duration-200 flex items-center justify-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Tutup
        </button>
      </div>
    </div>
  );
};

export default CountdownAlert; 