import React from 'react';
import { useBreakpoint, useScreenSize, useDeviceDetection } from '../hooks/useScreenSize';
import ResponsiveSidebar from './ResponsiveSidebar';
import ResponsiveText from './ResponsiveText';
import '../styles/responsive-text.css';

const ResponsiveExample = () => {
  const { breakpoint, isDesktop, isMobile, isTablet } = useBreakpoint();
  const screenSize = useScreenSize();
  const deviceInfo = useDeviceDetection();

  return (
    <ResponsiveSidebar>
      <div className="space-y-8">
        {/* Debug Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="dashboard-title text-blue-800 mb-4">
            Responsive Debug Info
          </h2>
          
          <div className="responsive-grid">
            <div className="dashboard-card">
              <h3 className="card-title">Screen Info</h3>
              <div className="body-text-responsive text-gray-600 space-y-1">
                <p>Width: {screenSize.width}px</p>
                <p>Height: {screenSize.height}px</p>
                <p>Breakpoint: <span className="font-semibold">{breakpoint}</span></p>
                <p>Device Pixel Ratio: {screenSize.devicePixelRatio}</p>
                <p>High DPI: {screenSize.isHighDPI ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="dashboard-card">
              <h3 className="card-title">Device Type</h3>
              <div className="body-text-responsive text-gray-600 space-y-1">
                <p>Mobile: <span className={`font-semibold ${isMobile ? 'text-green-600' : 'text-red-600'}`}>
                  {isMobile ? 'Yes' : 'No'}
                </span></p>
                <p>Tablet: <span className={`font-semibold ${isTablet ? 'text-green-600' : 'text-red-600'}`}>
                  {isTablet ? 'Yes' : 'No'}
                </span></p>
                <p>Desktop: <span className={`font-semibold ${isDesktop ? 'text-green-600' : 'text-red-600'}`}>
                  {isDesktop ? 'Yes' : 'No'}
                </span></p>
                <p>Touch Device: {deviceInfo.isTouchDevice ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="dashboard-card">
              <h3 className="card-title">Current Layout</h3>
              <div className="body-text-responsive text-gray-600 space-y-1">
                <p>Sidebar: {isDesktop ? 'Always Visible' : 'Hidden/Hamburger'}</p>
                <p>Grid Columns: 
                  <span className="md:hidden"> 1 (Mobile)</span>
                  <span className="hidden md:block lg:hidden"> 2 (Tablet)</span>
                  <span className="hidden lg:block xl:hidden"> 3 (Desktop)</span>
                  <span className="hidden xl:block"> 4 (Large)</span>
                </p>
                <p>Font Size: 
                  <span className="text-sm md:hidden">Small</span>
                  <span className="hidden md:block lg:hidden text-base">Medium</span>
                  <span className="hidden lg:block text-lg">Large</span>
                </p>
              </div>
            </div>

            <div className="dashboard-card">
              <h3 className="card-title">High-DPI Detection</h3>
              <div className="body-text-responsive text-gray-600 space-y-1">
                <p>Your laptop resolution of 2880x1800 should be detected as:</p>
                <p className="font-semibold text-green-600">
                  {screenSize.width >= 1024 ? '✅ Desktop Layout' : '❌ Mobile Layout (Issue!)'}
                </p>
                <p className="text-xs">
                  Using logical pixels: {screenSize.width}px (CSS pixels, not physical)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Text Examples */}
        <div className="bg-white border border-gray-200 rounded-lg responsive-spacing">
          <h2 className="dashboard-title mb-6">
            Responsive Typography Examples
          </h2>
          <ResponsiveText />
        </div>

        {/* Responsive Card Grid */}
        <div className="bg-white border border-gray-200 rounded-lg responsive-spacing">
          <h2 className="dashboard-title mb-6">
            Responsive Card Grid
          </h2>
          
          <div className="responsive-card-grid">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div key={num} className="dashboard-card hover:shadow-lg transition-shadow">
                <h3 className="card-title-responsive">Card {num}</h3>
                <p className="body-text-responsive text-gray-600">
                  This card adapts to different screen sizes automatically.
                </p>
                <div className="mt-4">
                  <button className="btn-responsive bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="bg-white border border-gray-200 rounded-lg responsive-spacing">
          <h2 className="dashboard-title mb-6">
            Responsive Table
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full table-responsive">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {['John Doe', 'Jane Smith', 'Bob Johnson'].map((name, idx) => (
                  <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{name}</div>
                        <div className="text-gray-500 sm:hidden">user{idx + 1}@example.com</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">user{idx + 1}@example.com</td>
                    <td className="px-4 py-3 hidden md:table-cell">Admin</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Responsive Form */}
        <div className="bg-white border border-gray-200 rounded-lg responsive-spacing">
          <h2 className="dashboard-title mb-6">
            Responsive Form
          </h2>
          
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-responsive text-gray-700 block mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="label-responsive text-gray-700 block mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div>
              <label className="label-responsive text-gray-700 block mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                placeholder="Enter email address"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                className="btn-responsive bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-responsive bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </ResponsiveSidebar>
  );
};

export default ResponsiveExample; 