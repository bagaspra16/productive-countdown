import React, { useEffect, useRef, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle opening and closing animations
  useEffect(() => {
    if (isOpen) {
      // When opening, show immediately and then animate in
      setIsAnimatingOut(false);
      setIsVisible(true);
      // Prevent scrolling on the body
      document.body.style.overflow = 'hidden';
    } else if (isVisible) {
      // When closing, animate out first
      setIsAnimatingOut(true);
      
      // Wait for animation to complete before removing from DOM
      const animationTimer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = ''; // Restore scrolling
      }, 300); // Match the CSS transition duration
      
      return () => clearTimeout(animationTimer);
    }
  }, [isOpen, isVisible]);

  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isVisible && !isAnimatingOut) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, isAnimatingOut]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isVisible && !isAnimatingOut) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, isAnimatingOut]);

  // Custom close handler with animation
  const handleClose = () => {
    setIsAnimatingOut(true);
    // Let animation complete before calling the actual onClose
    setTimeout(() => {
      onClose();
    }, 200); // Slightly shorter than animation to ensure smooth transitions
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop with fade transition */}
      <div 
        className={`fixed inset-0 z-40 bg-dark-bg/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isAnimatingOut ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />
      
      {/* Modal container with slide and fade transition */}
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
          <div 
            ref={modalRef}
            className={`relative transform overflow-hidden rounded-t-xl sm:rounded-xl bg-dark-surface/90 border border-dark-accent/30 shadow-xl transition-all duration-300 ease-out w-full sm:max-w-lg text-left ${
              isAnimatingOut 
                ? 'opacity-0 translate-y-10 sm:scale-95' 
                : 'opacity-100 translate-y-0 sm:scale-100'
            } flex flex-col max-h-[95vh] sm:max-h-[85vh]`}
          >
            {/* Modal header - now sticky */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-accent/20 bg-dark-surface/95 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gradient">{title}</h2>
              <button 
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-dark-accent/30 text-text-secondary hover:text-text-primary transition-colors duration-200"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal body - flex-grow for proper height allocation */}
            <div className="p-4 flex-1 overflow-hidden">
              {children}
            </div>
            
            {/* Modal footer (optional) - now sticky */}
            {footer && (
              <div className="px-4 py-3 border-t border-dark-accent/20 bg-dark-surface/95 sticky bottom-0">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal; 