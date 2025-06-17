import React, { useState, useEffect } from 'react';
import { FaUser, FaBell, FaLock, FaPalette, FaGlobe, FaEnvelope, FaBuilding, FaChartLine } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
      return null;
    }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("taraki-dark-mode") === "true";
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
      return false;
    }
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Sidebar links based on role
  let sidebarLinks = [];
  if (user?.role === 'entrepreneur') {
    sidebarLinks = [
      { key: 'startups', label: 'Startups', icon: 'fa-building', path: '/entrepreneur-dashboard' },
      { key: 'cofounders', label: 'Co-Founders', icon: 'fa-users', path: '/entrepreneur-dashboard' },
      { key: 'investors', label: 'Investors', icon: 'fa-hand-holding-usd', path: '/entrepreneur-dashboard' },
      { key: 'ecosystem', label: 'Ecosystem', icon: 'fa-globe', path: '/ecosystem' },
      { key: 'events', label: 'Events', icon: 'fa-calendar', path: '/events' },
      { key: 'settings', label: 'Settings', icon: 'fa-cog', path: '/settings' },
    ];
  } else if (user?.role === 'investor') {
    sidebarLinks = [
      { key: 'startups', label: 'Startups', icon: 'fa-building', path: '/investor-dashboard' },
      { key: 'matches', label: 'Matches', icon: 'fa-star', path: '/investor-dashboard' },
      { key: 'entrepreneurs', label: 'Entrepreneurs', icon: 'fa-users', path: '/investor-dashboard' },
      { key: 'investors', label: 'Investors', icon: 'fa-hand-holding-usd', path: '/investor-dashboard' },
      { key: 'ecosystem', label: 'Ecosystem', icon: 'fa-globe', path: '/ecosystem' },
      { key: 'events', label: 'Events', icon: 'fa-calendar', path: '/events' },
      { key: 'settings', label: 'Settings', icon: 'fa-cog', path: '/settings' },
    ];
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'security', label: 'Security', icon: <FaLock /> },
    { id: 'appearance', label: 'Appearance', icon: <FaPalette /> },
    { id: 'language', label: 'Language', icon: <FaGlobe /> },
    { id: 'messages', label: 'Messages', icon: <FaEnvelope /> },
    { id: 'company', label: 'Company', icon: <FaBuilding /> },
    { id: 'preferences', label: 'Preferences', icon: <FaChartLine /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl">
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : ''}
                </div>
              )}
              <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                Change Photo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  defaultValue={user?.first_name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  defaultValue={user?.last_name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  defaultValue={user?.email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  defaultValue={user?.phone}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                rows="4"
                defaultValue={user?.bio}
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
            <div className="space-y-4">
              {['Messages', 'Application Status', 'Investment Matches', 'Job Offers', 'System Alerts'].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span>{item}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between">
                <span>Enable 2FA</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Theme</h3>
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Interface Language</label>
              <select className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Zone</label>
              <select className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                <option value="utc">UTC</option>
                <option value="est">EST</option>
                <option value="pst">PST</option>
                <option value="gmt">GMT</option>
              </select>
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Message Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Allow messages from other users</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span>Message notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  defaultValue={user?.company_name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  defaultValue={user?.industry}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  defaultValue={user?.location}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  defaultValue={user?.website}
                />
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Investment Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Investment</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    defaultValue={user?.min_investment}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Maximum Investment</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    defaultValue={user?.max_investment}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar hideNavLinks />
      <div className="flex">
        {/* Sidebar - fixed, like dashboards */}
        <aside className="fixed left-8 top-24 bottom-8 z-30 w-64 bg-white flex flex-col items-center py-8 border border-gray-200 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center mb-8">
            {user && user.profile_image ? (
              <img
                src={user.profile_image}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-orange-500 mb-3"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-5xl text-white font-bold mb-3">
                {user && user.first_name ? user.first_name.charAt(0).toUpperCase() : <i className="fas fa-user"></i>}
              </div>
            )}
            <div className="font-semibold text-lg text-gray-800">{user ? user.first_name + ' ' + user.last_name : ''}</div>
          </div>
          <nav className="flex flex-col gap-2 w-full px-6">
            {sidebarLinks.map(link => (
              <button
                key={link.key}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-base font-medium ${
                  (link.key === 'settings' && location.pathname === '/settings')
                    ? 'bg-orange-50 text-orange-600'
                    : 'hover:bg-gray-50 hover:text-orange-600 text-gray-700'
                }`}
                onClick={() => {
                  if (link.key !== 'settings') navigate(link.path);
                }}
                disabled={link.key === 'settings'}
              >
                <i className={`fas ${link.icon}`}></i>
                <span>{link.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        {/* Main Content - with left and top padding */}
        <main className="flex-1 pl-72 pt-24 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 bg-white px-8 pt-8 z-10 relative overflow-x-auto whitespace-nowrap" style={{ overflowY: 'hidden' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 font-medium transition-colors text-base laptop-s:text-lg ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-orange-600'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b border-gray-200 pb-4">
                {tabs.find(tab => tab.id === activeTab)?.label} Settings
              </h2>
              {renderTabContent()}
              <div className="mt-8 flex justify-end border-t border-gray-200 pt-6">
                <button className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-md">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings; 