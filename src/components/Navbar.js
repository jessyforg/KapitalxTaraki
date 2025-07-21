import React, { useState, useEffect, useRef, useCallback } from "react";
import emailjs from "@emailjs/browser";
import { scroller } from "react-scroll";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./styles.css";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { FaUserCircle, FaCog, FaSignOutAlt, FaUser, FaMoon, FaSun, FaBell, FaEnvelope, FaSearch, FaHandshake, FaEye, FaClipboardCheck, FaCalendarAlt, FaUserPlus } from "react-icons/fa";
import userProfileAPI from '../api/userProfile';
import axios from 'axios';
import { debounce } from 'lodash';
import { getNotifications, markNotificationAsRead, getUnreadNotificationCount } from '../api/notifications';
import NotificationDropdown from './NotificationDropdown';

function Navbar({ hideNavLinks: hideNavLinksProp = false, adminTabs, adminActiveTab, setAdminActiveTab }) {
  // Dynamic API URL that works for both localhost and network access
  const getApiUrl = () => {
    // If we're accessing from localhost, use localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    // Otherwise, use the same hostname as the frontend (for network access)
    return `http://${window.location.hostname}:5000/api`;
  };

  const form = useRef();
  const [showAlert, setShowAlert] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [activeDashboardSection, setActiveDashboardSection] = useState('startups');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm("service_mb7zq1l", "template_l38puqp", form.current, {
        publicKey: "",
      })
      .then(
        () => {
          console.log("SUCCESS!");
          e.target.reset();
        },
        (error) => {
          console.log("FAILED...", error.text);
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 3000);
        }
      );
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  const modalClose = () => {
    if (modalRef.current) {
      modalRef.current.classList.remove("fadeIn");
      modalRef.current.classList.add("fadeOut");
      setTimeout(() => {
        setIsModalOpen(false);
      }, 500);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    if (modalRef.current) {
      modalRef.current.classList.remove("fadeOut");
      modalRef.current.classList.add("fadeIn");
    }
  };

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.style.display = isModalOpen ? "flex" : "none";
    }

    const handleWindowClick = (event) => {
      if (event.target === modalRef.current) {
        modalClose();
      }
    };

    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, [isModalOpen]);

  const closeNavbar = () => {
    setIsMobileMenuOpen(false);
  };

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("taraki-dark-mode") === "true";
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("taraki-dark-mode", darkMode);
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
    }
  }, [darkMode]);

  const [authTab, setAuthTab] = useState("login");
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
      return null;
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user ? `${user.first_name} ${user.last_name}` : "");
  const [editEmail, setEditEmail] = useState(user ? user.email : "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  // Listen for login/signup changes
  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('user');
        setUser(stored ? JSON.parse(stored) : null);
      } catch (e) {
        console.warn('Error accessing localStorage:', e);
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Called after login/signup
  const handleAuthSuccess = () => {
    try {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
      setUser(null);
    }
    setIsModalOpen(false);
    // Redirect to role-specific dashboard
    try {
      const stored = localStorage.getItem('user');
      const userObj = stored ? JSON.parse(stored) : null;
      if (userObj && userObj.role) {
        // Check if we're trying to access settings
        const isSettingsPath = location.pathname === '/settings';
        if (isSettingsPath) {
          navigate('/settings');
        } else {
          if (userObj.role === 'entrepreneur') {
            navigate('/entrepreneur-dashboard');
          } else if (userObj.role === 'investor') {
            navigate('/investor-dashboard');
          } else if (userObj.role === 'admin') {
            navigate('/admin');
          }
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // Save profile edits
  const handleProfileSave = async () => {
    try {
      const [firstName, ...lastNameParts] = editName.split(' ');
      const lastName = lastNameParts.join(' ');
      
      const response = await axios.put(`/api/user/${user.id}`, {
        first_name: firstName,
        last_name: lastName,
        email: editEmail,
      });

      const updatedUser = { 
        ...user, 
        first_name: firstName,
        last_name: lastName,
        email: editEmail 
      };
      setUser(updatedUser);
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {
        console.warn('Error accessing localStorage:', e);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Force light mode on logout
      setDarkMode(false);
      localStorage.setItem('taraki-dark-mode', 'false');
      document.documentElement.classList.remove('dark');
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
    }
    setUser(null);
    setIsEditing(false);
    navigate('/');
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close profile dropdown when clicking outside avatar or dropdown
  useEffect(() => {
    if (!isProfileOpen) return;
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const scrollToSection = (sectionId) => {
    // Only scroll if we're on the home page
    if (location.pathname !== '/') {
      // If not on home page, navigate to home page with hash
      window.location.href = `/#${sectionId}`;
      return;
    }

    // Check if element exists before scrolling
    const element = document.getElementById(sectionId);
    if (element) {
      scroller.scrollTo(sectionId, {
        smooth: true,
        duration: 1000,
        offset: -50,
      });
    } else {
      console.warn(`Section with id "${sectionId}" not found`);
    }
    closeNavbar();
  };

  // Update handleImageUpload to work with database
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          const success = await userProfileAPI.updateProfileImage(user.id, base64Image);
          if (success) {
            const updatedUser = { ...user, profileImage: base64Image };
            setUser(updatedUser);
            setProfileImage(base64Image);
            try {
              localStorage.setItem("user", JSON.stringify(updatedUser));
            } catch (e) {
              console.warn('Error accessing localStorage:', e);
            }
          }
        } catch (error) {
          console.error('Error updating profile image:', error);
          // You might want to show an error message to the user here
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add useEffect to load user profile from database
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.warn('No authentication token found');
            handleLogout(); // Logout if no token is found
            return;
          }

          const profile = await userProfileAPI.getUserProfile(user.id);
          if (profile) {
            const updatedUser = { ...user, ...profile };
            setUser(updatedUser);
            setProfileImage(profile.profile_image);
            try {
              localStorage.setItem("user", JSON.stringify(updatedUser));
            } catch (e) {
              console.warn('Error accessing localStorage:', e);
            }
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          if (error.message === 'Failed to fetch user profile') {
            handleLogout(); // Logout if token is invalid
          }
        }
      }
    };

    loadUserProfile();
  }, [user?.id]);

  // Message preview dropdown state
  const [msgDropdownOpen, setMsgDropdownOpen] = useState(false);
  const [msgPreview, setMsgPreview] = useState([]);
  const msgDropdownRef = useRef(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const closeDropdownTimeout = useRef();

  // Fetch preview messages
  const fetchMsgPreview = async () => {
    setLoadingPreview(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found');
        handleLogout(); // Logout if no token is found
        return;
      }

      const res = await axios.get(`${getApiUrl()}/messages/preview`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMsgPreview(res.data);
    } catch (e) {
      console.error('Preview fetch error:', e);
      if (e.response?.status === 403) {
        handleLogout(); // Logout if token is invalid
      }
      setMsgPreview([]);
    }
    setLoadingPreview(false);
  };

  // Automatically fetch message previews when user logs in or Navbar mounts
  useEffect(() => {
    if (user) {
      fetchMsgPreview();
    }
  }, [user]);

  // Open dropdown: fetch messages
  const handleMsgDropdownOpen = () => {
    clearTimeout(closeDropdownTimeout.current);
    setMsgDropdownOpen(true);
  };

  // Close dropdown
  const handleMsgDropdownClose = () => {
    closeDropdownTimeout.current = setTimeout(() => {
      setMsgDropdownOpen(false);
    }, 200); // 200ms delay
  };

  // Close on click outside
  useEffect(() => {
    if (!msgDropdownOpen) return;
    function handleClickOutside(event) {
      if (msgDropdownRef.current && !msgDropdownRef.current.contains(event.target)) {
        setMsgDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [msgDropdownOpen]);

  // Hide nav links on role-specific dashboards (but NOT admin)
  const hideNavLinks = hideNavLinksProp || [
    '/entrepreneur-dashboard',
    '/investor-dashboard'
  ].some(path => location.pathname.startsWith(path));

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    if (!showSearchResults) return;
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchResults]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No authentication token found');
          handleLogout(); // Logout if no token is found
          return;
        }

        const response = await axios.get(`${getApiUrl()}/search?q=${encodeURIComponent(query)}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          handleLogout(); // Logout if token is invalid or expired
        }
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);
    setShowSearchResults(true);
    debouncedSearch(query);
  };

  // Handle search result click
  const handleResultClick = (result) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (result.type === 'user') {
      navigate(`/profile/${result.id}`);
    } else if (result.type === 'startup') {
      navigate(`/startup/${result.id}`);
    }
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Function to fetch notifications based on user role
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadNotifications(data.unread_count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Function to mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Effect to fetch notifications periodically
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  // Effect to fetch unread count periodically
  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const data = await getUnreadNotificationCount();
          setUnreadNotifications(data.count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside handler for notification dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'match_received':
      case 'investor_match':
      case 'startup_match':
        return <FaHandshake className="text-green-500" />;
      case 'profile_view':
        return <FaEye className="text-blue-500" />;
      case 'startup_status':
      case 'program_status':
        return <FaClipboardCheck className="text-purple-500" />;
      case 'event_reminder':
        return <FaCalendarAlt className="text-orange-500" />;
      case 'message':
        return <FaEnvelope className="text-blue-500" />;
      case 'connection_request':
        return <FaUserPlus className="text-green-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  // Function to format notification time
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Add useCallback for notification handlers
  const handleNotificationClick = useCallback(async (notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'match_received':
      case 'investor_match':
      case 'startup_match':
        navigate('/matches');
        break;
      case 'profile_view':
        navigate(`/profile/${notification.data?.sender_id}`);
        break;
      case 'startup_status':
      case 'program_status':
        navigate('/dashboard');
        break;
      case 'event_reminder':
        navigate(`/events/${notification.data?.event_id}`);
        break;
      case 'message':
        navigate(`/messages?chat_with=${notification.data?.sender_id}`);
        break;
      case 'connection_request':
        navigate('/connections');
        break;
      default:
        // For other notification types, just close the dropdown
        break;
    }
  }, [navigate]);

  const navLinks = [
    {
      title: 'Home',
      subLinks: [
        { title: 'Objectives', sectionId: 'objectives' },
        { title: 'TARAKIs', sectionId: 'team' },
        { title: 'FAQ', sectionId: 'FAQs' },
      ],
    },
    {
      title: 'Ecosystem',
      subLinks: [
        { title: 'TBI', path: '/ecosystem', scrollTo: 'tbi' },
        { title: 'Mentors', path: '/ecosystem', scrollTo: 'mentors' },
        { title: 'Framework', path: '/ecosystem', scrollTo: 'framework' },
      ],
    },
    {
      title: 'About',
      subLinks: [
        { title: 'Programs', path: '/programs' },
        { title: 'Events', path: '/events' },
        { title: 'Newsletter', sectionId: 'newsletter' },
      ],
    },
  ];

  const handleMobileNavClick = (link) => {
    if (link.sectionId) {
      scrollToSection(link.sectionId);
    } else if (link.path) {
      if (location.pathname === link.path && link.scrollTo) {
        const el = document.getElementById(link.scrollTo);
        if (el) {
          const yOffset = -100;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        navigate(link.path, { state: { scrollTo: link.scrollTo } });
      }
    }
    setIsMobileMenuOpen(false);
  };

  // Get active section from URL or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams.get('section') || localStorage.getItem('activeDashboardSection') || 'startups';
    setActiveDashboardSection(section);
  }, [location.search]);

  // Handle dashboard section change
  const handleDashboardSectionChange = (section) => {
    setActiveDashboardSection(section);
    localStorage.setItem('activeDashboardSection', section);
    
    // Update URL with section parameter
    const currentPath = location.pathname;
    const newUrl = `${currentPath}?section=${section}`;
    navigate(newUrl, { replace: true });
    
    setIsMobileMenuOpen(false);
  };

  // Handle external navigation (ecosystem, events, settings)
  const handleExternalNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Add scroll state
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastScrollY = useRef(0);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 400;
      
      // Show/hide scroll-to-top button with smoother threshold
      if (currentScrollY > scrollThreshold && !showScrollTop) {
        setShowScrollTop(true);
      } else if (currentScrollY <= scrollThreshold && showScrollTop) {
        setShowScrollTop(false);
      }
      
      // Show/hide navbar based on scroll direction with a minimum scroll threshold
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsNavbarVisible(false); // Scrolling down
      } else {
        setIsNavbarVisible(true); // Scrolling up
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showScrollTop]);

  // Scroll to top function with smooth behavior
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
      duration: 500
    });
  };

  return (
    <header className={`font-montserrat overflow-x-hidden ${darkMode ? 'dark' : ''}`}>
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] ${darkMode ? 'bg-trkblack/80 text-white border border-white/20' : 'bg-white/90 text-trkblack border border-trkblack/10'} backdrop-blur-md shadow-lg rounded-3xl transition-all duration-300 ${isNavbarVisible ? 'translate-y-0' : '-translate-y-32'}`}>
        <div className="flex items-center justify-between mx-auto px-6 py-3">
          <Link
            to="/"
            onClick={(e) => {
              scrollToSection("home");
            }}
            className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer"
            style={{ minWidth: 0 }}
          >
            <img
              src={darkMode ? require("./imgs/TARAKI 10X WHITE.png") : require("./imgs/taraki-logo-black2.png")}
              className="h-8 sm:h-10 w-auto max-w-[140px] sm:max-w-[180px] md:max-w-[220px] object-contain transition-all duration-300"
              alt="Taraki Logo"
              style={{ filter: darkMode ? "invert(0)" : "invert(0)", minWidth: 0 }}
            />
          </Link>
          {/* Admin Dashboard Navigation Tabs (inline in navbar) */}
          {adminTabs && adminActiveTab && setAdminActiveTab && (
            <div className="hidden md:flex gap-2 ml-8">
              {adminTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-base ${
                    adminActiveTab === tab.id
                      ? (darkMode ? 'bg-orange-900 text-orange-400' : 'bg-orange-50 text-orange-600')
                      : (darkMode ? 'hover-bg-orange-900-30 hover-text-orange-400 text-gray-300' : 'hover:bg-gray-50 hover:text-orange-600 text-gray-700')
                  }`}
                  onClick={() => setAdminActiveTab(tab.id)}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
          {/* Desktop search bar */}
          <div className="relative flex-1 min-w-0 w-full max-w-xs sm:max-w-md md:max-w-xl mx-2 sm:mx-4 hidden phone:hidden tablet-m:block" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search users and startups..."
                className={`w-full block min-w-0 max-w-xs sm:max-w-md md:max-w-xl rounded-lg border ${
                  darkMode 
                    ? 'bg-trkblack border-white/20 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:border-orange-500 transition-colors px-4 py-2 pl-10`}
              />
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>

            {showSearchResults && (searchQuery.trim() || isSearching) && (
              <div className={`absolute w-full mt-2 rounded-lg shadow-lg z-50 ${
                darkMode 
                  ? 'bg-trkblack border border-white/20' 
                  : 'bg-white border border-gray-200'
              }`}>
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No results found</div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {result.type === 'user' ? (
                          <>
                            {result.profile_image ? (
                              <img
                                src={result.profile_image}
                                alt={result.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-orange-500"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                {result.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <div className="font-semibold">{result.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{result.role}</div>
                            </div>
                          </>
                        ) : (
                          <>
                            {result.logo ? (
                              <img
                                src={result.logo}
                                alt={result.name}
                                className="w-10 h-10 rounded-lg object-cover border-2 border-orange-500"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                                {result.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <div className="font-semibold">{result.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{result.industry}</div>
                            </div>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Mobile search icon */}
          <button className="block tablet-m:hidden p-2" onClick={() => setShowMobileSearch(true)} aria-label="Open search">
            <FaSearch className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={22} />
          </button>
          {/* Mobile menu (hamburger) icon - scooted to the right */}
          <button
            data-collapse-toggle="navbar-cta"
            type="button"
            className={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg tablet-m:hidden focus:outline-none focus:ring-2 focus:ring-gray-200 ml-auto ${darkMode ? 'text-white' : 'text-black'}`}
            aria-controls="navbar-cta"
            aria-expanded={isMobileMenuOpen}
            id="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/1600/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
          <div
            className="items-center justify-center hidden w-full tablet-m:flex tablet-m:w-auto mx-auto laptop-s:flex-1"
            id="navbar-cta"
          >
            {!hideNavLinks && (
              <ul className="flex flex-row items-center justify-center font-semibold tablet-m:p-0 mt-4 tablet-m:space-x-8 rtl:space-x-reverse tablet-m:flex-row tablet-m:mt-0 laptop-m:text-[1rem] w-full">
                <li className="dropdown relative group">
                  <span className="rounded-md">
                    <button
                      className={`inline-flex phone:py-2 tablet-m:py-0 px-3 w-full leading-5 transition duration-150 ease-in-out bg-transparent rounded-md ${darkMode ? 'text-white' : 'text-trkblack'} hover:text-orange-600 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue ${darkMode ? 'active:bg-trkblack active:text-white' : 'active:bg-gray-50 active:text-gray-800'}`}
                      type="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Home
                      <svg className="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                  <div className={`absolute left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl shadow-2xl z-20 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-200 border border-gray-200 dark:border-white/10 ${darkMode ? 'bg-trkblack bg-opacity-95' : 'bg-white'}`}> 
                    <ul className="py-1 overflow-hidden rounded-xl">
                      <li>
                        <Link
                          to="/"
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToSection("objectives");
                          }}
                          className={`block w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                        >
                          Objectives
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/"
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToSection("team");
                          }}
                          className={`block w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                        >
                          TARAKIs
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/"
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToSection("FAQs");
                          }}
                          className={`block w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                        >
                          FAQ
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="dropdown relative group">
                  <span className="rounded-md">
                    <button
                      className={`inline-flex phone:py-2 tablet-m:py-0 px-3 w-full leading-5 transition duration-150 ease-in-out bg-transparent rounded-md ${darkMode ? 'text-white' : 'text-trkblack'} hover:text-orange-600 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue ${darkMode ? 'active:bg-trkblack active:text-white' : 'active:bg-gray-50 active:text-gray-800'}`}
                      type="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Ecosystem
                      <svg className="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                  <div className={`absolute left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl shadow-2xl z-20 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-200 border border-gray-200 dark:border-white/10 ${darkMode ? 'bg-trkblack bg-opacity-95' : 'bg-white'}`}> 
                    <ul className="py-1 overflow-hidden rounded-xl">
                      <li>
                        <Link
                          to="/ecosystem#tbi"                        onClick={e => {
                            e.preventDefault();
                            if (location.pathname === '/ecosystem') {
                              const el = document.getElementById('tbi');
                              if (el) {
                                const yOffset = -100; // Adjust this value to control the scroll position
                                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                window.scrollTo({ top: y, behavior: 'smooth' });
                              }
                            } else {
                              navigate('/ecosystem', { state: { scrollTo: 'tbi' } });
                            }
                            closeNavbar();
                          }}
                          className={`block w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                        >
                          TBI
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/ecosystem#mentors"                        onClick={e => {
                            e.preventDefault();
                            if (location.pathname === '/ecosystem') {
                              const el = document.getElementById('mentors');
                              if (el) {
                                const yOffset = -100; // Adjust this value to control the scroll position
                                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                window.scrollTo({ top: y, behavior: 'smooth' });
                              }
                            } else {
                              navigate('/ecosystem', { state: { scrollTo: 'mentors' } });
                            }
                            closeNavbar();
                          }}
                          className={`block w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                        >
                          Mentors
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/ecosystem#framework"
                          onClick={e => {
                            e.preventDefault();
                            if (location.pathname === '/ecosystem') {
                              const el = document.getElementById('framework');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            } else {
                              window.location.href = '/ecosystem#framework';
                            }
                            closeNavbar();
                          }}
                          className={`block w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                        >
                          Framework
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="dropdown relative group">
                  <span className="rounded-md">
                    <button
                      className={`inline-flex phone:py-2 tablet-m:py-0 px-3 w-full leading-5 transition duration-150 ease-in-out bg-transparent rounded-md ${darkMode ? 'text-white' : 'text-trkblack'} hover:text-orange-600 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue ${darkMode ? 'active:bg-trkblack active:text-white' : 'active:bg-gray-50 active:text-gray-800'}`}
                      type="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      About
                      <svg className="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                  <div className={`absolute left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl shadow-2xl z-20 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-200 border border-gray-200 dark:border-white/10 ${darkMode ? 'bg-trkblack bg-opacity-95' : 'bg-white'}`}> 
                    <ul className="py-1 overflow-hidden rounded-xl">
                      <li>
                        <NavLink
                          to="/programs"
                          className={`block w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                        >
                          Programs
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/events"
                          className={({ isActive }) =>
                            `block w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors` +
                            (isActive ? ' bg-orange-600' : '')
                          }
                        >
                          Events
                        </NavLink>
                      </li>
                      <li>
                        <Link
                          to="/"
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToSection("newsletter");
                          }}
                          className={`block w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                        >
                          Newsletter
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                {user && (
                  <li>
                    <NavLink
                      to={
                        user.role === 'admin'
                          ? '/admin'
                          : user.role === 'entrepreneur'
                            ? '/entrepreneur-dashboard'
                            : '/dashboard'
                      }
                      className={({ isActive }) =>
                        `inline-flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${isActive ? 'text-orange-600 font-bold' : (darkMode ? 'text-white' : 'text-trkblack')} hover:text-orange-600`
                      }
                    >
                      Dashboard
                    </NavLink>
                  </li>
                )}
              </ul>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="relative" ref={notificationRef}>
                  <button
                    className="relative flex items-center justify-center group"
                    aria-label="Notifications"
                    onClick={() => {
                      setShowNotifications(v => !v);
                      if (!showNotifications) fetchNotifications();
                    }}
                  >
                    <FaBell size={22} className={
                      `transition-colors duration-200 ${showNotifications ? 'text-orange-500' : 'text-gray-400'} group-hover:text-orange-500`
                    } />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border-2 border-white dark:border-[#181818] shadow-sm">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Unified Notification Component */}
                  {showNotifications && (
                    <div className={
                      `z-[999] ${window.innerWidth < 768
                        ? 'fixed inset-0 flex items-start justify-center pt-24' // mobile: below navbar
                        : 'absolute right-0 mt-3 w-96 max-w-sm' // desktop/tablet: below bell
                      }`
                    } style={{ pointerEvents: 'auto' }}>
                      <div className={window.innerWidth < 768 ? 'w-full max-w-md' : 'w-full'}>
                        {/* Backdrop for mobile only */}
                        {window.innerWidth < 768 && (
                          <div 
                            className="fixed inset-0 bg-black/50 z-[-1]" 
                            onClick={() => setShowNotifications(false)}
                          />
                        )}
                        <NotificationDropdown
                          notifications={notifications}
                          onNotificationClick={(notification) => {
                            handleNotificationClick(notification);
                            setShowNotifications(false);
                          }}
                          onViewAll={() => {
                            setShowNotifications(false);
                            navigate('/notifications');
                          }}
                          formatTime={formatNotificationTime}
                          isMobile={window.innerWidth < 768}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="relative"
                  ref={msgDropdownRef}
                >
                  <button
                    className="relative flex items-center justify-center group"
                    aria-label="Messages"
                    onClick={e => {
                      e.preventDefault();
                      setMsgDropdownOpen(v => !v);
                      if (!msgDropdownOpen) fetchMsgPreview();
                    }}
                  >
                    <FaEnvelope size={22} className={`transition-colors duration-200 ${msgDropdownOpen ? 'text-orange-500' : 'text-gray-400'} group-hover:text-orange-500`} />
                    {msgPreview.reduce((total, msg) => total + (msg.unread_count || 0), 0) > 0 && (
                      <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border-2 border-white dark:border-[#181818] shadow-sm">
                        {msgPreview.reduce((total, msg) => total + (msg.unread_count || 0), 0)}
                      </span>
                    )}
                  </button>
                  {/* Desktop dropdown */}
                  <div className="hidden tablet-m:block">
                    {msgDropdownOpen && (
                      <div
                        className={
                          `z-[999] animate-fadeIn absolute right-0 mt-3 w-96 max-w-sm bg-white border border-gray-200 rounded-xl shadow-2xl`
                        }
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="p-4 border-b border-gray-200 font-semibold">Messages</div>
                        <div className="max-h-96 overflow-y-auto">
                          {loadingPreview ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                          ) : msgPreview.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No messages</div>
                          ) : (
                            msgPreview.map(msg => {
                              const isSent = msg.sender_id === user.id;
                              const otherUserId = isSent ? msg.receiver_id : msg.sender_id;
                              const otherName = isSent ? msg.receiver_name : msg.sender_name;
                              const otherAvatar = isSent ? msg.receiver_avatar : msg.sender_avatar;
                              const unreadCount = msg.unread_count || 0;
                              return (
                                <button
                                  key={msg.message_id}
                                  className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors ${unreadCount > 0 ? 'bg-orange-50/50 dark:bg-orange-900/20' : ''}`}
                                  onClick={() => {
                                    setMsgDropdownOpen(false);
                                    navigate(`/messages?chat_with=${otherUserId}`);
                                  }}
                                >
                                  {otherAvatar ? (
                                    <img src={otherAvatar} alt={otherName} className="w-10 h-10 rounded-full object-cover border-2 border-orange-500" />
                                  ) : (
                                    <FaUserCircle className="w-10 h-10 text-orange-500" />
                                  )}
                                  <div className="flex-1 text-left">
                                    <div className="font-semibold text-sm truncate">{otherName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {isSent ? <span className="text-orange-500 font-bold mr-1">Sent:</span> : <span className="text-green-600 font-bold mr-1">Received:</span>}
                                      {msg.content.slice(0, 50)}{msg.content.length > 50 ? '…' : ''}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <div className="text-xs text-gray-400 whitespace-nowrap">{new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    {unreadCount > 0 && (
                                      <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                                        {unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                        <div className="border-t border-gray-200 p-2 text-center">
                          <button
                            className="text-orange-600 hover:underline text-sm font-medium"
                            onClick={() => {
                              setMsgDropdownOpen(false);
                              navigate('/messages');
                            }}
                          >View all messages</button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Mobile modal overlay */}
                  {msgDropdownOpen && (
                    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-24 tablet-m:hidden bg-black bg-opacity-40 animate-fadeIn">
                      <div className={`w-full max-w-md mx-auto bg-white dark:bg-trkblack rounded-2xl shadow-lg relative animate-fadeIn mt-20`}>
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-orange-500 text-2xl z-20" style={{pointerEvents:'auto'}} onClick={() => setMsgDropdownOpen(false)} aria-label="Close messages">&times;</button>
                        <div className="p-4 border-b border-gray-200 font-semibold">Messages</div>
                        <div className="max-h-96 overflow-y-auto">
                          {loadingPreview ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                          ) : msgPreview.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No messages</div>
                          ) : (
                            msgPreview.map(msg => {
                              const isSent = msg.sender_id === user.id;
                              const otherUserId = isSent ? msg.receiver_id : msg.sender_id;
                              const otherName = isSent ? msg.receiver_name : msg.sender_name;
                              const otherAvatar = isSent ? msg.receiver_avatar : msg.sender_avatar;
                              const unreadCount = msg.unread_count || 0;
                              return (
                                <button
                                  key={msg.message_id}
                                  className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors ${unreadCount > 0 ? 'bg-orange-50/50 dark:bg-orange-900/20' : ''}`}
                                  onClick={() => {
                                    setMsgDropdownOpen(false);
                                    navigate(`/messages?chat_with=${otherUserId}`);
                                  }}
                                >
                                  {otherAvatar ? (
                                    <img src={otherAvatar} alt={otherName} className="w-10 h-10 rounded-full object-cover border-2 border-orange-500" />
                                  ) : (
                                    <FaUserCircle className="w-10 h-10 text-orange-500" />
                                  )}
                                  <div className="flex-1 text-left">
                                    <div className="font-semibold text-sm truncate">{otherName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {isSent ? <span className="text-orange-500 font-bold mr-1">Sent:</span> : <span className="text-green-600 font-bold mr-1">Received:</span>}
                                      {msg.content.slice(0, 50)}{msg.content.length > 50 ? '…' : ''}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <div className="text-xs text-gray-400 whitespace-nowrap">{new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    {unreadCount > 0 && (
                                      <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                                        {unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                        <div className="border-t border-gray-200 p-2 text-center">
                          <button
                            className="text-orange-600 hover:underline text-sm font-medium"
                            onClick={() => {
                              setMsgDropdownOpen(false);
                              navigate('/messages');
                            }}
                          >View all messages</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={profileRef}>
                  <button
                    className="flex items-center space-x-2 focus:outline-none"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    aria-haspopup="true"
                    aria-expanded={isProfileOpen}
                  >
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-orange-500"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : ''}
                      </div>
                    )}
                  </button>
                  {isProfileOpen && (
                    <div
                      ref={dropdownRef}
                      className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-50 ${darkMode ? 'bg-trkblack border border-white/10' : 'bg-white border border-gray-200'}`}
                      tabIndex={-1}
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-white/10">
                        <div>
                          <div className="font-semibold text-lg">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email || ''}</div>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaUserCircle className="text-orange-500" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/settings');
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                      >
                        <FaCog className="text-orange-500" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => setDarkMode(prev => !prev)}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                      >
                        {darkMode ? (
                          <>
                            <FaSun className="text-orange-500" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <FaMoon className="text-orange-500" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={openModal}
                className="phone:hidden tablet-m:block bg-orange-500 hover:bg-orange-600 text-white tablet-m:px-3 tablet-m:py-2 laptop-s:px-8 laptop-s:py-3 text-[0.8rem] laptop-s:text-sm border border-trkblack rounded-md laptop-m:text-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-colors duration-200"
                type="button"
              >
                <span>GET STARTED</span>
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Auth Modal - Only show if isModalOpen is true */}
      {isModalOpen && (
        <div
          ref={modalRef}
          className="main-modal fixed w-full h-100 inset-0 z-50 overflow-hidden flex justify-center items-center animated fadeIn faster"
          style={{ display: "flex" }}
        >
          <div className={`modal-container ${darkMode ? 'bg-[#232323]' : 'bg-white'} rounded-lg shadow-lg max-w-md w-full p-0 relative animate-slideInFromTop`}>
            <div className="flex justify-center items-center border-b border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 py-4 text-lg font-semibold transition-colors duration-200 ${authTab === 'login' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
                onClick={() => setAuthTab('login')}
              >
                Log in
              </button>
              <button
                className={`flex-1 py-4 text-lg font-semibold transition-colors duration-200 ${authTab === 'signup' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
                onClick={() => setAuthTab('signup')}
              >
                Sign up
              </button>
            </div>
            <div className="p-8">
              {authTab === 'login' ? (
                <LoginForm authTab={authTab} setAuthTab={setAuthTab} onAuthSuccess={handleAuthSuccess} onClose={modalClose} />
              ) : (
                <SignupForm authTab={authTab} setAuthTab={setAuthTab} onAuthSuccess={handleAuthSuccess} onClose={modalClose} />
              )}
            </div>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-orange-600 text-2xl"
              onClick={modalClose}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {/* Mobile search modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-[999] bg-black bg-opacity-70 flex flex-col items-center justify-start pt-24 px-4 animate-fadeIn">
          <div className={`w-full max-w-md mx-auto bg-white dark:bg-trkblack rounded-2xl shadow-lg p-4 relative pt-10`}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-orange-500 text-2xl z-20" style={{pointerEvents:'auto'}} onClick={() => setShowMobileSearch(false)} aria-label="Close search">&times;</button>
            <div className="relative w-full z-10">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
                placeholder="Search users and startups..."
                className={`w-full rounded-lg border ${darkMode ? 'bg-trkblack border-white/20 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'} focus:outline-none focus:border-orange-500 transition-colors px-4 py-3 pl-10 text-lg`}
              />
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className="mt-4 z-10">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">Searching...</div>
              ) : searchResults.length === 0 && searchQuery.trim() ? (
                <div className="p-4 text-center text-gray-500">No results found</div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => { handleResultClick(result); setShowMobileSearch(false); }}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      {result.type === 'user' ? (
                        <>
                          {result.profile_image ? (
                            <img src={result.profile_image} alt={result.name} className="w-10 h-10 rounded-full object-cover border-2 border-orange-500" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">{result.name.charAt(0).toUpperCase()}</div>
                          )}
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{result.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{result.role}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          {result.logo ? (
                            <img src={result.logo} alt={result.name} className="w-10 h-10 rounded-lg object-cover border-2 border-orange-500" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white">{result.name.charAt(0).toUpperCase()}</div>
                          )}
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{result.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{result.industry}</div>
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* New Full-screen Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-white dark:bg-trkblack transition-transform duration-300 ease-in-out tablet-m:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-trkblack">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* User Profile Section */}
              {user && (
                <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-trkblack/30 rounded-lg">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-4 border-orange-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-4xl text-white font-bold">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : <FaUser />}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-lg text-gray-800 dark:text-white">
                      {user.first_name + ' ' + user.last_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {user && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* Notifications */}
                  <button
                    onClick={() => {
                      setShowNotifications(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 dark:bg-trkblack/30 relative"
                  >
                    <FaBell size={24} className="text-orange-500 mb-2" />
                    <span className="text-sm">Notifications</span>
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Messages */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setMsgDropdownOpen(false);
                      navigate('/messages');
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 dark:bg-trkblack/30 relative"
                  >
                    <FaEnvelope size={24} className="text-orange-500 mb-2" />
                    <span className="text-sm">Messages</span>
                    {msgPreview.reduce((total, msg) => total + (msg.unread_count || 0), 0) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {msgPreview.reduce((total, msg) => total + (msg.unread_count || 0), 0)}
                      </span>
                    )}
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 dark:bg-trkblack/30"
                  >
                    <FaCog size={24} className="text-orange-500 mb-2" />
                    <span className="text-sm">Settings</span>
                  </button>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-6">
                {/* Dashboard Link - Moved to top */}
                {user && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Dashboard</h3>
                    <button
                      onClick={() => {
                        navigate(
                          user.role === 'admin'
                            ? '/admin'
                            : user.role === 'entrepreneur'
                              ? '/entrepreneur-dashboard'
                              : '/investor-dashboard'
                        );
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2 px-4 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      View Dashboard
                    </button>
                  </div>
                )}

                {navLinks.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{section.title}</h3>
                    <div className="space-y-2 pl-2">
                      {section.subLinks.map((link, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => {
                            handleMobileNavClick(link);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left py-2 px-4 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        >
                          {link.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Theme Toggle */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Appearance</h3>
                  <button
                    onClick={() => setDarkMode(prev => !prev)}
                    className="w-full flex items-center justify-between py-2 px-4 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                  </button>
                </div>

                {/* Logout Button */}
                {user && (
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                )}

                {/* Login/Signup Button */}
                {!user && (
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openModal();
                      }}
                      className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button - Updated styling and animation */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-20 tablet-m:bottom-20 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 z-50 transform hover:scale-110 ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </header>
  );
}

export default Navbar;