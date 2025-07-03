import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { calculateMatchScore, enhanceUserForMatching } from '../utils/matchmaking';
import { getEntrepreneurs, getUserPreferences, getInvestors } from '../api/users';
import { useBreakpoint } from '../hooks/useScreenSize';
import { FiSettings, FiMenu, FiX } from 'react-icons/fi';

const sidebarLinks = [
  { key: 'startups', label: 'Startups', icon: 'fa-building' },
  { key: 'matches', label: 'Matches', icon: 'fa-star' },
  { key: 'entrepreneurs', label: 'Entrepreneurs', icon: 'fa-users' },
  { key: 'investors', label: 'Investors', icon: 'fa-hand-holding-usd' },
  { key: 'ecosystem', label: 'Ecosystem', icon: 'fa-globe' },
  { key: 'events', label: 'Events', icon: 'fa-calendar' },
  { key: 'settings', label: 'Settings', icon: 'fa-cog' },
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
  const [enhancedUser, setEnhancedUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Import responsive hooks
  const { isMobile, isDesktop } = useBreakpoint();

  // Mock data for testing matchmaking
  const mockAvailableStartups = [
    {
      startup_id: 1,
      name: "Sana All Tech",
      industry: "Technology", // Match investor's preferred industry
      location: "Baguio City", // Match location
      startup_stage: "mvp", // Match stage preferences
      description: "Making everyone's tech dreams come true - sana all may startup!",
      approval_status: "approved",
      entrepreneur_id: 99,
      logo_url: null
    },
    {
      startup_id: 2,
      name: "Edi Wow Solutions",
      industry: "Technology", // Match industry
      location: "Baguio City", // Match location
      startup_stage: "mvp", // Match stage
      description: "Edi wow nalang, we solve everything! Tech solutions para sa lahat.",
      approval_status: "approved",
      entrepreneur_id: 98,
      logo_url: null
    },
    {
      startup_id: 4,
      name: "Petmalu Pets",
      industry: "E-commerce", // Different industry for variety
      location: "Baguio City", // Match location
      startup_stage: "growth", // Different stage
      description: "Petmalu pet supplies and services - para sa mga fur babies na bet na bet!",
      approval_status: "approved",
      entrepreneur_id: 96,
      logo_url: null
    },
    {
      startup_id: 5,
      name: "Lodi Learning",
      industry: "Technology", // Match industry (EdTech as Technology)
      location: "La Trinidad", // Close to Baguio
      startup_stage: "validation", // Different stage
      description: "Educational technology platform na magiging lodi mo sa pag-aaral!",
      approval_status: "approved",
      entrepreneur_id: 95,
      logo_url: null
    }
  ];

  const mockMatchedStartups = [
    {
      startup_id: 3,
      name: "Charot Inc",
      industry: "Technology", // Match industry (FinTech as Technology)
      location: "Baguio City", // Match location for better score
      startup_stage: "mvp", // Match stage
      description: "Charot lang pero serious tayo sa financial technology solutions!",
      approval_status: "approved",
      entrepreneur_id: 97,
      logo_url: null
    }
  ];

  const mockEntrepreneurs = [
    {
      id: 301,
      name: "Bossing Vic Sotto",
      industry: "Technology", // Match investor's preferred industry
      location: "Baguio City", // Match location
      preferred_location: "Baguio City",
      skills: ["Product Development", "Team Leadership", "Business Strategy", "Innovation"],
      role: "entrepreneur",
      startup_stage: "mvp", // Match stage preferences
      profile_image: null
    },
    {
      id: 302,
      name: "Ate Shawie Magdayao",
      industry: "Technology", // Match industry
      location: "Baguio City", // Match location
      preferred_location: "Baguio City",
      skills: ["UI/UX Design", "Brand Management", "Digital Marketing", "Product Strategy"],
      role: "entrepreneur",
      startup_stage: "mvp", // Match stage
      profile_image: null
    },
    {
      id: 303,
      name: "Kuya Jobert Austria",
      industry: "Technology", // Match industry
      location: "La Trinidad", // Close to Baguio
      preferred_location: "Baguio City",
      skills: ["Software Engineering", "System Architecture", "Team Building", "Technical Leadership"],
      role: "entrepreneur",
      startup_stage: "growth", // Different stage for variety
      profile_image: null
    },
    {
      id: 304,
      name: "Manong Fishball",
      industry: "E-commerce", // Different industry for variety
      location: "Baguio City", // Match location
      preferred_location: "Baguio City",
      skills: ["E-commerce", "Customer Acquisition", "Operations", "Market Development"],
      role: "entrepreneur",
      startup_stage: "mvp", // Match stage
      profile_image: null
    },
    {
      id: 305,
      name: "Ate Girl Jackque",
      industry: "Technology", // Match industry (HealthTech as Technology)
      location: "Baguio City", // Match location
      preferred_location: "Baguio City",
      skills: ["Healthcare Technology", "Product Management", "Data Analysis", "Medical Innovation"],
      role: "entrepreneur",
      startup_stage: "validation", // Different stage
      profile_image: null
    }
  ];

  const mockInvestors = [
    {
      id: 401,
      name: "Tita Cory Millionaire",
      industry: "Technology",
      location: "Baguio City",
      skills: ["Angel Investing", "Mentorship", "Tita Powers", "Financial Wisdom"],
      profile_image: null
    },
    {
      id: 402,
      name: "Mang Kanor Ventures",
      industry: "E-commerce",
      location: "La Trinidad",
      skills: ["Retail Business", "Supply Chain", "Negotiation", "Diskarte"],
      profile_image: null
    },
    {
      id: 403,
      name: "Boss Toyo Capital",
      industry: "Finance",
      location: "Tabuk City",
      skills: ["Investment Banking", "Risk Management", "Flex Moves", "Money Talks"],
      profile_image: null
    },
    {
      id: 404,
      name: "Lola Nidora Funds",
      industry: "Healthcare",
      location: "Lagawe",
      skills: ["Healthcare Investment", "Strategic Planning", "Life Advice", "Herbal Medicine"],
      profile_image: null
    }
  ];

  // Add a helper for verification
  const isUserVerified = user && user.verification_status === 'verified';

  // Read active section from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams.get('section');
    if (section && ['startups', 'matches', 'entrepreneurs', 'investors'].includes(section)) {
      setActiveSection(section);
    }
  }, [location.search]);

  // Update URL when activeSection changes (for sidebar navigation)
  const handleSectionChange = (section) => {
    setActiveSection(section);
    const newUrl = `/investor-dashboard?section=${section}`;
    navigate(newUrl, { replace: true });
  };

    // Enhanced user loading with preferences
  useEffect(() => {
    const loadEnhancedUser = async () => {
      if (user) {
        try {
          const userWithPrefs = await enhanceUserForMatching(user, null, getUserPreferences);
          setEnhancedUser(userWithPrefs);
          console.log('Enhanced user for matching:', userWithPrefs);
        } catch (error) {
          console.error('Error enhancing user for matching:', error);
          // Create a basic enhanced user with fallback data for testing
          const basicEnhancedUser = {
            ...user,
            industry: user.industry || 'Technology',
            location: user.location || 'Baguio City',
            preferred_startup_stage: 'mvp',
            preferred_location: user.location || 'Baguio City',
            skills: [],
            role: user.role || 'investor'
          };
          setEnhancedUser(basicEnhancedUser);
          console.log('Using basic enhanced user:', basicEnhancedUser);
        }
      }
    };
    
    loadEnhancedUser();
  }, [user]);

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
        const currentUser = enhancedUser || user || {};
        const entrepreneursWithMatches = entrepreneursWithPreferences
          .filter(entrepreneur => entrepreneur.id !== user?.id) // Exclude current user
          .map(entrepreneur => ({
            ...entrepreneur,
            match_score: calculateMatchScore(currentUser, entrepreneur)
          }));
        
        setEntrepreneurs(entrepreneursWithMatches);
      } catch (error) {
        console.error('Error fetching entrepreneurs:', error);
      }
    };

    if (user) {
      // Fetch real data from database
      fetchAvailableStartups();
      fetchMatchedStartups();
      fetchEntrepreneurs();
    }
  }, [user, enhancedUser]);

  // Fetch investors when 'investors' tab is active
  useEffect(() => {
    if (activeSection === 'investors') {
      // Fetch real data from database
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
  const currentUserForStartups = enhancedUser || user || {};
  const filteredAvailableStartups = availableStartups
    .filter(startup => startup.approval_status === 'approved' && !matchedIds.has(startup.startup_id))
    .map(startup => ({
      ...startup,
      match_score: calculateMatchScore(currentUserForStartups, startup)
    }));

  const filteredMatchedStartups = matchedStartups
    .map(startup => ({
      ...startup,
      match_score: calculateMatchScore(currentUserForStartups, startup)
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
          className="rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center max-w-xs w-full mx-auto h-[500px]"
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
          <div className="w-full px-5 py-4 flex flex-col items-start flex-1">
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
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
                >
                  Unmatch
                </button>
              ) : (
                <button
                  onClick={() => handleMatchStartup(startup.startup_id)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
                >
                  Match
                </button>
              )}
              <button
                onClick={() => handleViewStartup(startup.startup_id)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-full transition-colors text-sm"
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
          className="rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center max-w-xs w-full mx-auto h-[500px]"
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
          <div className="w-full px-5 py-4 flex flex-col items-start flex-1">
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
                  {entrepreneur.skills.slice(0, 4).map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                  {entrepreneur.skills.length > 4 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      +{entrepreneur.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="flex w-full gap-2 mt-auto">
              <button
                onClick={() => handleViewProfile(entrepreneur.id)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
              >
                View Profile
              </button>
              <button
                onClick={() => handleMessage(entrepreneur.id)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
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
          className="rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center max-w-xs w-full mx-auto h-[500px]"
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
          <div className="w-full px-5 py-4 flex flex-col items-start flex-1">
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
                  {investor.skills.slice(0, 4).map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                  {investor.skills.length > 4 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      +{investor.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="flex w-full gap-2 mt-auto">
              <button
                onClick={() => handleViewProfile(investor.id)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
              >
                View Profile
              </button>
              <button
                onClick={() => handleMessage(investor.id)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
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
      <div className={`flex min-h-screen bg-gray-50 text-gray-800 ${isDesktop ? 'pl-72' : 'pl-0'}`}>
        {/* Circular Hamburger Menu - Bottom Right (Mobile Only) */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className={`
            fixed bottom-6 right-6 z-[80] w-14 h-14 rounded-full shadow-2xl
            transition-all duration-300 hover:shadow-3xl active:scale-95
            flex items-center justify-center
            ${isDesktop ? 'hidden' : 'flex'}
            ${isMobileSidebarOpen 
              ? 'bg-red-500 hover:bg-red-600 rotate-180' 
              : 'bg-orange-500 hover:bg-orange-600 rotate-0'
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

        {/* Mobile Overlay - Only show on mobile when sidebar is open */}
        {isMobile && isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Floating Sidebar */}
        <aside className={`
          ${isDesktop 
            ? 'fixed left-8 top-24 bottom-8 z-30 w-64' 
            : 'mobile-sidebar fixed left-0 top-0 h-full w-64 z-[70]'
          }
          bg-white dark:bg-[#232323] flex flex-col 
          ${isDesktop ? 'pt-4 pb-3' : 'pt-4 pb-2'} 
          border border-orange-100 dark:border-orange-700 
          ${isDesktop ? 'rounded-2xl' : 'rounded-none'} 
          shadow-xl transform transition-transform duration-300 ease-in-out
          ${!isDesktop && !isMobileSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          overflow-hidden
        `}>
          {/* Mobile header spacer */}
          {!isDesktop && <div className="h-8 w-full flex-shrink-0"></div>}
          
          {/* Profile Section */}
          <div className="flex flex-col items-center px-4 mb-4 flex-shrink-0">
            {user && user.profile_image ? (
              <img
                src={user.profile_image}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-500 mb-2"
              />
            ) : (
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-lg font-bold mb-2">
                {user && user.first_name ? user.first_name.charAt(0).toUpperCase() : 'I'}
              </div>
            )}
            <div className="text-center">
              <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">INVESTOR</div>
              <div className="text-gray-800 dark:text-white font-medium text-sm">
                {user ? user.first_name + ' ' + user.last_name : 'Demo Investor'}
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto min-h-0">
            {sidebarLinks.map(link => (
              <button
                key={link.key}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm font-medium ${
                  activeSection === link.key
                    ? 'bg-orange-500 text-white'
                    : 'hover:bg-gray-50 hover:text-orange-600 text-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={() => {
                  if (['ecosystem', 'events', 'settings'].includes(link.key)) {
                    navigate(`/${link.key}`);
                  } else {
                    handleSectionChange(link.key);
                  }
                  // Close mobile sidebar after navigation
                  if (isMobile) {
                    setIsMobileSidebarOpen(false);
                  }
                }}
              >
                <i className={`fas ${link.icon} text-lg flex-shrink-0`}></i>
                <span className="sidebar-text truncate">{link.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Bottom Section - Settings & Logout */}
          <div className="px-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm font-medium w-full mb-1 ${
                activeSection === 'settings'
                  ? 'bg-orange-500 text-white'
                  : 'hover:bg-gray-50 hover:text-orange-600 text-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={() => {
                navigate('/settings');
                if (isMobile) {
                  setIsMobileSidebarOpen(false);
                }
              }}
            >
              <FiSettings className="text-lg flex-shrink-0" />
              <span className="sidebar-text truncate">Settings</span>
            </button>
            
            <button
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm font-medium w-full hover:bg-red-50 text-red-500 hover:text-red-600 dark:hover:bg-red-900/20"
              onClick={() => {
                // Handle logout
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
            >
              <div className="w-4 h-4 bg-red-500 rounded-sm flex-shrink-0"></div>
              <span className="sidebar-text truncate">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`
          flex-1 transition-all duration-300 min-w-0 max-w-full overflow-hidden
          ${isDesktop ? 'p-6 lg:p-10 mt-24' : 'p-3 pt-24'}
        `}>
          {/* Verification Banner */}
          {user && user.verification_status !== 'verified' && (
            <div className="mb-8 bg-orange-50 border border-orange-200 rounded-2xl p-6 sm:p-8 text-orange-700 shadow flex flex-col gap-4 animate-fadeIn">
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
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Available Startups</h1>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {renderStartups(filteredAvailableStartups)}
              </div>
            </div>
          )}
          {activeSection === 'matches' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Matched Startups</h1>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {renderStartups(filteredMatchedStartups)}
              </div>
            </div>
          )}
          {activeSection === 'entrepreneurs' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Entrepreneurs</h1>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {renderEntrepreneurs()}
              </div>
            </div>
          )}
          {activeSection === 'investors' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Investors</h1>
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