import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling on the body when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className={`modal-backdrop ${isOpen ? 'active' : ''} backdrop-blur-sm`}></div>
      <div className={`modal ${isOpen ? 'active' : ''}`}>
        <div className="modal-content max-w-lg backdrop-blur-xl bg-dark-surface/80 border border-dark-accent/30 shadow-lg rounded-xl animate-fadeIn" ref={modalRef}>
          <div className="modal-header bg-transparent border-b border-dark-accent/20">
            <h2 className="text-lg font-bold text-gradient">{title}</h2>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-dark-accent/30 text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="modal-body custom-scrollbar bg-transparent">
            {children}
          </div>
          {footer && (
            <div className="modal-footer bg-transparent border-t border-dark-accent/20">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal; 