import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { scroller } from "react-scroll";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./styles.css";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { FaUserCircle, FaCog, FaSignOutAlt, FaUser, FaMoon, FaSun, FaBell, FaEnvelope } from "react-icons/fa";
import userProfileAPI from '../api/userProfile';

function Navbar() {
  const form = useRef();
  const [showAlert, setShowAlert] = useState(false);
  const location = useLocation();

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

  const menuButtonRef = useRef(null);
  const navbarStickyRef = useRef(null);

  useEffect(() => {
    const handleMenuButtonClick = () => {
      if (navbarStickyRef.current.classList.contains("hidden")) {
        navbarStickyRef.current.classList.remove("hidden");
      } else {
        navbarStickyRef.current.classList.add("hidden");
      }
    };

    const menuButton = menuButtonRef.current;
    menuButton.addEventListener("click", handleMenuButtonClick);

    return () => {
      menuButton.removeEventListener("click", handleMenuButtonClick);
    };
  }, []);

  const closeNavbar = () => {
    navbarStickyRef.current.classList.add("hidden");
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
  const [editName, setEditName] = useState(user ? user.full_name : "");
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
  };

  // Save profile edits
  const handleProfileSave = async () => {
    try {
      const success = await userProfileAPI.updateUserProfile(user.id, {
        full_name: editName,
        email: editEmail,
        profileImage: profileImage
      });
      
      if (success) {
        const updatedUser = { ...user, full_name: editName, email: editEmail };
        setUser(updatedUser);
        try {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (e) {
          console.warn('Error accessing localStorage:', e);
        }
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
    }
    setUser(null);
    setIsEditing(false);
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileOpen) return;
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
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
        }
      }
    };

    loadUserProfile();
  }, [user?.id]);

  return (
    <header className={`font-montserrat overflow-x-hidden ${darkMode ? 'dark' : ''}`}> 
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] ${darkMode ? 'bg-trkblack/80 text-white border border-white/20' : 'bg-white/90 text-trkblack border border-trkblack/10'} backdrop-blur-md shadow-lg rounded-3xl transition-all duration-300`}>
        <div className="flex items-center justify-between mx-auto px-6 py-3">
          <Link
            to="/"
            onClick={(e) => {
              scrollToSection("home");
            }}
            className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer"
          >
            <img
              src={darkMode ? require("./imgs/TARAKI 10X WHITE.png") : require("./imgs/taraki-logo-black2.png")}
              className="h-8 transition-all duration-300"
              alt="Taraki Logo"
              style={{ filter: darkMode ? "invert(0)" : "invert(0)" }}
            />
          </Link>
          <div className="flex space-x-3 tablet-m:space-x-0 rtl:space-x-reverse">
            <button
              data-collapse-toggle="navbar-cta"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-800 rounded-lg tablet-m:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-controls="navbar-cta"
              aria-expanded="false"
              id="mobile-menu-button"
              ref={menuButtonRef}
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
          </div>
          <div
          className="items-center justify-center hidden w-full tablet-m:flex tablet-m:w-auto mx-auto laptop-s:flex-1"
           id="navbar-cta"
            ref={navbarStickyRef}
          >
            <ul className="flex flex-row items-center justify-center font-medium p-4 tablet-m:p-0 mt-4 rounded-lg tablet-m:space-x-8 rtl:space-x-reverse tablet-m:flex-row tablet-m:mt-0 laptop-m:text-[1rem] w-full">
              <li className="dropdown relative group">
                <span className="rounded-md">
                  <button
                    className={`inline-flex phone:py-2 tablet-m:py-0 px-3 w-full leading-5 transition duration-150 ease-in-out bg-transparent rounded-md ${darkMode ? 'text-white' : 'text-trkblack'} hover:text-orange-600 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800`}
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
                <div className={`absolute left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl shadow-2xl z-20 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-200 border border-gray-200 dark:border-white/10 ${darkMode ? 'bg-[#181818] bg-opacity-95' : 'bg-white'}`}> 
                  <ul className="py-1">
                    <li>
                      <Link
                        to="/"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection("objectives");
                        }}
                        className={`flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
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
                        className={`flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
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
                        className={`flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
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
                    className={`inline-flex phone:py-2 tablet-m:py-0 px-3 w-full leading-5 transition duration-150 ease-in-out bg-transparent rounded-md ${darkMode ? 'text-white' : 'text-trkblack'} hover:text-orange-600 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800`}
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
                <div className={`absolute left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl shadow-2xl z-20 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-200 border border-gray-200 dark:border-white/10 ${darkMode ? 'bg-[#181818] bg-opacity-95' : 'bg-white'}`}> 
                  <ul className="py-1">
                    <li>
                      <Link
                        to="/ecosystem#tbi"
                        onClick={e => {
                          e.preventDefault();
                          if (location.pathname === '/ecosystem') {
                            const el = document.getElementById('tbi');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          } else {
                            window.location.href = '/ecosystem#tbi';
                          }
                          closeNavbar();
                        }}
                        className={`flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                      >
                        TBI
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/ecosystem#mentors"
                        onClick={e => {
                          e.preventDefault();
                          if (location.pathname === '/ecosystem') {
                            const el = document.getElementById('mentors');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          } else {
                            window.location.href = '/ecosystem#mentors';
                          }
                          closeNavbar();
                        }}
                        className={`flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
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
                        className={`flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
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
                    className={`inline-flex phone:py-2 tablet-m:py-0 px-3 w-full leading-5 transition duration-150 ease-in-out bg-transparent rounded-md ${darkMode ? 'text-white' : 'text-trkblack'} hover:text-orange-600 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800`}
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
                <div className={`absolute left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl shadow-2xl z-20 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-200 border border-gray-200 dark:border-white/10 ${darkMode ? 'bg-[#181818] bg-opacity-95' : 'bg-white'}`}> 
                  <ul className="py-1">
                    <li>
                      <Link
                        to="/"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection("programs");
                        }}
                        className={`flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                      >
                        Programs
                      </Link>
                    </li>
                    <li>
                      <NavLink
                        to="/events"
                        className={({ isActive }) =>
                          `flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors` +
                          (isActive ? ' text-orange-600' : '')
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
                        className={`flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
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
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className={({ isActive }) =>
                      `inline-flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${isActive ? 'text-orange-600 font-bold' : (darkMode ? 'text-white' : 'text-trkblack')} hover:text-orange-600`
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button className="relative flex items-center justify-center" aria-label="Notifications">
                  <FaBell size={22} className="text-orange-500" />
                </button>
                <button className="relative flex items-center justify-center" aria-label="Messages">
                  <FaEnvelope size={22} className="text-orange-500" />
                  <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">1</span>
                </button>
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
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              {isProfileOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-50 ${darkMode ? 'bg-[#181818] border border-white/10' : 'bg-white border border-gray-200'}`}>
                  <div className="p-4 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center space-x-3">
                      {user.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-lg">{user.full_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
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
                    onClick={() => setIsEditing(true)}
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
          </div>
        </div>
      </nav>
      {/* Auth Modal - Only show if isModalOpen is true */}
      {isModalOpen && window.location.pathname === "/" && (
        <div
          ref={modalRef}
          className="main-modal fixed w-full h-100 inset-0 z-50 overflow-hidden flex justify-center items-center animated fadeIn faster"
          style={{ display: "flex" }}
        >
          <div className="modal-container bg-white dark:bg-[#232323] rounded-lg shadow-lg max-w-md w-full p-0 relative animate-slideInFromTop">
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
                <LoginForm authTab={authTab} setAuthTab={setAuthTab} onAuthSuccess={handleAuthSuccess} />
              ) : (
                <SignupForm authTab={authTab} setAuthTab={setAuthTab} onAuthSuccess={handleAuthSuccess} />
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
    </header>
  );
}

export default Navbar;