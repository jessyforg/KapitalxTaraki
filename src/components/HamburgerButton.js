import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const HamburgerButton = ({
  isOpen,
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 tablet-m:bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white 
        rounded-full p-3 shadow-lg transition-all duration-300 z-50 transform hover:scale-110 mt-4
        ${isOpen ? 'rotate-90' : 'rotate-0'}
        ${className}
      `}
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <FiX className="w-6 h-6" />
      ) : (
        <FiMenu className="w-6 h-6" />
      )}
    </button>
  );
};

export default HamburgerButton; 