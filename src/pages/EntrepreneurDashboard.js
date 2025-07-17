import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { calculateMatchScore, enhanceUserForMatching } from '../utils/matchmaking';
import { getCoFounders, getInvestors, getUserPreferences } from '../api/users';
import { useBreakpoint } from '../hooks/useScreenSize';
import { FiSettings, FiMenu, FiX, FiChevronDown, FiLogOut } from 'react-icons/fi';

const sidebarLinks = [
  { key: 'startups', label: 'Startups', icon: 'fa-building' },
  { key: 'cofounders', label: 'Co-Founders', icon: 'fa-users' },
  { key: 'investors', label: 'Investors', icon: 'fa-hand-holding-usd' },
  { key: 'ecosystem', label: 'Ecosystem', icon: 'fa-globe' },
  { key: 'events', label: 'Events', icon: 'fa-calendar' },
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
        console.log('Raw co-founders data:', coFoundersData);
        
        // Fetch preferences for each co-founder
        const coFoundersWithPreferences = await Promise.all(
          coFoundersData.map(async (coFounder) => {
            try {
              console.log(`Attempting to fetch preferences for co-founder ${coFounder.id}`);
              const preferences = await getUserPreferences(coFounder.id);
              console.log(`EntrepreneurDashboard - Preferences for co-founder ${coFounder.id}:`, preferences);
              console.log(`Raw preferred_location data:`, preferences?.preferred_location, 'Type:', typeof preferences?.preferred_location);
              
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
                  console.log(`EntrepreneurDashboard - Parsed industries for ${coFounder.id}:`, preferredIndustries);
                } catch (e) {
                  console.error('Error parsing preferred_industries:', e);
                  preferredIndustries = [];
                }
              }
              
              return {
                ...coFounder,
                // Always prioritize preferences over basic profile data
                preferred_location: preferences?.preferred_location,
                preferred_industries: Array.isArray(preferredIndustries) ? preferredIndustries : [],
                preferred_startup_stage: preferences?.preferred_startup_stage,
                // Use preferences first, only fall back to profile if preferences don't exist
                display_industry: preferredIndustries.length > 0 ? preferredIndustries[0] : (coFounder.industry || 'Not specified'),
                display_location: (() => {
                  if (preferences?.preferred_location && typeof preferences.preferred_location === 'object') {
                    const loc = preferences.preferred_location;
                    console.log(`Processing co-founder ${coFounder.id} location:`, loc);
                    const parts = [];
                    
                    // Handle double-encoded JSON in region field
                    if (loc.region && loc.region.startsWith('{') && loc.region.includes('"region"')) {
                      try {
                        const innerLoc = JSON.parse(loc.region);
                        console.log(`Found double-encoded JSON in region:`, innerLoc);
                        if (innerLoc.city) {
                          console.log(`Adding city from inner JSON: ${innerLoc.city}`);
                          parts.push(innerLoc.city);
                        } else if (innerLoc.region) {
                          console.log(`Adding region from inner JSON: ${innerLoc.region}`);
                          parts.push(innerLoc.region);
                        }
                        if (innerLoc.province && innerLoc.province !== '' && 
                            !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(innerLoc.province.toLowerCase())) {
                          console.log(`Adding province from inner JSON: ${innerLoc.province}`);
                          parts.push(innerLoc.province);
                        }
                      } catch (e) {
                        console.log(`Error parsing double-encoded JSON:`, e);
                        // Fall back to regular processing
                        if (loc.city) {
                          console.log(`Adding city: ${loc.city}`);
                          parts.push(loc.city);
                        } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                          console.log(`Adding region: ${loc.region}`);
                          parts.push(loc.region);
                        }
                      }
                    } else {
                      // Regular processing for non-double-encoded data
                      if (loc.city) {
                        console.log(`Adding city: ${loc.city}`);
                        parts.push(loc.city);
                      } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                        console.log(`Adding region: ${loc.region}`);
                        parts.push(loc.region);
                      }
                      
                      // Only add province if it's not malformed data
                      if (loc.province && loc.province !== '' && 
                          !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(loc.province.toLowerCase())) {
                        console.log(`Adding province: ${loc.province}`);
                        parts.push(loc.province);
                      } else if (loc.province) {
                        console.log(`Filtering out invalid province: ${loc.province}`);
                      }
                    }
                    
                    console.log(`Final location parts for co-founder ${coFounder.id}:`, parts);
                    return parts.length > 0 ? parts.join(', ') : 'Not specified';
                  }
                  // Handle case where preferred_location is a string
                  if (preferences?.preferred_location && typeof preferences.preferred_location === 'string') {
                    try {
                      const loc = JSON.parse(preferences.preferred_location);
                      console.log(`Processing co-founder ${coFounder.id} location from string:`, loc);
                      const parts = [];
                      
                      // Handle double-encoded JSON in region field (same logic as above)
                      if (loc.region && loc.region.startsWith('{') && loc.region.includes('"region"')) {
                        try {
                          const innerLoc = JSON.parse(loc.region);
                          console.log(`Found double-encoded JSON in region from string:`, innerLoc);
                          if (innerLoc.city) {
                            console.log(`Adding city from inner JSON (string): ${innerLoc.city}`);
                            parts.push(innerLoc.city);
                          } else if (innerLoc.region) {
                            console.log(`Adding region from inner JSON (string): ${innerLoc.region}`);
                            parts.push(innerLoc.region);
                          }
                          if (innerLoc.province && innerLoc.province !== '' && 
                              !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(innerLoc.province.toLowerCase())) {
                            console.log(`Adding province from inner JSON (string): ${innerLoc.province}`);
                            parts.push(innerLoc.province);
                          }
                        } catch (e) {
                          console.log(`Error parsing double-encoded JSON from string:`, e);
                          // Fall back to regular processing
                          if (loc.city) {
                            console.log(`Adding city from string: ${loc.city}`);
                            parts.push(loc.city);
                          } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                            console.log(`Adding region from string: ${loc.region}`);
                            parts.push(loc.region);
                          }
                        }
                      } else {
                        // Regular processing
                        if (loc.city) {
                          console.log(`Adding city from string: ${loc.city}`);
                          parts.push(loc.city);
                        } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                          console.log(`Adding region from string: ${loc.region}`);
                          parts.push(loc.region);
                        }
                        
                        if (loc.province && loc.province !== '' && 
                            !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(loc.province.toLowerCase())) {
                          console.log(`Adding province from string: ${loc.province}`);
                          parts.push(loc.province);
                        } else if (loc.province) {
                          console.log(`Filtering out invalid province from string: ${loc.province}`);
                        }
                      }
                      
                      console.log(`Final location parts from string for co-founder ${coFounder.id}:`, parts);
                      return parts.length > 0 ? parts.join(', ') : 'Not specified';
                    } catch (e) {
                      console.log(`JSON parse error for co-founder ${coFounder.id}:`, e);
                      return preferences.preferred_location;
                    }
                  }
                  return coFounder.location || 'Not specified';
                })(),
                display_startup_stage: preferences?.preferred_startup_stage || 'Not specified'
              };
            } catch (error) {
              console.error(`Error fetching preferences for co-founder ${coFounder.id}:`, error);
              console.error('Error details:', error.response?.data, 'Status:', error.response?.status);
              return {
                ...coFounder,
                preferred_location: null,
                preferred_industries: [],
                preferred_startup_stage: null,
                display_industry: coFounder.industry || 'Not specified',
                display_location: coFounder.location || 'Not specified',
                display_startup_stage: 'Not specified'
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
              console.log(`EntrepreneurDashboard - Preferences for investor ${investor.id}:`, preferences);
              
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
                  console.log(`EntrepreneurDashboard - Parsed industries for investor ${investor.id}:`, preferredIndustries);
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
                    console.log(`Processing investor ${investor.id} location:`, loc);
                    const parts = [];
                    
                    // Handle double-encoded JSON in region field
                    if (loc.region && loc.region.startsWith('{') && loc.region.includes('"region"')) {
                      try {
                        const innerLoc = JSON.parse(loc.region);
                        console.log(`Found double-encoded JSON in investor region:`, innerLoc);
                        if (innerLoc.city) {
                          console.log(`Adding city from inner JSON (investor): ${innerLoc.city}`);
                          parts.push(innerLoc.city);
                        } else if (innerLoc.region) {
                          console.log(`Adding region from inner JSON (investor): ${innerLoc.region}`);
                          parts.push(innerLoc.region);
                        }
                        if (innerLoc.province && innerLoc.province !== '' && 
                            !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(innerLoc.province.toLowerCase())) {
                          console.log(`Adding province from inner JSON (investor): ${innerLoc.province}`);
                          parts.push(innerLoc.province);
                        }
                      } catch (e) {
                        console.log(`Error parsing double-encoded JSON (investor):`, e);
                        // Fall back to regular processing
                        if (loc.city) {
                          console.log(`Adding city (investor): ${loc.city}`);
                          parts.push(loc.city);
                        } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                          console.log(`Adding region (investor): ${loc.region}`);
                          parts.push(loc.region);
                        }
                      }
                    } else {
                      // Regular processing for non-double-encoded data
                      if (loc.city) {
                        console.log(`Adding city (investor): ${loc.city}`);
                        parts.push(loc.city);
                      } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                        console.log(`Adding region (investor): ${loc.region}`);
                        parts.push(loc.region);
                      }
                      
                      // Only add province if it's not malformed data
                      if (loc.province && loc.province !== '' && 
                          !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(loc.province.toLowerCase())) {
                        console.log(`Adding province (investor): ${loc.province}`);
                        parts.push(loc.province);
                      } else if (loc.province) {
                        console.log(`Filtering out invalid province (investor): ${loc.province}`);
                      }
                    }
                    
                    console.log(`Final location parts for investor ${investor.id}:`, parts);
                    return parts.length > 0 ? parts.join(', ') : 'Not specified';
                  }
                  // Handle case where preferred_location is a string
                  if (preferences?.preferred_location && typeof preferences.preferred_location === 'string') {
                    try {
                      const loc = JSON.parse(preferences.preferred_location);
                      console.log(`Processing investor ${investor.id} location from string:`, loc);
                      const parts = [];
                      
                      // Handle double-encoded JSON in region field (same logic as above)
                      if (loc.region && loc.region.startsWith('{') && loc.region.includes('"region"')) {
                        try {
                          const innerLoc = JSON.parse(loc.region);
                          console.log(`Found double-encoded JSON in investor region from string:`, innerLoc);
                          if (innerLoc.city) {
                            console.log(`Adding city from inner JSON (investor string): ${innerLoc.city}`);
                            parts.push(innerLoc.city);
                          } else if (innerLoc.region) {
                            console.log(`Adding region from inner JSON (investor string): ${innerLoc.region}`);
                            parts.push(innerLoc.region);
                          }
                          if (innerLoc.province && innerLoc.province !== '' && 
                              !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(innerLoc.province.toLowerCase())) {
                            console.log(`Adding province from inner JSON (investor string): ${innerLoc.province}`);
                            parts.push(innerLoc.province);
                          }
                        } catch (e) {
                          console.log(`Error parsing double-encoded JSON from investor string:`, e);
                          // Fall back to regular processing
                          if (loc.city) {
                            console.log(`Adding city from string (investor): ${loc.city}`);
                            parts.push(loc.city);
                          } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                            console.log(`Adding region from string (investor): ${loc.region}`);
                            parts.push(loc.region);
                          }
                        }
                      } else {
                        // Regular processing
                        if (loc.city) {
                          console.log(`Adding city from string (investor): ${loc.city}`);
                          parts.push(loc.city);
                        } else if (loc.region && loc.region !== '' && !loc.region.includes('Code')) {
                          console.log(`Adding region from string (investor): ${loc.region}`);
                          parts.push(loc.region);
                        }
                        
                        if (loc.province && loc.province !== '' && 
                            !['mvp', 'ideation', 'validation', 'growth', 'maturity'].includes(loc.province.toLowerCase())) {
                          console.log(`Adding province from string (investor): ${loc.province}`);
                          parts.push(loc.province);
                        } else if (loc.province) {
                          console.log(`Filtering out invalid province from string (investor): ${loc.province}`);
                        }
                      }
                      
                      console.log(`Final location parts from string for investor ${investor.id}:`, parts);
                      return parts.length > 0 ? parts.join(', ') : 'Not specified';
                    } catch (e) {
                      console.log(`JSON parse error for investor ${investor.id}:`, e);
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
    const matchScore = score || 0; // Ensure we have a valid number
    const getScoreColor = (score) => {
      if (score >= 80) return 'bg-green-100 text-green-800 border border-green-200';
      if (score >= 60) return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      return 'bg-red-100 text-red-800 border border-red-200';
    };

    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(matchScore)}`}>
        {matchScore}% Match
      </span>
    );
  };

  // Update the co-founders section render
  const renderCoFounders = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {coFounders
        .filter(c => (!coFounderFilters.industry || c.display_industry === coFounderFilters.industry) && 
                     (!coFounderFilters.location || c.display_location === coFounderFilters.location))
        .map((coFounder, idx) => {
          const displayUser = coFounder.id === user?.id ? (enhancedUser || coFounder) : coFounder;
          return (
            <div
              key={displayUser.id || idx}
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
                {displayUser.skills && displayUser.skills.length > 0 && (
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
                )}
                <div className="flex w-full gap-2 mt-auto">
                  <button
                    onClick={() => handleViewProfile(displayUser.id)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
                    disabled={!isUserVerified}
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleMessage(displayUser.id)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
                    disabled={!isUserVerified}
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

  // Update the investors section render
  const renderInvestors = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {investors
        .filter(i => (!investorFilters.industry || i.display_industry === investorFilters.industry) && 
                     (!investorFilters.location || i.display_location === investorFilters.location))
        .map((investor, idx) => (
          <div
            key={investor.id || idx}
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
                <div className="font-bold text-lg text-gray-900 pr-2 flex-1 leading-tight">{investor.name}</div>
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
              {/* Filters and Create Startup button in a single row */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-4 w-full md:flex-grow">
                  <CustomSelect
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
                  </CustomSelect>
                  <CustomSelect
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
                  </CustomSelect>
                  <CustomSelect
                    className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 appearance-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm dark:bg-[#232526] dark:text-white"
                    style={{ backgroundColor: '#fff', color: '#1a202c', borderColor: '#d1d5db' }}
                    value={filters.startup_stage}
                    onChange={e => setFilters(f => ({ ...f, startup_stage: e.target.value }))}
                  >
                    {startupStageOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </CustomSelect>
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
                          <div className="font-bold text-lg text-gray-900 mb-3 leading-tight">{startup.name}</div>
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold">Industry:</span>{' '}
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                              {startup.industry}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold">Location:</span>{' '}
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                              {startup.location}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold">Description:</span>{' '}
                            {startup.description && startup.description.length > 60 ? `${startup.description.slice(0, 60)}...` : startup.description}
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
          </div>
        )}
        {activeSection === 'cofounders' && (
          <div>
            <h1 className="dashboard-section-header text-3xl font-bold mb-6">Co-Founders</h1>
            {/* Filters for Co-Founders */}
            <div className="flex flex-wrap gap-4 mb-6">
              <CustomSelect
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
              </CustomSelect>
              <CustomSelect
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
              </CustomSelect>
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
              <CustomSelect
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
              </CustomSelect>
              <CustomSelect
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
              </CustomSelect>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              {renderInvestors()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
  };
  
export default EntrepreneurDashboard;
