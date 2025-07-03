import React, { useState, useEffect } from 'react';
import { FiMenu, FiX, FiHome, FiUsers, FiSettings, FiBarChart2, FiCalendar } from 'react-icons/fi';
import { useBreakpoint } from '../hooks/useScreenSize';

const ResponsiveSidebar = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDesktop, isMobile } = useBreakpoint();

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(false); // Reset mobile sidebar state
    }
  }, [isDesktop]);

  // Close sidebar when clicking outside (mobile only)
  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest('.sidebar-container') && !event.target.closest('.hamburger-btn')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, isMobile]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen, isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
    { id: 'users', label: 'Users', icon: <FiUsers size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <FiBarChart2 size={20} /> },
    { id: 'events', label: 'Events', icon: <FiCalendar size={20} /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Hamburger Button - Only show on small screens */}
      <button
        onClick={toggleSidebar}
        className={`
          hamburger-btn fixed top-4 left-4 z-50 p-3 rounded-lg bg-white shadow-lg border border-gray-200
          transition-all duration-300 hover:bg-gray-50
          ${isDesktop ? 'hidden' : 'block'}
          ${isSidebarOpen ? 'translate-x-64' : 'translate-x-0'}
        `}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <FiX size={24} className="text-gray-700" />
        ) : (
          <FiMenu size={24} className="text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay - Only show on mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          sidebar-container fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40
          transform transition-transform duration-300 ease-in-out
          ${isDesktop 
            ? 'translate-x-0' // Always visible on desktop
            : isSidebarOpen 
              ? 'translate-x-0' // Slide in on mobile when open
              : '-translate-x-full' // Hidden on mobile when closed
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">
              Your Brand
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  // Handle navigation here
                  console.log(`Navigate to ${item.id}`);
                  
                  // Close mobile sidebar after navigation
                  if (isMobile) {
                    setIsSidebarOpen(false);
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors hover:bg-gray-100 focus:bg-gray-100 group"
              >
                <span className="text-gray-500 group-hover:text-orange-600">
                  {item.icon}
                </span>
                <span className="text-gray-700 group-hover:text-orange-600 font-medium">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Footer/User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@example.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300
          ${isDesktop ? 'ml-64' : 'ml-0'}
          min-h-screen
        `}
      >
        {/* Content padding to account for mobile hamburger button */}
        <div className={`${isDesktop ? 'p-8' : 'pt-20 p-4'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default ResponsiveSidebar; 