import React, { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

// Different hamburger menu positioning options
const HamburgerMenuOptions = ({ isMobileSidebarOpen, setIsMobileSidebarOpen, isDesktop }) => {
  const [currentOption, setCurrentOption] = useState('top-right');

  // Option 1: Top-right corner (Most common and thumb-friendly)
  const TopRightHamburger = () => (
    <button
      onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      className={`
        fixed top-4 right-4 z-50 p-3 rounded-full bg-white shadow-lg border border-gray-200
        transition-all duration-300 hover:bg-gray-50 hover:shadow-xl active:scale-95
        min-h-[48px] min-w-[48px] flex items-center justify-center
        ${isDesktop ? 'hidden' : 'flex'}
        ${isMobileSidebarOpen ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}
      `}
      aria-label="Toggle menu"
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {isMobileSidebarOpen ? (
        <FiX size={24} className="text-white" />
      ) : (
        <FiMenu size={24} className="text-gray-700" />
      )}
    </button>
  );

  // Option 2: Top-left with better spacing (Traditional placement)
  const TopLeftHamburger = () => (
    <button
      onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      className={`
        fixed top-6 left-6 z-50 p-3 rounded-xl bg-white shadow-lg border border-gray-200
        transition-all duration-300 hover:bg-orange-50 hover:border-orange-300 active:scale-95
        min-h-[48px] min-w-[48px] flex items-center justify-center
        ${isDesktop ? 'hidden' : 'flex'}
        ${isMobileSidebarOpen ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}
      `}
      aria-label="Toggle menu"
    >
      {isMobileSidebarOpen ? (
        <FiX size={24} className="text-white" />
      ) : (
        <FiMenu size={24} className="text-orange-600" />
      )}
    </button>
  );

  // Option 3: Floating action button style (Bottom-right)
  const FloatingActionButton = () => (
    <button
      onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      className={`
        fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl
        transition-all duration-300 hover:shadow-3xl active:scale-95
        min-h-[56px] min-w-[56px] flex items-center justify-center
        ${isDesktop ? 'hidden' : 'flex'}
        ${isMobileSidebarOpen 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-orange-500 hover:bg-orange-600'
        }
      `}
      aria-label="Toggle menu"
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {isMobileSidebarOpen ? (
        <FiX size={28} className="text-white" />
      ) : (
        <FiMenu size={28} className="text-white" />
      )}
    </button>
  );

  // Option 4: Header bar integrated (Most professional)
  const HeaderIntegratedHamburger = () => (
    <div className={`${isDesktop ? 'hidden' : 'block'}`}>
      {/* Mobile header bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-semibold text-gray-800">TARAKI</span>
          </div>

          {/* Hamburger button */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className={`
              p-2 rounded-lg transition-all duration-300 active:scale-95
              min-h-[44px] min-w-[44px] flex items-center justify-center
              ${isMobileSidebarOpen 
                ? 'bg-orange-100 text-orange-600' 
                : 'hover:bg-gray-100 text-gray-700'
              }
            `}
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? (
              <FiX size={24} />
            ) : (
              <FiMenu size={24} />
            )}
          </button>
        </div>
      </div>
      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </div>
  );

  // Option 5: Bottom navigation style (Modern mobile app style)
  const BottomNavigationHamburger = () => (
    <div className={`${isDesktop ? 'hidden' : 'block'}`}>
      {/* Bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200">
        <div className="flex items-center justify-around py-2 px-4">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className={`
              p-3 rounded-xl transition-all duration-300 active:scale-95
              min-h-[48px] min-w-[48px] flex flex-col items-center justify-center
              ${isMobileSidebarOpen 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }
            `}
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? (
              <FiX size={24} />
            ) : (
              <FiMenu size={24} />
            )}
            <span className="text-xs mt-1 font-medium">Menu</span>
          </button>
          
          {/* Other navigation items */}
          <button className="p-3 rounded-xl text-gray-600 hover:text-orange-600 hover:bg-orange-50 min-h-[48px] min-w-[48px] flex flex-col items-center justify-center">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-xs mt-1 font-medium">Home</span>
          </button>
          
          <button className="p-3 rounded-xl text-gray-600 hover:text-orange-600 hover:bg-orange-50 min-h-[48px] min-w-[48px] flex flex-col items-center justify-center">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-xs mt-1 font-medium">Profile</span>
          </button>
        </div>
      </div>
      {/* Spacer for fixed bottom nav */}
      <div className="h-20"></div>
    </div>
  );

  // Render the selected option
  const renderHamburgerOption = () => {
    switch (currentOption) {
      case 'top-right':
        return <TopRightHamburger />;
      case 'top-left':
        return <TopLeftHamburger />;
      case 'floating':
        return <FloatingActionButton />;
      case 'header-integrated':
        return <HeaderIntegratedHamburger />;
      case 'bottom-nav':
        return <BottomNavigationHamburger />;
      default:
        return <TopRightHamburger />;
    }
  };

  return (
    <div>
      {/* Demo selector (remove this in production) */}
      <div className="fixed top-20 left-4 z-50 bg-white/90 backdrop-blur-md rounded-lg p-3 shadow-lg border border-gray-200 sm:hidden">
        <div className="text-xs font-medium text-gray-700 mb-2">Hamburger Style:</div>
        <select 
          value={currentOption} 
          onChange={(e) => setCurrentOption(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1"
        >
          <option value="top-right">Top Right (Current)</option>
          <option value="top-left">Top Left</option>
          <option value="floating">Floating FAB</option>
          <option value="header-integrated">Header Integrated</option>
          <option value="bottom-nav">Bottom Navigation</option>
        </select>
      </div>
      
      {/* Render the selected hamburger menu */}
      {renderHamburgerOption()}
    </div>
  );
};

export default HamburgerMenuOptions; 