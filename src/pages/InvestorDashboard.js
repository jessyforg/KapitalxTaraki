import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const sidebarLinks = [
  { key: 'startups', label: 'Startups', icon: 'fa-building' },
  { key: 'matches', label: 'Matches', icon: 'fa-star' },
  { key: 'entrepreneurs', label: 'Entrepreneurs', icon: 'fa-users' },
  { key: 'investors', label: 'Investors', icon: 'fa-hand-holding-usd' },
];

const industries = {
  Technology: [
    'Software Development', 'E-commerce', 'FinTech', 'EdTech', 'HealthTech', 'AI/ML', 'Cybersecurity', 'Cloud Computing', 'Digital Marketing', 'Mobile Apps'
  ],
  Healthcare: [
    'Medical Services', 'Healthcare Technology', 'Wellness & Fitness', 'Mental Health', 'Telemedicine', 'Medical Devices', 'Healthcare Analytics'
  ],
  Finance: [
    'Banking', 'Insurance', 'Investment', 'Financial Services', 'Payment Solutions', 'Cryptocurrency', 'Financial Planning'
  ],
  Education: [
    'Online Learning', 'Educational Technology', 'Skills Training', 'Language Learning', 'Professional Development', 'Educational Content'
  ],
  Retail: [
    'E-commerce', 'Fashion', 'Food & Beverage', 'Consumer Goods', 'Marketplace', 'Retail Technology'
  ],
  Manufacturing: [
    'Industrial Manufacturing', 'Clean Technology', '3D Printing', 'Supply Chain', 'Smart Manufacturing'
  ],
  Agriculture: [
    'AgTech', 'Organic Farming', 'Food Processing', 'Agricultural Services', 'Sustainable Agriculture'
  ],
  Transportation: [
    'Logistics', 'Ride-sharing', 'Delivery Services', 'Transportation Technology', 'Smart Mobility'
  ],
  'Real Estate': [
    'Property Technology', 'Real Estate Services', 'Property Management', 'Real Estate Investment', 'Smart Homes'
  ],
  Other: [
    'Social Impact', 'Environmental', 'Creative Industries', 'Sports & Entertainment', 'Other Services'
  ]
};

const locations = {
  'Cordillera Administrative Region (CAR)': [
    'Baguio City', 'Tabuk City', 'La Trinidad', 'Bangued', 'Lagawe', 'Bontoc'
  ]
};

