// Quick copy-paste alternatives for hamburger menu positioning
// Replace the mobile header section in AdminDashboard.js with any of these:

// Option 1: Floating Top-Left (Traditional)
const FloatingTopLeft = `
{/* Mobile Hamburger Button - Floating Top-Left */}
<button
  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
  className={\`
    hamburger-btn fixed top-4 left-4 z-50 p-3 rounded-xl bg-white shadow-lg border border-gray-200
    transition-all duration-300 hover:bg-orange-50 hover:border-orange-300 active:scale-95
    min-h-[48px] min-w-[48px] flex items-center justify-center
    \${isDesktop ? 'hidden' : 'flex'}
    \${isMobileSidebarOpen ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}
  \`}
  aria-label="Toggle menu"
>
  {isMobileSidebarOpen ? (
    <FiX size={24} className="text-white" />
  ) : (
    <FiMenu size={24} className="text-orange-600" />
  )}
</button>
`;

// Option 2: Floating Top-Right (Modern)
const FloatingTopRight = `
{/* Mobile Hamburger Button - Floating Top-Right */}
<button
  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
  className={\`
    hamburger-btn fixed top-4 right-4 z-50 p-3 rounded-full bg-white shadow-lg border border-gray-200
    transition-all duration-300 hover:bg-gray-50 hover:shadow-xl active:scale-95
    min-h-[48px] min-w-[48px] flex items-center justify-center
    \${isDesktop ? 'hidden' : 'flex'}
    \${isMobileSidebarOpen ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}
  \`}
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
`;

// Option 3: Floating Action Button (Bottom-Right)
const FloatingActionButton = `
{/* Mobile Hamburger Button - Floating Action Button */}
<button
  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
  className={\`
    hamburger-btn fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl
    transition-all duration-300 hover:shadow-3xl active:scale-95
    min-h-[56px] min-w-[56px] flex items-center justify-center
    \${isDesktop ? 'hidden' : 'flex'}
    \${isMobileSidebarOpen 
      ? 'bg-red-500 hover:bg-red-600' 
      : 'bg-orange-500 hover:bg-orange-600'
    }
  \`}
  aria-label="Toggle menu"
>
  {isMobileSidebarOpen ? (
    <FiX size={28} className="text-white" />
  ) : (
    <FiMenu size={28} className="text-white" />
  )}
</button>
`;

// Option 4: Minimal Header Bar
const MinimalHeader = `
{/* Mobile Header - Minimal with hamburger */}
<div className={\`\${isDesktop ? 'hidden' : 'block'}\`}>
  <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3">
    <div className="flex items-center justify-between">
      {/* Hamburger menu */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className={\`
          p-2 rounded-lg transition-all duration-300 active:scale-95
          min-h-[44px] min-w-[44px] flex items-center justify-center
          \${isMobileSidebarOpen 
            ? 'bg-orange-100 text-orange-600' 
            : 'hover:bg-gray-100 text-gray-700'
          }
        \`}
        aria-label="Toggle menu"
      >
        {isMobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Logo */}
      <span className="font-semibold text-gray-800">TARAKI</span>

      {/* Profile */}
      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
        A
      </div>
    </div>
  </div>
  <div className="h-16"></div>
</div>
`;

export { FloatingTopLeft, FloatingTopRight, FloatingActionButton, MinimalHeader }; 