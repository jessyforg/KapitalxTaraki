import React from 'react';

// Responsive Text Component Examples
const ResponsiveText = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Method 1: Tailwind Responsive Utilities */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
          Responsive Heading (Tailwind)
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">
          This text scales with screen size using Tailwind breakpoints.
        </p>
      </div>

      {/* Method 2: CSS Clamp() for Fluid Typography */}
      <div>
        <h2 className="fluid-heading font-bold">
          Fluid Heading (CSS Clamp)
        </h2>
        <p className="fluid-text text-gray-600">
          This text scales smoothly between min and max sizes.
        </p>
      </div>

      {/* Method 3: Component-specific responsive patterns */}
      <div className="dashboard-card">
        <h3 className="card-title">Dashboard Card</h3>
        <p className="card-description">
          Responsive card with contextual typography.
        </p>
      </div>

      {/* Method 4: Navigation responsive text */}
      <nav className="nav-responsive">
        <div className="nav-item">
          <span className="nav-text">Dashboard</span>
        </div>
        <div className="nav-item">
          <span className="nav-text">Users</span>
        </div>
      </nav>
    </div>
  );
};

export default ResponsiveText; 