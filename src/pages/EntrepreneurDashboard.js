import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { calculateMatchScore, enhanceUserForMatching } from '../utils/matchmaking';
import { getCoFounders, getInvestors, getUserPreferences } from '../api/users';
import { useBreakpoint } from '../hooks/useScreenSize';
import { FiSettings, FiMenu, FiX } from 'react-icons/fi';

const sidebarLinks = [
  { key: 'startups', label: 'Startups', icon: 'fa-building' },
  { key: 'cofounders', label: 'Co-Founders', icon: 'fa-users' },
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
  const [coFounderFilters, setCoFounderFilters] = useState({ industry: '', location: '' });
  const [investorFilters, setInvestorFilters] = useState({ industry: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Import responsive hooks
  const { isMobile, isDesktop } = useBreakpoint();

  // Mock data for testing matchmaking
  const mockStartups = [
    {
      startup_id: 1,
      name: "Sana All Tech",
      industry: "Technology", // Match with user's preferred industry
      location: "Baguio City", // Match with user's preferred location
      startup_stage: "mvp", // Match with user's preferred stage
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
      startup_id: 3,
      name: "Charot Inc",
      industry: "Technology", // Match industry
      location: "La Trinidad", // Close to Baguio
      startup_stage: "growth", // Different stage for variety
      description: "Charot lang pero serious tayo sa innovative technology solutions!",
      approval_status: "pending",
      entrepreneur_id: 97,
      logo_url: null
    }
  ];

  const mockCoFounders = [
    {
      id: 101,
      name: "Juan Dela Krus",
      industry: "Technology", // Match with user's preferred industry
      location: "Baguio City", // Match with user's preferred location
      preferred_location: "Baguio City",
      skills: ["React", "Node.js", "JavaScript", "Technical Leadership"],
      role: "entrepreneur",
      startup_stage: "mvp", // Match with user's preferred stage
      preferred_startup_stage: "mvp",
      profile_image: null
    },
    {
      id: 102,
      name: "Maria Clara Santos",
      industry: "Technology", // Match with user's preferred industry
      location: "Baguio City", // Match with user's preferred location
      preferred_location: "Baguio City",
      skills: ["Product Management", "UI/UX Design", "Market Research", "Business Strategy"],
      role: "entrepreneur",
      startup_stage: "mvp", // Match with user's preferred stage
      profile_image: null
    },
    {
      id: 103,
      name: "Pepito Manaloto",
      industry: "Technology", // Match with user's preferred industry
      location: "La Trinidad", // Close to Baguio
      preferred_location: "Baguio City",
      skills: ["Backend Development", "Database Design", "System Architecture", "DevOps"],
      role: "entrepreneur",
      startup_stage: "growth", // Different stage for variety
      profile_image: null
    },
    {
      id: 104,
      name: "Marites Chismosa",
      industry: "E-commerce", // Different industry for variety
      location: "Baguio City", // Match location
      preferred_location: "Baguio City",
      skills: ["Digital Marketing", "Content Creation", "Social Media", "Customer Relations"],
      role: "entrepreneur",
      startup_stage: "mvp", // Match stage
      profile_image: null
    },
    {
      id: 105,
      name: "Kuya Kim Atienza",
      industry: "Technology", // Match industry
      location: "Tabuk City", // Different location
      preferred_location: "Baguio City", // But wants to be in Baguio
      skills: ["Data Science", "AI/ML", "Research", "Technical Writing"],
      role: "entrepreneur",
      startup_stage: "validation", // Different stage
      profile_image: null
    }
  ];

  const mockInvestors = [
    {
      id: 201,
      name: "Tita Cory Millionaire",
      industry: "Technology", // Match with user's preferred industry
      location: "Baguio City", // Match with user's preferred location
      preferred_location: "Baguio City",
      skills: ["Angel Investing", "Tech Startups", "Mentorship", "Venture Capital"],
      role: "investor",
      startup_stage: "mvp", // Match with user's preferred stage
      profile_image: null
    },
    {
      id: 202,
      name: "Mang Kanor Ventures",
      industry: "Technology", // Match with user's preferred industry
      location: "Baguio City", // Match location
      preferred_location: "Baguio City",
      skills: ["Seed Investment", "Business Development", "Tech Strategy", "Market Analysis"],
      role: "investor",
      startup_stage: "mvp", // Match stage
      profile_image: null
    },
    {
      id: 203,
      name: "Boss Toyo Capital",
      industry: "Technology", // Match industry
      location: "La Trinidad", // Close to Baguio
      preferred_location: "Baguio City",
      skills: ["Growth Investment", "Financial Planning", "Tech Innovation", "Portfolio Management"],
      role: "investor",
      startup_stage: "growth", // Different stage for variety
      profile_image: null
    },
    {
      id: 204,
      name: "Lola Nidora Funds",
      industry: "E-commerce", // Different industry for variety
      location: "Baguio City", // Match location
      preferred_location: "Baguio City",
      skills: ["E-commerce Investment", "Digital Strategy", "Customer Acquisition", "Scaling"],
      role: "investor",
      startup_stage: "mvp", // Match stage
      profile_image: null
    },
    {
      id: 205,
      name: "Tatay Digong Money",
      industry: "Technology", // Match industry
      location: "Tabuk City", // Different location
      preferred_location: "Baguio City", // But wants to invest in Baguio
      skills: ["Series A Investment", "Strategic Partnerships", "Tech Leadership", "Exit Strategy"],
      role: "investor",
      startup_stage: "validation", // Different stage
      profile_image: null
    }
  ];

  // Add a helper for verification
  const isUserVerified = user && user.verification_status === 'verified';

  // Read active section from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams.get('section');
    if (section && ['startups', 'cofounders', 'investors'].includes(section)) {
      setActiveSection(section);
    }
  }, [location.search]);

  // Update URL when activeSection changes (for sidebar navigation)
  const handleSectionChange = (section) => {
    setActiveSection(section);
    const newUrl = `/entrepreneur-dashboard?section=${section}`;
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
            role: user.role || 'entrepreneur'
          };
          setEnhancedUser(basicEnhancedUser);
          console.log('Using basic enhanced user:', basicEnhancedUser);
        }
      }
    };
    
    loadEnhancedUser();
  }, [user]);

  useEffect(() => {
    // Redirect based on role
    if (user && user.role === 'investor') {
      navigate('/investor-dashboard');
      return;
    }
    // Fetch startups
    const fetchStartups = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch('/api/startups', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch startups');
        const data = await res.json();
        setStartups(data);
      } catch (error) {
        console.error('Error fetching startups:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch co-founders with match scores
    const fetchCoFounders = async () => {
      try {
        const coFoundersData = await getCoFounders();
        
        // Fetch preferences for each co-founder
        const coFoundersWithPreferences = await Promise.all(
          coFoundersData.map(async (coFounder) => {
            try {
              const preferences = await getUserPreferences(coFounder.id);
              return {
                ...coFounder,
                preferred_location: preferences?.preferred_location || coFounder.location
              };
            } catch (error) {
              console.error(`Error fetching preferences for co-founder ${coFounder.id}:`, error);
              return {
                ...coFounder,
                preferred_location: coFounder.location
              };
            }
          })
        );
        
        // Calculate match scores for each co-founder
        const currentUser = enhancedUser || user || {};
        const coFoundersWithMatches = coFoundersWithPreferences
          .filter(coFounder => coFounder.id !== user?.id) // Exclude current user
          .map(coFounder => ({
            ...coFounder,
            match_score: calculateMatchScore(currentUser, coFounder)
          }));
        
        setCoFounders(coFoundersWithMatches);
      } catch (error) {
        console.error('Error fetching co-founders:', error);
      }
    };

    // Fetch investors with match scores
    const fetchInvestors = async () => {
      try {
        const investorsData = await getInvestors();
        
        // Fetch preferences for each investor
        const investorsWithPreferences = await Promise.all(
          investorsData.map(async (investor) => {
            try {
              const preferences = await getUserPreferences(investor.id);
              return {
                ...investor,
                preferred_location: preferences?.preferred_location || investor.location
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
        
        // Calculate match scores for each investor
        const currentUserForInvestors = enhancedUser || user || {};
        const investorsWithMatches = investorsWithPreferences
          .filter(investor => investor.id !== user?.id) // Exclude current user
          .map(investor => ({
            ...investor,
            match_score: calculateMatchScore(currentUserForInvestors, investor)
          }));
        
        setInvestors(investorsWithMatches);
      } catch (error) {
        console.error('Error fetching investors:', error);
      }
    };

    // Fetch real data from database
    fetchStartups();
    
    if (user) {
      // Fetch real data from database
      fetchCoFounders();
      fetchInvestors();
    }
  }, [user, enhancedUser]);

  const handleCreateStartup = () => {
    navigate('/create-startup');
  };

  const handleEditStartup = (startupId) => {
    if (startupId) navigate(`/edit-startup/${startupId}`);
  };

  const handleViewStartup = (startupId) => {
    if (startupId) navigate(`/startup/${startupId}`);
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessage = (userId) => {
    navigate(`/messages/${userId}`);
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

  // Update the co-founders section render
  const renderCoFounders = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {coFounders
        .filter(c => (!coFounderFilters.industry || c.industry === coFounderFilters.industry) && 
                     (!coFounderFilters.location || c.location === coFounderFilters.location))
        .map((coFounder, idx) => (
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
              <div className="flex justify-between items-center w-full mb-1">
                <div className="font-bold text-lg text-gray-900">{coFounder.name}</div>
                <MatchScoreBadge score={coFounder.match_score} />
              </div>
              <div className="text-sm text-gray-500 mb-2">
                <span className="font-semibold">Industry:</span>{' '}
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                  {coFounder.industry ? coFounder.industry : 'Not provided'}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                <span className="font-semibold">Location:</span>{' '}
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {coFounder.preferred_location ? coFounder.preferred_location : 'Not provided'}
                </span>
              </div>
              {coFounder.skills && coFounder.skills.length > 0 && (
                <div className="text-sm text-gray-500 mb-4">
                  <span className="font-semibold">Skills:</span>{' '}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {coFounder.skills.map((skill, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex w-full gap-2 mt-auto">
                <button
                  onClick={() => handleViewProfile(coFounder.id)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
                  disabled={!isUserVerified}
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleMessage(coFounder.id)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
                  disabled={!isUserVerified}
                >
                  Message
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  // Update the investors section render
  const renderInvestors = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {investors
        .filter(i => (!investorFilters.industry || i.industry === investorFilters.industry) && 
                     (!investorFilters.location || i.location === investorFilters.location))
        .map((investor, idx) => (
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
              <div className="flex justify-between items-center w-full mb-1">
                <div className="font-bold text-lg text-gray-900">{investor.name}</div>
                <MatchScoreBadge score={investor.match_score} />
              </div>
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
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
                  disabled={!isUserVerified}
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleMessage(investor.id)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
                  disabled={!isUserVerified}
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
          ${isDesktop ? 'pt-4 pb-8' : 'pt-2 pb-4'} 
          border border-orange-100 dark:border-orange-700 
          ${isDesktop ? 'rounded-2xl' : 'rounded-none'} 
          shadow-xl transform transition-transform duration-300 ease-in-out
          ${!isDesktop && !isMobileSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        `}>
          {/* Mobile header spacer */}
          {!isDesktop && <div className="h-8 w-full"></div>}
          
          {/* Profile Section */}
          <div className="flex flex-col items-center px-6 mb-6">
            {user && user.profile_image ? (
              <img
                src={user.profile_image}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-4 border-orange-500 mb-3"
              />
            ) : (
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                {user && user.first_name ? user.first_name.charAt(0).toUpperCase() : 'E'}
              </div>
            )}
            <div className="text-center">
              <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">ENTREPRENEUR</div>
              <div className="text-gray-800 dark:text-white font-medium">
                {user ? user.first_name + ' ' + user.last_name : 'Entrepreneur Demo'}
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-2 px-6">
            {sidebarLinks.map(link => (
              <button
                key={link.key}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-base font-medium ${
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
                <i className={`fas ${link.icon} text-xl`}></i>
                <span className="sidebar-text">{link.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Bottom Section - Settings & Logout */}
          <div className="px-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-base font-medium w-full ${
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
              <FiSettings className="text-xl" />
              <span className="sidebar-text">Settings</span>
            </button>
            
            <button
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-base font-medium w-full hover:bg-red-50 text-red-500 hover:text-red-600 dark:hover:bg-red-900/20"
              onClick={() => {
                // Handle logout
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
            >
              <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
              <span className="sidebar-text">Logout</span>
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
            <div className="mb-8 bg-orange-50 border border-orange-200 rounded-2xl p-8 text-orange-700 shadow flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-orange-400 text-3xl"><i className="fas fa-exclamation-triangle"></i></span>
                <span className="text-xl font-bold text-orange-700">Account Verification Required</span>
              </div>
              <div className="text-orange-700 mb-2">Your account needs to be verified to access the following features:</div>
              <ul className="list-disc ml-8 text-orange-700 mb-2">
                <li>Creating new startups</li>
                <li>Managing startup profiles</li>
              </ul>
              <button className="w-fit bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold mt-2" onClick={() => navigate('/verify-account')}>Verify Your Account</button>
            </div>
          )}
          {activeSection === 'startups' && (
            <div>
              <h1 className="dashboard-section-header text-3xl font-bold mb-2">Startups</h1>
              <div className="mb-4">

              </div>
              {/* Filters and Create Startup button in a single row */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-4 w-full md:flex-grow">
                  <select
                    className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 appearance-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                    style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
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
                    className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 appearance-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                    style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
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
                    className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 appearance-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                    style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
                    value={filters.startup_stage}
                    onChange={e => setFilters(f => ({ ...f, startup_stage: e.target.value }))}
                  >
                    {startupStageOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCreateStartup}
                  className="w-full md:w-auto flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={user && user.verification_status !== 'verified'}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Startup
                </button>
              </div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {loading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center">{error}</div>
                ) : startups.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    You haven't created any startups yet.
                  </div>
                ) : (
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
                          <div className="font-bold text-lg text-gray-900 mb-1">{startup.name}</div>
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold">Industry:</span>{' '}
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                              {startup.industry}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold">Location:</span>{' '}
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {startup.location}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold">Description:</span>{' '}
                            {startup.description && startup.description.length > 80 ? `${startup.description.slice(0, 80)}...` : startup.description}
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold">Status:</span>{' '}
                            {renderStatusBadge(startup.approval_status)}
                          </div>
                          <div className="flex w-full gap-2 mt-auto">
                            {startup.entrepreneur_id === user?.id && (
                              <button
                                onClick={() => handleEditStartup(startup.startup_id ?? startup.id)}
                                className="flex-1 bg-white border border-gray-400 text-gray-800 dark:bg-gray-800 dark:text-white font-semibold py-2 px-4 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleViewStartup(startup.startup_id ?? startup.id)}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {activeSection === 'cofounders' && (
            <div>
              <h1 className="dashboard-section-header text-3xl font-bold mb-6">Co-Founders</h1>
              {/* Filters for Co-Founders */}
              <div className="flex flex-wrap gap-4 mb-6">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 appearance-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                  style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
                  value={coFounderFilters.industry}
                  onChange={e => setCoFounderFilters(f => ({ ...f, industry: e.target.value }))}
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
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 appearance-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                  style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
                  value={coFounderFilters.location}
                  onChange={e => setCoFounderFilters(f => ({ ...f, location: e.target.value }))}
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
                {renderCoFounders()}
              </div>
            </div>
          )}
          {activeSection === 'investors' && (
            <div>
              <h1 className="dashboard-section-header text-3xl font-bold mb-6">Investors</h1>
              {/* Filters for Investors */}
              <div className="flex flex-wrap gap-4 mb-6">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 appearance-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                  style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
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
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 appearance-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                  style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
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
                {renderInvestors()}
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Add style for section headers for light/dark mode */}
      <style>{`
        html.light .dashboard-section-header { color: #1a202c !important; }
        html.dark .dashboard-section-header { color: #fff !important; }
        html.light .dashboard-section-text { color: #1a202c !important; }
        html.dark .dashboard-section-text { color: #fff !important; }
      `}</style>
    </>
  );
};

export default EntrepreneurDashboard;