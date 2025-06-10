import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const sidebarLinks = [
  { key: 'startups', label: 'Startups', icon: 'fa-building' },
  { key: 'cofounders', label: 'Co-Founders', icon: 'fa-users' },
  { key: 'investors', label: 'Investors', icon: 'fa-hand-holding-usd' },
];

const EntrepreneurDashboard = () => {
  const [startups, setStartups] = useState([]);
  const [coFounders, setCoFounders] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [activeSection, setActiveSection] = useState('startups');
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch startups
    const fetchStartups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/startups', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStartups(response.data);
      } catch (error) {
        console.error('Error fetching startups:', error);
      }
    };

    // Fetch co-founders
    const fetchCoFounders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/cofounders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCoFounders(response.data);
      } catch (error) {
        console.error('Error fetching co-founders:', error);
      }
    };

    // Fetch investors
    const fetchInvestors = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/investors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvestors(response.data);
      } catch (error) {
        console.error('Error fetching investors:', error);
      }
    };

    fetchStartups();
    fetchCoFounders();
    fetchInvestors();
  }, []);

  const handleCreateStartup = () => {
    navigate('/create-startup');
  };

  const handleEditStartup = (startupId) => {
    navigate(`/edit-startup/${startupId}`);
  };

  const handleViewStartup = (startupId) => {
    navigate(`/startup/${startupId}`);
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessage = (userId) => {
    navigate(`/messages/${userId}`);
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 text-gray-800 pl-72">
        {/* Sidebar */}
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
            <div className="font-semibold text-lg text-gray-800">{user ? user.first_name + ' ' + user.last_name : 'Demo Testing'}</div>
          </div>
          <nav className="flex flex-col gap-2 w-full px-6">
            {sidebarLinks.map(link => (
              <button
                key={link.key}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-base font-medium ${
                  activeSection === link.key
                    ? 'bg-orange-50 text-orange-600'
                    : 'hover:bg-gray-50 hover:text-orange-600 text-gray-700'
                }`}
                onClick={() => setActiveSection(link.key)}
              >
                <i className={`fas ${link.icon}`}></i>
                <span>{link.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 mt-24">
          {activeSection === 'startups' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Startups</h1>
              <div className="flex justify-end mb-6">
                <button
                  onClick={handleCreateStartup}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors"
                >
                  <i className="fas fa-plus"></i>
                  Create Startup
                </button>
              </div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {startups.map((startup, idx) => (
                    <div
                      key={startup.id || idx}
                      className="rounded-xl border border-gray-300 bg-gray-100 flex flex-col overflow-hidden min-h-[260px]"
                      style={{ minHeight: '310px', maxWidth: '260px' }}
                    >
                      {/* Logo or placeholder */}
                      <div className="flex-1 flex items-center justify-center bg-white" style={{ minHeight: '150px' }}>
                        {startup.logo_url ? (
                          <img src={startup.logo_url} alt={startup.name} className="object-contain h-24" />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center">
                            <i className="fas fa-user text-white text-4xl"></i>
                          </div>
                        )}
                      </div>
                      {/* Info section */}
                      <div className="bg-gray-100 p-4 flex flex-col gap-1 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                            <i className="fas fa-user text-white text-lg"></i>
                          </div>
                          <span className="font-bold text-base text-black">{startup.name}</span>
                        </div>
                        <div className="text-sm text-black font-semibold">
                          <span className="font-bold">Industry:</span> {startup.industry}
                        </div>
                        <div className="text-sm text-black">
                          <span className="font-bold">Description:</span> {startup.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeSection === 'cofounders' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Co-Founders</h1>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {coFounders.map((coFounder, idx) => (
                    <div
                      key={coFounder.id || idx}
                      className="rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center max-w-xs w-full mx-auto"
                      style={{ minWidth: '260px' }}
                    >
                      {/* Profile image */}
                      <div className="w-full h-60 bg-gray-100 flex items-center justify-center">
                        {coFounder.profile_image ? (
                          <img src={coFounder.profile_image} alt={coFounder.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-orange-500">
                            <i className="fas fa-user text-white text-6xl"></i>
                          </div>
                        )}
                      </div>
                      {/* Info section */}
                      <div className="w-full px-5 py-4 flex flex-col items-start">
                        <div className="font-bold text-lg mb-1 text-gray-900">{coFounder.name}</div>
                        <div className="text-sm text-gray-500 mb-4">
                          <span className="font-semibold">Industry:</span> {coFounder.industry ? coFounder.industry : 'Not provided'}
                        </div>
                        <div className="flex w-full gap-2 mt-auto">
                          <button
                            onClick={() => handleMessage(coFounder.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                          >
                            Message
                          </button>
                          <button
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeSection === 'investors' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Investors</h1>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {investors.map((investor, idx) => (
                    <div
                      key={investor.id || idx}
                      className="rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center max-w-xs w-full mx-auto"
                      style={{ minWidth: '260px' }}
                    >
                      {/* Profile image */}
                      <div className="w-full h-60 bg-gray-100 flex items-center justify-center">
                        {investor.profile_image ? (
                          <img src={investor.profile_image} alt={investor.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-orange-500">
                            <i className="fas fa-user text-white text-6xl"></i>
                          </div>
                        )}
                      </div>
                      {/* Info section */}
                      <div className="w-full px-5 py-4 flex flex-col items-start">
                        <div className="font-bold text-lg mb-1 text-gray-900">{investor.name}</div>
                        <div className="text-sm text-gray-500 mb-4">
                          <span className="font-semibold">Industry:</span> {investor.industry ? investor.industry : 'Not provided'}
                        </div>
                        <div className="flex w-full gap-2 mt-auto">
                          <button
                            onClick={() => handleMessage(investor.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                          >
                            Message
                          </button>
                          <button
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default EntrepreneurDashboard; 