import React from 'react';
import { FiX } from 'react-icons/fi';

const MobileSidebar = ({ 
  isOpen, 
  onClose, 
  children,
  title = 'Menu',
  position = 'left' // 'left' or 'right'
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 ${position}-0 z-50 w-64 bg-white dark:bg-[#232526] shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
            aria-label="Close menu"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};

export default MobileSidebar; 