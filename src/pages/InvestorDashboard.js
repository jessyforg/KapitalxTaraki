import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { calculateMatchScore, enhanceUserForMatching } from '../utils/matchmaking';
import { getCoFounders, getUserPreferences, getInvestors, getUserProfile } from '../api/users';
import { useBreakpoint } from '../hooks/useScreenSize';
import { FiSettings, FiMenu, FiX, FiChevronDown, FiLogOut } from 'react-icons/fi';

const sidebarLinks = [
  { key: 'startups', label: 'Startups', icon: 'fa-building' },
  { key: 'matches', label: 'Matches', icon: 'fa-star' },
  { key: 'entrepreneurs', label: 'Entrepreneurs', icon: 'fa-users' },
  { key: 'investors', label: 'Investors', icon: 'fa-hand-holding-usd' },
  { key: 'ecosystem', label: 'Ecosystem', icon: 'fa-globe' },
  { key: 'events', label: 'Events', icon: 'fa-calendar' }
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

// Custom Select Component with arrow icon
const CustomSelect = ({ className, value, onChange, children, ...props }) => (
  <div className="relative">
    <select
      className={`${className} pr-10 appearance-none`}
      value={value}
      onChange={onChange}
      {...props}
    >
      {children}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <FiChevronDown className="h-4 w-4 text-gray-400" />
    </div>
  </div>
);

// Stage display mapping function
const mapStartupStageForDisplay = (stage) => {
  const stageMap = {
    // Database enum values to display values
    'idea': 'Ideation',
    'mvp': 'MVP',
    'scaling': 'Growth',
    'established': 'Maturity',
    // Frontend values (already proper)
    'ideation': 'Ideation',
    'validation': 'Validation',
    'growth': 'Growth',
    'maturity': 'Maturity'
  };
  
  return stageMap[stage?.toLowerCase()] || (stage ? stage.charAt(0).toUpperCase() + stage.slice(1) : 'Not specified');
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
            preferred_startup_stage: user.preferred_startup_stage || 'mvp',
            preferred_location: user.preferred_location || user.location || 'Baguio City',
            preferred_industries: user.preferred_industries || [user.industry || 'Technology'],
            skills: user.skills || ['Angel Investing', 'Startup Mentorship', 'Financial Planning', 'Business Strategy'],
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
        console.log('InvestorDashboard - Fetched startups from API:', startupsRes.data);
        setAvailableStartups(startupsRes.data);
      } catch (error) {
        console.error('Error fetching available startups:', error);
        // Set some mock startups for testing if API fails
        const mockStartups = [
          {
            startup_id: 1,
            name: "Test Startup",
            industry: "Technology",
            location: "Baguio City",
            startup_stage: "mvp",
            approval_status: "approved",
            description: "Test startup for matchmaking"
          }
        ];
        console.log('InvestorDashboard - Using mock startups for testing:', mockStartups);
        setAvailableStartups(mockStartups);
      }
    };

    // Fetch matched startups with match scores
    const fetchMatchedStartups = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        // Get the user ID from localStorage
        const userId = user?.id;
        if (!userId) {
          console.error('No user ID found');
          return;
        }

        // First get the matches
        const matchesRes = await axios.get(`/api/matches?user_id=${userId}&type=investor`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (matchesRes.data && Array.isArray(matchesRes.data)) {
          // Get the startup IDs from matches
          const startupIds = matchesRes.data.map(match => match.startup_id).filter(Boolean);
          
          // Fetch details for each startup
          const startupDetailsPromises = startupIds.map(async (startupId) => {
            try {
              const startupRes = await axios.get(`/api/startups/${startupId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              // Find the corresponding match score
              const matchData = matchesRes.data.find(m => m.startup_id === startupId);
              
              // Normalize match score to be between 0 and 100
              let matchScore = 0;
              if (matchData?.match_score != null) {
                // If score is already 0-100, use as is
                if (matchData.match_score >= 0 && matchData.match_score <= 100) {
                  matchScore = matchData.match_score;
                }
                // If score is 0-1, multiply by 100
                else if (matchData.match_score >= 0 && matchData.match_score <= 1) {
                  matchScore = matchData.match_score * 100;
                }
                // For any other range, normalize to 0-100
                else {
                  matchScore = Math.min(Math.max(matchData.match_score, 0), 100);
                }
              }
              
              return {
                ...startupRes.data,
                match_score: Math.round(matchScore),
                startup_id: startupId
              };
            } catch (error) {
              console.error(`Error fetching details for startup ${startupId}:`, error);
              return null;
            }
          });

          // Wait for all startup details to be fetched
          const startupDetails = await Promise.all(startupDetailsPromises);
          
          // Filter out any null results from failed requests
          const validStartups = startupDetails.filter(Boolean);
          
          console.log('Fetched matched startups with details:', validStartups);
          setMatchedStartups(validStartups);
        } else {
          console.error('Invalid matches data format:', matchesRes.data);
          setMatchedStartups([]);
        }
      } catch (error) {
        console.error('Error fetching matched startups:', error);
        setMatchedStartups([]);
        // If in development, use mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock matched startups for development');
          setMatchedStartups(mockMatchedStartups);
        }
      }
    };

    // Fetch entrepreneurs with match scores (using same API as co-founders for rich data)
    const fetchEntrepreneurs = async () => {
      try {
        const entrepreneursData = await getCoFounders();
        console.log('InvestorDashboard - Raw entrepreneurs data from API:', entrepreneursData);
        
        // Fetch complete profile and preferences for each entrepreneur
        const entrepreneursWithFullData = await Promise.all(
          entrepreneursData.map(async (entrepreneur) => {
            try {
              // Fetch full profile data
              const fullProfile = await getUserProfile(entrepreneur.id);
              console.log(`InvestorDashboard - Full profile for ${entrepreneur.id}:`, fullProfile);
              
              // Fetch preferences
              const preferences = await getUserPreferences(entrepreneur.id);
              console.log(`InvestorDashboard - Preferences for entrepreneur ${entrepreneur.id}:`, preferences);
              
              // Parse preferred_industries if it's a string
              let preferredIndustries = [];
              if (preferences?.preferred_industries) {
                try {
                  if (typeof preferences.preferred_industries === 'string') {
                    // Only parse if it's a non-empty string that looks like JSON
                    const trimmed = preferences.preferred_industries.trim();
                    if (trimmed.startsWith('[') && trimmed.endsWith(']') && trimmed.length > 2) {
                      const parsed = JSON.parse(trimmed);
                      preferredIndustries = Array.isArray(parsed) ? parsed : [];
                    } else if (trimmed && !trimmed.startsWith('[')) {
                      // If it's not a JSON array, treat as single industry (clean any quotes)
                      const cleaned = trimmed.replace(/^["']|["']$/g, '');
                      if (cleaned && cleaned !== 'null' && cleaned !== 'undefined') {
                        preferredIndustries = [cleaned];
                      }
                    }
                  } else if (Array.isArray(preferences.preferred_industries)) {
                    preferredIndustries = preferences.preferred_industries;
                  }
                  console.log(`InvestorDashboard - Parsed industries for entrepreneur ${entrepreneur.id}:`, preferredIndustries);
                } catch (e) {
                  console.error('Error parsing preferred_industries:', e);
                  preferredIndustries = [];
                }
              }
              
              return {
                ...entrepreneur,
                ...fullProfile, // Merge full profile data (industry, location, etc.)
                // Always prioritize preferences over basic profile data
                preferred_location: preferences?.preferred_location,
                preferred_industries: Array.isArray(preferredIndustries) ? preferredIndustries : [],
                preferred_startup_stage: preferences?.preferred_startup_stage,
                // Use preferences first, only fall back to profile if preferences don't exist
                display_industry: preferredIndustries.length > 0 ? preferredIndustries[0] : (fullProfile?.industry || entrepreneur.industry || 'Not specified'),
                display_location: (() => {
                  if (preferences?.preferred_location && typeof preferences.preferred_location === 'object') {
                    const loc = preferences.preferred_location;
                    const parts = [];
                    
                    // Handle malformed data where actual location is in 'region' field
                    if (loc.city) {
                      parts.push(loc.city);
                    } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                      parts.push(loc.region);
                    }
                    
                    // Only add province if it's not malformed data (not 'mvp', 'ideation', etc.)
                    if (loc.province && loc.province !== '' && 
                        !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(loc.province.toLowerCase())) {
                      parts.push(loc.province);
                    }
                    
                    return parts.length > 0 ? parts.join(', ') : 'Not specified';
                  }
                  // Handle case where preferred_location is a string
                  if (preferences?.preferred_location && typeof preferences.preferred_location === 'string') {
                    try {
                      const loc = JSON.parse(preferences.preferred_location);
                      const parts = [];
                      
                      if (loc.city) {
                        parts.push(loc.city);
                      } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                        parts.push(loc.region);
                      }
                      
                      if (loc.province && loc.province !== '' && 
                          !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(loc.province.toLowerCase())) {
                        parts.push(loc.province);
                      }
                      
                      return parts.length > 0 ? parts.join(', ') : 'Not specified';
                    } catch (e) {
                      return preferences.preferred_location;
                    }
                  }
                  return fullProfile?.location || entrepreneur.location || 'Not specified';
                })(),
                display_startup_stage: preferences?.preferred_startup_stage || 'Not specified'
              };
            } catch (error) {
              console.error(`Error fetching full data for entrepreneur ${entrepreneur.id}:`, error);
              return {
                ...entrepreneur,
                preferred_location: null,
                preferred_industries: [],
                preferred_startup_stage: null,
                display_industry: entrepreneur.industry || 'Not specified',
                display_location: entrepreneur.location || 'Not specified',
                display_startup_stage: 'Not specified'
              };
            }
          })
        );
        
        // Calculate match scores for each entrepreneur
        const currentUser = enhancedUser || user || {};
        console.log('InvestorDashboard - Current user for matching:', currentUser);
        
        const entrepreneursWithMatches = entrepreneursWithFullData
          .filter(entrepreneur => entrepreneur.id !== user?.id) // Exclude current user
          .map(entrepreneur => {
            console.log('InvestorDashboard - Calculating match for entrepreneur:', entrepreneur);
            const matchScore = calculateMatchScore(currentUser, entrepreneur);
            console.log('InvestorDashboard - Match score result:', matchScore);
            return {
            ...entrepreneur,
              match_score: matchScore
            };
          });
        
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
          
          // Fetch preferences for each investor
          const investorsWithPreferences = await Promise.all(
            investorsData.map(async (investor) => {
              try {
                const preferences = await getUserPreferences(investor.id);
                console.log(`InvestorDashboard - Preferences for investor ${investor.id}:`, preferences);
                
                // Parse preferred_industries if it's a string
                let preferredIndustries = [];
                if (preferences?.preferred_industries) {
                  try {
                    if (typeof preferences.preferred_industries === 'string') {
                      // Only parse if it's a non-empty string that looks like JSON
                      const trimmed = preferences.preferred_industries.trim();
                      if (trimmed.startsWith('[') && trimmed.endsWith(']') && trimmed.length > 2) {
                        const parsed = JSON.parse(trimmed);
                        preferredIndustries = Array.isArray(parsed) ? parsed : [];
                      } else if (trimmed && !trimmed.startsWith('[')) {
                        // If it's not a JSON array, treat as single industry (clean any quotes)
                        const cleaned = trimmed.replace(/^["']|["']$/g, '');
                        if (cleaned && cleaned !== 'null' && cleaned !== 'undefined') {
                          preferredIndustries = [cleaned];
                        }
                      }
                    } else if (Array.isArray(preferences.preferred_industries)) {
                      preferredIndustries = preferences.preferred_industries;
                    }
                    console.log(`InvestorDashboard - Parsed industries for investor ${investor.id}:`, preferredIndustries);
                  } catch (e) {
                    console.error('Error parsing preferred_industries:', e);
                    preferredIndustries = [];
                  }
                }
                
                                return {
                  ...investor,
                  // Always prioritize preferences over basic profile data
                  preferred_location: preferences?.preferred_location,
                  preferred_industries: Array.isArray(preferredIndustries) ? preferredIndustries : [],
                  preferred_startup_stage: preferences?.preferred_startup_stage,
                  // Use preferences first, only fall back to profile if preferences don't exist
                display_industry: preferredIndustries.length > 0 ? preferredIndustries[0] : (investor.industry || 'Not specified'),
                display_location: (() => {
                  if (preferences?.preferred_location && typeof preferences.preferred_location === 'object') {
                    const loc = preferences.preferred_location;
                    const parts = [];
                    
                    // Handle malformed data where actual location is in 'region' field
                    if (loc.city) {
                      parts.push(loc.city);
                    } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                      parts.push(loc.region);
                    }
                    
                    // Only add province if it's not malformed data (not 'mvp', 'ideation', etc.)
                    if (loc.province && loc.province !== '' && 
                        !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(loc.province.toLowerCase())) {
                      parts.push(loc.province);
                    }
                    
                    return parts.length > 0 ? parts.join(', ') : 'Not specified';
                  }
                  // Handle case where preferred_location is a string
                  if (preferences?.preferred_location && typeof preferences.preferred_location === 'string') {
                    try {
                      const loc = JSON.parse(preferences.preferred_location);
                      const parts = [];
                      
                      if (loc.city) {
                        parts.push(loc.city);
                      } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                        parts.push(loc.region);
                      }
                      
                      if (loc.province && loc.province !== '' && 
                          !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(loc.province.toLowerCase())) {
                        parts.push(loc.province);
                      }
                      
                      return parts.length > 0 ? parts.join(', ') : 'Not specified';
                    } catch (e) {
                      return preferences.preferred_location;
                    }
                  }
                  return investor.location || 'Not specified';
                })(),
                display_startup_stage: preferences?.preferred_startup_stage || 'Not specified'
                };
              } catch (error) {
                console.error(`Error fetching preferences for investor ${investor.id}:`, error);
                return {
                  ...investor,
                  preferred_location: null,
                  preferred_industries: [],
                  preferred_startup_stage: null,
                  display_industry: investor.industry || 'Not specified',
                  display_location: investor.location || 'Not specified',
                  display_startup_stage: 'Not specified'
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
      fetchInvestors();
    }
  }, [activeSection, user, enhancedUser]);

  // Filter out matched startups from availableStartups
  const matchedIds = new Set(matchedStartups.map(s => s.startup_id));
  const currentUserForStartups = enhancedUser || user || {};
  
  console.log('InvestorDashboard - Available startups count:', availableStartups.length);
  console.log('InvestorDashboard - Matched startups count:', matchedStartups.length);
  
  const filteredAvailableStartups = availableStartups
    .filter(startup => startup.approval_status === 'approved' && !matchedIds.has(startup.startup_id))
    .filter(startup => (!filters.industry || startup.industry === filters.industry) && 
                       (!filters.location || startup.location === filters.location) &&
                       (!filters.startup_stage || startup.startup_stage === filters.startup_stage))
    .map(startup => ({
      ...startup,
      match_score: calculateMatchScore(currentUserForStartups, startup)
    }));

  const filteredMatchedStartups = matchedStartups
    .filter(startup => (!filters.industry || startup.industry === filters.industry) && 
                       (!filters.location || startup.location === filters.location) &&
                       (!filters.startup_stage || startup.startup_stage === filters.startup_stage))
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
      
      // Find the startup to get its calculated match score
      const startup = filteredAvailableStartups.find(s => s.startup_id === startupId);
      const matchScore = startup ? startup.match_score : 0;
      

      
      // Convert percentage to decimal (29% -> 0.29) for consistent storage
      const normalizedScore = matchScore / 100;
      
      console.log(`   - Frontend calculated: ${matchScore}%`);
      console.log(`   - Stored in database: ${normalizedScore} (decimal)`);
      console.log(`   - Will display as: ${Math.round(normalizedScore * 100)}% on matches page`);
      
      await axios.post('/api/investor/match', { startup_id: startupId, match_score: normalizedScore }, {
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
    // Ensure score is a number and clamp it between 0 and 100
    const normalizedScore = Math.min(Math.max(Number(score) || 0, 0), 100);
    
    const getScoreColor = (score) => {
      if (score >= 80) return 'bg-green-100 text-green-800 border border-green-200';
      if (score >= 60) return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      return 'bg-red-100 text-red-800 border border-red-200';
    };

    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(normalizedScore)}`}>
        {normalizedScore}% Match
      </span>
    );
  };

  // Update the startups section render
  const renderStartups = (startups) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {startups.map((startup) => (
        <div
          key={startup.startup_id}
          className="rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center max-w-xs w-full mx-auto min-h-[500px]"
          style={{ minWidth: '260px' }}
        >
          {/* Logo or placeholder */}
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center flex-shrink-0">
            {startup.logo_url ? (
              <img src={startup.logo_url} alt={startup.name} className="object-contain h-32 w-32" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-orange-500 flex items-center justify-center">
                <i className="fas fa-building text-white text-5xl"></i>
              </div>
            )}
          </div>
          {/* Info section */}
          <div className="w-full px-5 py-4 flex flex-col items-start flex-1">
            <div className="flex justify-between items-start w-full mb-3">
              <div className="font-bold text-lg text-gray-900 pr-2 flex-1 leading-tight">
                {startup.name || 'Unnamed Startup'}
              </div>
              <div className="flex-shrink-0 ml-2">
                <MatchScoreBadge score={startup.match_score} />
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Industry:</span>{' '}
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                {startup.industry || 'Not specified'}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Stage:</span>{' '}
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {mapStartupStageForDisplay(startup.startup_stage)}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              <span className="font-semibold">Location:</span>{' '}
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                {startup.location || 'Not specified'}
              </span>
            </div>
            {startup.description && (
              <div className="text-sm text-gray-600 mb-4">
                <p className="line-clamp-3">{startup.description}</p>
              </div>
            )}
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
      {entrepreneurs
        .filter(e => (!entrepreneurFilters.industry || e.display_industry === entrepreneurFilters.industry) && 
                     (!entrepreneurFilters.location || e.display_location === entrepreneurFilters.location))
        .map((entrepreneur) => {
          const displayUser = entrepreneur.id === user?.id ? (enhancedUser || entrepreneur) : entrepreneur;
          return (
            <div
              key={displayUser.id}
              className="rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center max-w-xs w-full mx-auto min-h-[500px]"
          style={{ minWidth: '260px' }}
        >
          {/* Profile image */}
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center flex-shrink-0">
                {displayUser.profile_image ? (
                  <img src={displayUser.profile_image} alt={displayUser.name} className="object-cover w-32 h-32 rounded-full" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-orange-500 flex items-center justify-center">
                    <i className="fas fa-user text-white text-4xl"></i>
              </div>
            )}
          </div>
          {/* Info section */}
          <div className="w-full px-5 py-4 flex flex-col items-start flex-1">
                <div className="flex justify-between items-start w-full mb-3">
                  <div className="font-bold text-lg text-gray-900 pr-2 flex-1 leading-tight">{displayUser.name}</div>
                  <div className="flex-shrink-0 ml-2">
                    <MatchScoreBadge score={displayUser.match_score} />
                  </div>
            </div>
            <div className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Preferred Industry:</span>{' '}
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                    {displayUser.display_industry || 'Not specified'}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Preferred Location:</span>{' '}
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                    {displayUser.display_location || 'Not specified'}
              </span>
            </div>
                <div className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Preferred Stage:</span>{' '}
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                    {mapStartupStageForDisplay(displayUser.display_startup_stage)}
                  </span>
                </div>
                {displayUser.skills && displayUser.skills.length > 0 ? (
              <div className="text-sm text-gray-500 mb-4">
                <span className="font-semibold">Skills:</span>{' '}
                <div className="flex flex-wrap gap-1 mt-1">
                      {displayUser.skills.slice(0, 4).map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                      {skill}
                    </span>
                  ))}
                      {displayUser.skills.length > 4 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                          +{displayUser.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>
                ) : (
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="font-semibold">Skills:</span>{' '}
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                      Not specified
                    </span>
                  </div>
            )}
            <div className="flex w-full gap-2 mt-auto">
              <button
                    onClick={() => handleViewProfile(displayUser.id)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
              >
                View Profile
              </button>
              <button
                    onClick={() => handleMessage(displayUser.id)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
              >
                Message
              </button>
            </div>
          </div>
        </div>
          );
        })}
    </div>
  );

  // Render investors section
  const renderInvestors = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {investors
        .filter(i => (!investorFilters.industry || i.display_industry === investorFilters.industry) && 
                     (!investorFilters.location || i.display_location === investorFilters.location))
        .map((investor) => (
        <div
          key={investor.id}
          className="rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center max-w-xs w-full mx-auto min-h-[500px]"
          style={{ minWidth: '260px' }}
        >
          {/* Profile image */}
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center flex-shrink-0">
            {investor.profile_image ? (
              <img src={investor.profile_image} alt={investor.name} className="object-cover w-32 h-32 rounded-full" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-orange-500 flex items-center justify-center">
                <i className="fas fa-user text-white text-4xl"></i>
              </div>
            )}
          </div>
          {/* Info section */}
          <div className="w-full px-5 py-4 flex flex-col items-start flex-1">
            <div className="flex justify-between items-start w-full mb-3">
              <div className="font-bold text-lg text-gray-900 pr-2 flex-1 leading-tight">{investor.name || investor.full_name || investor.email}</div>
              <div className="flex-shrink-0 ml-2">
                <MatchScoreBadge score={investor.match_score} />
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Preferred Industry:</span>{' '}
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                {investor.display_industry || 'Not specified'}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Preferred Location:</span>{' '}
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                {investor.display_location || 'Not specified'}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Preferred Stage:</span>{' '}
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                {mapStartupStageForDisplay(investor.display_startup_stage)}
              </span>
            </div>
            {investor.skills && investor.skills.length > 0 && (
              <div className="text-sm text-gray-500 mb-4">
                <span className="font-semibold">Skills:</span>{' '}
                <div className="flex flex-wrap gap-1 mt-1">
                  {investor.skills.slice(0, 4).map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                      {skill}
                    </span>
                  ))}
                  {investor.skills.length > 4 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs whitespace-nowrap">
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

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Force light mode on logout
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taraki-dark-mode', 'false');
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
    }
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <Navbar />
      
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

      {/* Mobile Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isDesktop 
          ? 'fixed left-8 top-24 bottom-8 z-30 w-64' 
          : 'fixed left-0 top-0 h-full w-64 z-[70]'
        }
        bg-white dark:bg-[#232323] flex flex-col 
        ${isDesktop ? 'pt-3 pb-3' : 'pt-2 pb-2'} 
        border border-orange-100 dark:border-orange-700 
        ${isDesktop ? 'rounded-2xl' : 'rounded-none'} 
        shadow-xl transform transition-transform duration-300 ease-in-out
        ${!isDesktop && !isMobileSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        overflow-hidden
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
              {user && user.first_name ? user.first_name.charAt(0).toUpperCase() : 'I'}
            </div>
          )}
          <div className="text-center">
            <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">INVESTOR</div>
            <div className="text-gray-800 dark:text-white font-medium">
              {user ? user.first_name + ' ' + user.last_name : 'Investor Demo'}
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
            className={`flex items-center gap-3 px-4 py-3 w-full transition-colors duration-200 rounded-lg ${
              location.pathname === '/settings'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:text-orange-500 bg-white dark:bg-transparent dark:text-gray-300 dark:hover:text-orange-500'
            }`}
            onClick={() => {
              navigate('/settings');
              if (isMobile) {
                setIsMobileSidebarOpen(false);
              }
            }}
          >
            <FiSettings className="text-xl" />
            <span className="text-base font-medium">Settings</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:text-red-500 transition-colors duration-200 bg-white dark:bg-transparent dark:text-gray-300 dark:hover:text-red-500 rounded-lg"
          >
            <FiLogOut className="text-xl" />
            <span className="text-base font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1 transition-all duration-300 min-w-0 max-w-full overflow-hidden
        ${isDesktop ? 'p-6 lg:p-10 mt-24 ml-72' : 'p-3 pt-24'}
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
              <li>Matching with startups</li>
              <li>Viewing startup details</li>
            </ul>
            <button className="w-fit bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold mt-2" onClick={() => navigate('/verify-account')}>Verify Your Account</button>
          </div>
        )}
        {activeSection === 'startups' && (
          <div>
            <h1 className="dashboard-section-header text-3xl font-bold mb-2">Startups</h1>
            <div className="mb-4">
              {/* Filters for Startups */}
              <div className="flex flex-wrap gap-4 mb-6">
                <CustomSelect
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
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
                </CustomSelect>
                <CustomSelect
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
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
                </CustomSelect>
                <CustomSelect
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                  style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
                  value={filters.startup_stage}
                  onChange={e => setFilters(f => ({ ...f, startup_stage: e.target.value }))}
                >
                  {startupStageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {renderStartups(filteredAvailableStartups)}
              </div>
            </div>
          </div>
        )}
        {activeSection === 'matches' && (
          <div>
            <h1 className="dashboard-section-header text-3xl font-bold mb-2">Matched Startups</h1>
            <div className="mb-4">
              {/* Filters for Matched Startups */}
              <div className="flex flex-wrap gap-4 mb-6">
                <CustomSelect
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
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
                </CustomSelect>
                <CustomSelect
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
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
                </CustomSelect>
                <CustomSelect
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                  style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
                  value={filters.startup_stage}
                  onChange={e => setFilters(f => ({ ...f, startup_stage: e.target.value }))}
                >
                  {startupStageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {renderStartups(filteredMatchedStartups)}
              </div>
            </div>
          </div>
        )}
        {activeSection === 'entrepreneurs' && (
          <div>
            <h1 className="dashboard-section-header text-3xl font-bold mb-6">Entrepreneurs</h1>
            <div className="mb-4">
              {/* Filters for Entrepreneurs */}
              <div className="flex flex-wrap gap-4 mb-6">
                <CustomSelect
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                  style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
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
                </CustomSelect>
                <CustomSelect
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                  style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
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
                </CustomSelect>
              </div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {renderEntrepreneurs()}
              </div>
            </div>
          </div>
        )}
        {activeSection === 'investors' && (
          <div>
            <h1 className="dashboard-section-header text-3xl font-bold mb-6">Investors</h1>
            <div className="mb-4">
              {/* Filters for Investors */}
              <div className="flex flex-wrap gap-4 mb-6">
                <CustomSelect
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
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
                </CustomSelect>
                <CustomSelect
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
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
                </CustomSelect>
              </div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                {renderInvestors()}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
  };

export default InvestorDashboard; 