const InvestorDashboard = () => {
  const [availableStartups, setAvailableStartups] = useState([]);
  const [matchedStartups, setMatchedStartups] = useState([]);
  const [entrepreneurs, setEntrepreneurs] = useState([]);
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
  const [filters, setFilters] = useState({ industry: '', location: '', startup_stage: '' });
  const [startupStageOptions] = useState([
    { value: '', label: 'All Stages' },
    { value: 'ideation', label: 'Ideation Stage' },
    { value: 'validation', label: 'Validation Stage' },
    { value: 'mvp', label: 'MVP Stage' },
    { value: 'growth', label: 'Growth Stage' },
    { value: 'maturity', label: 'Maturity Stage' },
  ]);
  const [entrepreneurFilters, setEntrepreneurFilters] = useState({ industry: '', location: '' });
  const [investorFilters, setInvestorFilters] = useState({ industry: '', location: '' });

  useEffect(() => {
    const fetchAvailableStartups = async () => {
      try {
        const token = localStorage.getItem('token');
        const params = {};
        if (filters.industry) params.industry = filters.industry;
        if (filters.location) params.location = filters.location;
        if (filters.startup_stage) params.startup_stage = filters.startup_stage;
        const response = await axios.get('/api/investor/available-startups', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        setAvailableStartups(response.data);
      } catch (error) {
        console.error('Error fetching available startups:', error);
      }
    };
    const fetchMatchedStartups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/investor/matches', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMatchedStartups(response.data);
      } catch (error) {
        console.error('Error fetching matched startups:', error);
      }
    };
    const fetchEntrepreneurs = async () => {
      try {
        const token = localStorage.getItem('token');
        const entrepreneursRes = await axios.get('/api/entrepreneurs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch preferences for each entrepreneur
        const entrepreneursWithPreferences = await Promise.all(
          entrepreneursRes.data.map(async (entrepreneur) => {
            try {
              const preferencesRes = await axios.get(`/api/users/${entrepreneur.id}/preferences`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return {
                ...entrepreneur,
                preferred_location: preferencesRes.data?.preferred_location || entrepreneur.location
              };
            } catch (error) {
              console.error(`Error fetching preferences for entrepreneur ${entrepreneur.id}:`, error);
              return {
                ...entrepreneur,
                preferred_location: entrepreneur.location
              };
            }
          })
        );
        
        setEntrepreneurs(entrepreneursWithPreferences);
      } catch (error) {
        console.error('Error fetching entrepreneurs:', error);
      }
    };
    const fetchInvestors = async () => {
      try {
        const token = localStorage.getItem('token');
        const investorsRes = await axios.get('/api/investors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch preferences for each investor
        const investorsWithPreferences = await Promise.all(
          investorsRes.data.map(async (investor) => {
            try {
              const preferencesRes = await axios.get(`/api/users/${investor.id}/preferences`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return {
                ...investor,
                preferred_location: preferencesRes.data?.preferred_location || investor.location
              };
            } catch (error) {
              console.error(`Error fetching preferences for investor ${investor.id}:`, error);
              return {
                ...investor,
                preferred_location: investor.location
              };
            }
          })
        );
        
        setInvestors(investorsWithPreferences);
      } catch (error) {
        console.error('Error fetching investors:', error);
      }
    };
    fetchAvailableStartups();
    fetchMatchedStartups();
    fetchEntrepreneurs();
    fetchInvestors();
  }, [filters]);

  const handleViewStartup = (startupId) => {
    if (startupId) navigate(`/startup/${startupId}`);
  };

  const handleMessage = (entrepreneurId) => {
    navigate(`/messages/${entrepreneurId}`);
  };

  const handleMatchStartup = async (startupId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/investor/match', { startup_id: startupId, match_score: 1.0 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh both lists
      const [availableRes, matchedRes] = await Promise.all([
        axios.get('/api/investor/available-startups', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/investor/matches', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAvailableStartups(availableRes.data);
      setMatchedStartups(matchedRes.data);
    } catch (error) {
      alert('Failed to match: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUnmatchStartup = async (startupId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/investor/unmatch/${startupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh both lists
      const [availableRes, matchedRes] = await Promise.all([
        axios.get('/api/investor/available-startups', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/investor/matches', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAvailableStartups(availableRes.data);
      setMatchedStartups(matchedRes.data);
    } catch (error) {
      alert('Failed to unmatch: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEditStartup = (startupId) => {
    if (startupId) navigate(`/edit-startup/${startupId}`);
  };

  const handleViewProfile = (profileId) => {
    if (profileId) navigate(`/profile/${profileId}`);
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
            <div className="font-semibold text-lg text-gray-800">{user ? user.first_name + ' ' + user.last_name : 'Demo Investor'}</div>
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
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={filters.industry}
                  onChange={e => setFilters(f => ({ ...f, industry: e.target.value }))}
                >
                  <option value="">All Industries</option>
                  {Object.entries(industries).map(([category, subs]) => (
                    <optgroup key={category} label={category}>
                      {subs.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={filters.location}
                  onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                >
                  <option value="">All Locations</option>
                  {Object.entries(locations).map(([region, cities]) => (
                    <optgroup key={region} label={region}>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={filters.startup_stage}
                  onChange={e => setFilters(f => ({ ...f, startup_stage: e.target.value }))}
                >
                  {startupStageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {availableStartups.map((startup, idx) => (
                    <div
                      key={startup.startup_id || startup.id || idx}
                      className="rounded-xl border border-gray-300 bg-gray-100 flex flex-col overflow-hidden"
                      style={{ minHeight: '340px', maxWidth: '260px' }}
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
                          <span className="font-bold">Description:</span> {startup.description && startup.description.length > 80 ? `${startup.description.slice(0, 80)}...` : startup.description}
                        </div>
                        <div className="flex flex-col gap-2 mt-3">
                          {startup.entrepreneur_id === user?.id && (
                            <button
                              onClick={() => handleEditStartup(startup.startup_id ?? startup.id)}
                              className="w-full bg-white border border-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition-colors hover:bg-gray-200"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleViewStartup(startup.startup_id ?? startup.id)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleMatchStartup(startup.startup_id ?? startup.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                          >
                            Match with Startup
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeSection === 'matches' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">My Matches</h1>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {matchedStartups.length === 0 ? (
                  <div className="text-gray-500">No matches yet.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {matchedStartups.map((match, idx) => (
                      <div key={match.match_id || idx} className="rounded-xl border border-gray-300 bg-gray-100 flex flex-col overflow-hidden min-h-[120px] p-4">
                        <div className="font-bold text-base text-black mb-2">{match.name}</div>
                        <div className="text-sm text-black font-semibold">Match Score: {match.match_score}</div>
                        <div className="text-xs text-gray-500">Matched at: {new Date(match.matched_at).toLocaleString()}</div>
                        <button
                          onClick={() => handleUnmatchStartup(match.startup_id)}
                          className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors"
                        >
                          Unmatch
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {activeSection === 'entrepreneurs' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Entrepreneurs</h1>
              {/* Filters for Entrepreneurs */}
              <div className="flex flex-wrap gap-4 mb-6">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={entrepreneurFilters.industry}
                  onChange={e => setEntrepreneurFilters(f => ({ ...f, industry: e.target.value }))}
                >
                  <option value="">All Industries</option>
                  {Object.entries(industries).map(([category, subs]) => (
                    <optgroup key={category} label={category}>
                      {subs.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={entrepreneurFilters.location}
                  onChange={e => setEntrepreneurFilters(f => ({ ...f, location: e.target.value }))}
                >
                  <option value="">All Locations</option>
                  {Object.entries(locations).map(([region, cities]) => (
                    <optgroup key={region} label={region}>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {entrepreneurs.filter(e => (!entrepreneurFilters.industry || e.industry === entrepreneurFilters.industry) && (!entrepreneurFilters.location || e.location === entrepreneurFilters.location) && e.id !== user?.id).length === 0 ? (
                    <div className="text-gray-500">No entrepreneurs found.</div>
                  ) : (
                    entrepreneurs.filter(e => (!entrepreneurFilters.industry || e.industry === entrepreneurFilters.industry) && (!entrepreneurFilters.location || e.location === entrepreneurFilters.location) && e.id !== user?.id).map((entrepreneur, idx) => (
                      <div
                        key={entrepreneur.id || idx}
                        className="rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center max-w-xs w-full mx-auto"
                        style={{ minWidth: '260px' }}
                      >
                        {/* Profile image */}
                        <div className="w-full h-60 bg-gray-100 flex items-center justify-center">
                          {entrepreneur.profile_image ? (
                            <img src={entrepreneur.profile_image} alt={entrepreneur.name} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-500">
                              <i className="fas fa-user text-white text-6xl"></i>
                            </div>
                          )}
                        </div>
                        {/* Info section */}
                        <div className="w-full px-5 py-4 flex flex-col items-start">
                          <div className="font-bold text-lg mb-1 text-gray-900">{entrepreneur.name}</div>
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold">Industry:</span>{' '}
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                              {entrepreneur.industry ? entrepreneur.industry : 'Not provided'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold">Location:</span>{' '}
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {entrepreneur.preferred_location ? entrepreneur.preferred_location : 'Not provided'}
                            </span>
                          </div>
                          {entrepreneur.skills && entrepreneur.skills.length > 0 && (
                            <div className="text-sm text-gray-500 mb-4">
                              <span className="font-semibold">Skills:</span>{' '}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {entrepreneur.skills.map((skill, index) => (
                                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex w-full gap-2 mt-auto">
                            <button
                              onClick={() => handleViewProfile(entrepreneur.id)}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => handleMessage(entrepreneur.id)}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
                            >
                              Message
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          {activeSection === 'investors' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Investors</h1>
              {/* Filters for Investors */}
              <div className="flex flex-wrap gap-4 mb-6">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={investorFilters.industry}
                  onChange={e => setInvestorFilters(f => ({ ...f, industry: e.target.value }))}
                >
                  <option value="">All Industries</option>
                  {Object.entries(industries).map(([category, subs]) => (
                    <optgroup key={category} label={category}>
                      {subs.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={investorFilters.location}
                  onChange={e => setInvestorFilters(f => ({ ...f, location: e.target.value }))}
                >
                  <option value="">All Locations</option>
                  {Object.entries(locations).map(([region, cities]) => (
                    <optgroup key={region} label={region}>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {investors.filter(i => (!investorFilters.industry || i.industry === investorFilters.industry) && (!investorFilters.location || i.location === investorFilters.location) && i.id !== user?.id).length === 0 ? (
                    <div className="text-gray-500">No investors found.</div>
                  ) : (
                    investors.filter(i => (!investorFilters.industry || i.industry === investorFilters.industry) && (!investorFilters.location || i.location === investorFilters.location) && i.id !== user?.id).map((investor, idx) => (
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
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold">Industry:</span>{' '}
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                              {investor.industry ? investor.industry : 'Not provided'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold">Location:</span>{' '}
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {investor.preferred_location ? investor.preferred_location : 'Not provided'}
                            </span>
                          </div>
                          {investor.skills && investor.skills.length > 0 && (
                            <div className="text-sm text-gray-500 mb-4">
                              <span className="font-semibold">Skills:</span>{' '}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {investor.skills.map((skill, index) => (
                                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex w-full gap-2 mt-auto">
                            <button
                              onClick={() => handleViewProfile(investor.id)}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => handleMessage(investor.id)}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
                            >
                              Message
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default InvestorDashboard; 