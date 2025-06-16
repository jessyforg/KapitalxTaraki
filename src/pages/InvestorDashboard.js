import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { calculateMatchScore } from '../utils/matchmaking';
import { getEntrepreneurs, getUserPreferences, getInvestors } from '../api/users';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a helper for verification
  const isUserVerified = user && user.verification_status === 'verified';

  useEffect(() => {
    // Fetch available startups with match scores
    const fetchAvailableStartups = async () => {
      try {
        const token = localStorage.getItem('token');
        const startupsRes = await axios.get('/api/startups', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableStartups(startupsRes.data);
      } catch (error) {
        console.error('Error fetching available startups:', error);
      }
    };

    // Fetch matched startups with match scores
    const fetchMatchedStartups = async () => {
      try {
        const token = localStorage.getItem('token');
        const startupsRes = await axios.get('/api/investor/matches', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMatchedStartups(startupsRes.data);
      } catch (error) {
        console.error('Error fetching matched startups:', error);
      }
    };

    // Fetch entrepreneurs with match scores
    const fetchEntrepreneurs = async () => {
      try {
        const entrepreneursData = await getEntrepreneurs();
        
        // Fetch preferences for each entrepreneur
        const entrepreneursWithPreferences = await Promise.all(
          entrepreneursData.map(async (entrepreneur) => {
            try {
              const preferences = await getUserPreferences(entrepreneur.id);
              return {
                ...entrepreneur,
                preferred_location: preferences?.preferred_location || entrepreneur.location
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
        
        // Calculate match scores for each entrepreneur
        const entrepreneursWithMatches = entrepreneursWithPreferences
          .filter(entrepreneur => entrepreneur.id !== user?.id) // Exclude current user
          .map(entrepreneur => ({
            ...entrepreneur,
            match_score: calculateMatchScore(user, entrepreneur)
          }));
        
        setEntrepreneurs(entrepreneursWithMatches);
      } catch (error) {
        console.error('Error fetching entrepreneurs:', error);
      }
    };

    if (user) {
      fetchAvailableStartups();
      fetchMatchedStartups();
      fetchEntrepreneurs();
    }
  }, [user]);

  // Fetch investors when 'investors' tab is active
  useEffect(() => {
    if (activeSection === 'investors') {
      const fetchInvestors = async () => {
        try {
          const investorsData = await getInvestors();
          setInvestors(investorsData);
        } catch (error) {
          console.error('Error fetching investors:', error);
        }
      };
      fetchInvestors();
    }
  }, [activeSection]);

  // Filter out matched startups from availableStartups
  const matchedIds = new Set(matchedStartups.map(s => s.startup_id));
  const filteredAvailableStartups = availableStartups
    .filter(startup => startup.approval_status === 'approved' && !matchedIds.has(startup.startup_id))
    .map(startup => ({
      ...startup,
      match_score: calculateMatchScore(user, startup)
    }));

  const filteredMatchedStartups = matchedStartups
    .map(startup => ({
      ...startup,
      match_score: calculateMatchScore(user, startup)
    }));

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

  // Render startup status badge
  const renderStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Add match score badge component
  const MatchScoreBadge = ({ score }) => {
    const getScoreColor = (score) => {
      if (score >= 80) return 'bg-green-100 text-green-800';
      if (score >= 60) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(score)}`}>
        {score}% Match
      </span>
    );
  };

  // Update the startups section render
  const renderStartups = (startups) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {startups.map((startup) => (
        <div
          key={startup.startup_id}
          className="rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center max-w-xs w-full mx-auto"
          style={{ minWidth: '260px' }}
        >
          {/* Logo or placeholder */}
          <div className="w-full h-60 bg-gray-100 flex items-center justify-center">
            {startup.logo_url ? (
              <img src={startup.logo_url} alt={startup.name} className="object-contain h-24" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center">
                <i className="fas fa-building text-white text-4xl"></i>
              </div>
            )}
          </div>
          {/* Info section */}
          <div className="w-full px-5 py-4 flex flex-col items-start">
            <div className="flex justify-between items-center w-full mb-1">
              <div className="font-bold text-lg text-gray-900">{startup.name}</div>
              <MatchScoreBadge score={startup.match_score} />
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Industry:</span>{' '}
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                {startup.industry}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Stage:</span>{' '}
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {startup.startup_stage}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              <span className="font-semibold">Location:</span>{' '}
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                {startup.location}
              </span>
            </div>
            <div className="flex w-full gap-2 mt-auto">
              {matchedIds.has(startup.startup_id) ? (
                <button
                  onClick={() => handleUnmatchStartup(startup.startup_id)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Unmatch
                </button>
              ) : (
                <button
                  onClick={() => handleMatchStartup(startup.startup_id)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Match
                </button>
              )}
              <button
                onClick={() => handleViewStartup(startup.startup_id)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Update the entrepreneurs section render
  const renderEntrepreneurs = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entrepreneurs.map((entrepreneur) => (
        <div
          key={entrepreneur.id}
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
            <div className="flex justify-between items-center w-full mb-1">
              <div className="font-bold text-lg text-gray-900">{entrepreneur.name}</div>
              <MatchScoreBadge score={entrepreneur.match_score} />
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Industry:</span>{' '}
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                {entrepreneur.industry}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Location:</span>{' '}
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {entrepreneur.location}
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
      ))}
    </div>
  );

  // Render investors section
  const renderInvestors = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {investors.map((investor) => (
        <div
          key={investor.id}
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
            <div className="font-bold text-lg text-gray-900 mb-1">{investor.name || investor.full_name || investor.email}</div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Industry:</span>{' '}
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                {investor.industry}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Location:</span>{' '}
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {investor.location}
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
      ))}
    </div>
  );

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
          {/* Verification Banner */}
          {user && user.verification_status !== 'verified' && (
            <div className="mb-8 bg-orange-50 border border-orange-200 rounded-2xl p-8 text-orange-700 shadow flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-orange-400 text-3xl"><i className="fas fa-exclamation-triangle"></i></span>
                <span className="text-xl font-bold text-orange-700">Account Verification Required</span>
              </div>
              <div className="text-orange-700 mb-2">Your account needs to be verified to access the following features:</div>
              <ul className="list-disc ml-8 text-orange-700 mb-2">
                <li>Collaborating with other users</li>
                <li>Interacting with startups and entrepreneurs</li>
              </ul>
              <button className="w-fit bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold mt-2" onClick={() => navigate('/verify-account')}>Verify Your Account</button>
            </div>
          )}
          {activeSection === 'startups' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Startups</h1>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {renderStartups(filteredAvailableStartups)}
              </div>
            </div>
          )}
          {activeSection === 'matches' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Matched Startups</h1>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {renderStartups(filteredMatchedStartups)}
              </div>
            </div>
          )}
          {activeSection === 'entrepreneurs' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Entrepreneurs</h1>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {renderEntrepreneurs()}
              </div>
            </div>
          )}
          {activeSection === 'investors' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Investors</h1>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {renderInvestors()}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default InvestorDashboard; 