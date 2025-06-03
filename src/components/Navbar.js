import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { scroller } from "react-scroll";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./styles.css";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { FaUserCircle } from "react-icons/fa";

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
    } catch (e) {}
  }, [darkMode]);

  const [authTab, setAuthTab] = useState("login");
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("taraki-signup-user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user ? user.name : "");
  const [editEmail, setEditEmail] = useState(user ? user.email : "");

  // Listen for login/signup changes
  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem("taraki-signup-user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch (e) {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Called after login/signup
  const handleAuthSuccess = () => {
    try {
      const stored = localStorage.getItem("taraki-signup-user");
      setUser(stored ? JSON.parse(stored) : null);
    } catch (e) {
      setUser(null);
    }
    setIsModalOpen(false);
  };

  // Save profile edits
  const handleProfileSave = () => {
    const updated = { ...user, name: editName, email: editEmail };
    setUser(updated);
    try {
      localStorage.setItem("taraki-signup-user", JSON.stringify(updated));
    } catch (e) {}
    setIsEditing(false);
  };

  // Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem("taraki-signup-user");
    } catch (e) {}
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
            <ul className="flex flex-col font-medium p-4 tablet-m:p-0 mt-4 rounded-lg tablet-m:space-x-8 rtl:space-x-reverse tablet-m:flex-row tablet-m:mt-0 laptop-m:text-[1rem]">
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
                        to="/"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection("tbi");
                        }}
                        className={`flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                      >
                        TBI
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection("mentors");
                        }}
                        className={`flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'hover:bg-orange-900' : 'hover:bg-orange-100'} hover:text-orange-600 dark:hover:text-orange-400 transition-colors`}
                      >
                        Mentors
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection("framework");
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
        
            </ul>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  className="text-orange-500 text-3xl focus:outline-none"
                  title="Profile"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  aria-haspopup="true"
                  aria-expanded={isProfileOpen}
                >
                  <FaUserCircle />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#232323] rounded-lg shadow-lg p-4 z-50">
                    {isEditing ? (
                      <div>
                        <input
                          className="w-full mb-2 p-2 border rounded"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                        />
                        <input
                          className="w-full mb-2 p-2 border rounded"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                        />
                        <button className="bg-orange-500 text-white px-3 py-1 rounded mr-2" onClick={handleProfileSave}>Save</button>
                        <button className="text-gray-500 px-3 py-1" onClick={() => setIsEditing(false)}>Cancel</button>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-lg mb-1">{user.name}</div>
                        <div className="text-sm text-gray-500 mb-2">{user.email}</div>
                        <button className="bg-orange-500 text-white px-3 py-1 rounded mr-2" onClick={() => setIsEditing(true)}>Edit</button>
                        <button className="text-gray-500 px-3 py-1" onClick={handleLogout}>Logout</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openModal}
                className="phone:hidden tablet-m:block bg-orange-500 hover:bg-orange-600 text-white tablet-m:px-3 tablet-m:py-2 laptop-s:px-8 laptop-s:py-3 text-[0.8rem] laptop-s:text-sm border border-trkblack rounded-md laptop-m:text-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-colors duration-200"
                type="button"
              >
                <span>GET STARTED</span>
              </button>
            )}
            <button
              aria-label="Toggle dark mode"
              className={`relative w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none group shadow-md hover:scale-105 active:scale-95`}
              style={{ border: "none" }}
              onClick={() => setDarkMode((prev) => !prev)}
            >
              <span
                className={`absolute left-0 top-0 w-full h-full rounded-full transition-shadow duration-300 group-hover:shadow-lg group-active:shadow-xl ${
                  darkMode ? "shadow-orange-400/60" : "shadow-gray-400/40"
                }`}
                style={{ pointerEvents: "none" }}
              ></span>
              <span
                className={`w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-lg group-hover:scale-110 group-active:scale-95 bg-orange-500 text-white ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}
              >
                {darkMode ? "🌙" : "☀️"}
              </span>
            </button>
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