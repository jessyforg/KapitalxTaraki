import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { scroller } from "react-scroll";
import { Link } from "react-router-dom";
import "./styles.css";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

function Navbar() {
  const form = useRef();
  const [showAlert, setShowAlert] = useState(false);

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
    return localStorage.getItem("taraki-dark-mode") === "true";
  });
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("taraki-dark-mode", darkMode);
  }, [darkMode]);

  const [authTab, setAuthTab] = useState("login");

  return (
    <header className="font-montserrat overflow-x-hidden">
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] bg-trkblack/80 backdrop-blur-md border border-white/10 shadow-lg rounded-full transition-all duration-300">
        <div className="flex items-center justify-between mx-auto px-6 py-3">
          {/* Centered TARAKI Logo */}
          <div className="flex-1 flex justify-start items-top left">
            <img
              src={require("./imgs/taraki-logo-black.png")}
              alt="TARAKI Logo"
              className="h-10 w-auto dark:hidden"
            />
            <img
              src={require("./imgs/TARAKI 10X WHITE.png")}
              alt="TARAKI Logo"
              className="h-10 w-auto hidden dark:inline-block"
            />
          </div>
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
            className="items-center justify-between hidden w-full tablet-m:flex tablet-m:w-auto mx-auto laptop-s:flex-1"
            id="navbar-cta"
            ref={navbarStickyRef}
          >
            <ul className="flex flex-col font-medium p-4 tablet-m:p-0 mt-4 rounded-lg tablet-m:space-x-8 rtl:space-x-reverse tablet-m:flex-row tablet-m:mt-0 laptop-m:text-[1rem]">
              <li>
                <Link
                  to="/"
                  onClick={(e) => {
                    scroller.scrollTo("about", {
                      smooth: true,
                      duration: 1000,
                      offset: -400,
                    });
                    closeNavbar();
                  }}
                  className="block py-2 px-3 tablet-m:p-0 text-white hover:text-orange-600 rounded-lg cursor-pointer"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  onClick={(e) => {
                    scroller.scrollTo("team", {
                      smooth: true,
                      duration: 1000,
                      offset: -280,
                    });
                    closeNavbar();
                  }}
                  className="block py-2 px-3 tablet-m:p-0 text-white hover:text-orange-600 rounded-lg cursor-pointer"
                >
                  TARAKIs
                </Link>
              </li>

              <li>
                <div className="dropdown">
                  <span className="rounded-md">
                    <button
                      className="inline-flex phone:py-2 tablet-m:py-0 px-3 w-full leading-5 transition duration-150 ease-in-out bg-transparent rounded-md text-white hover:text-orange-600 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800"
                      type="button"
                      aria-haspopup="true"
                      aria-expanded="true"
                      aria-controls="headlessui-menu-items-117"
                    >
                      <span>Explore</span>
                      <svg
                        className="w-5 h-5 ml-2 -mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </span>
                  <div className="opacity-0 invisible dropdown-menu transition-all duration-300 transform origin-top-right -translate-y-2 scale-100">
                    <div
                      className="absolute laptop-s:w-40 mt-2 origin-top-right bg-white dark:bg-trkblack divide-y divide-gray-100 dark:divide-gray-800 rounded-md shadow-lg outline-none border-0"
                      aria-labelledby="headlessui-menu-button-1"
                      id="headlessui-menu-items-117"
                      role="menu"
                    >
                      <div className="py-1">
                        <li>
                          <Link
                            to="/"
                            onClick={(e) => {
                              scroller.scrollTo("program", {
                                smooth: true,
                                duration: 1000,
                                offset: -120,
                              });
                              closeNavbar();
                            }}
                            className="text-gray-700 flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer hover:bg-orange-100"
                          >
                            Programs
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            onClick={(e) => {
                              scroller.scrollTo("framework", {
                                smooth: true,
                                duration: 1000,
                                offset: -120,
                              });
                              closeNavbar();
                            }}
                            className="text-gray-700 flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer hover:bg-orange-100"
                          >
                            Framework
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            onClick={(e) => {
                              scroller.scrollTo("events", {
                                smooth: true,
                                duration: 1000,
                                offset: -120,
                              });
                              closeNavbar();
                            }}
                            className="text-gray-700 flex justify-between w-full px-4 py-2 text-sm leading-5 cursor-pointer hover:bg-orange-100"
                          >
                            Events
                          </Link>
                        </li>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <Link
                  to="/"
                  onClick={(e) => {
                    scroller.scrollTo("faq", {
                      smooth: true,
                      duration: 1000,
                      offset: -100,
                    });
                    closeNavbar();
                  }}
                  className="block py-2 px-3 tablet-m:p-0 text-white hover:text-orange-600 rounded-lg cursor-pointer"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/tbi"
                  onClick={(e) => {
                    closeNavbar();
                  }}
                  activeClassName="text-orange-600"
                  className="block py-2 px-3 tablet-m:p-0 text-white hover:text-orange-600 rounded-lg cursor-pointer"
                >
                  Engagement
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex items-center space-x-2">
            {/* Auth Modal Toggle Button - Only show on homepage */}
            {window.location.pathname === "/" && (
              <button
                onClick={openModal}
                className="phone:hidden tablet-m:block bg-white tablet-m:px-3 tablet-m:py-2 laptop-s:px-8 laptop-s:py-3 text-[0.8rem] laptop-s:text-sm border border-trkblack rounded-md hover:bg-trkblack hover:text-white hover:border-orange-600 laptop-m:text-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-colors duration-200"
                type="button"
              >
                <span>GET STARTED</span>
              </button>
            )}
            <button
              aria-label="Toggle dark mode"
              className={`relative w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none group`}
              style={{ border: "none" }} // Remove border in all modes
              onClick={() => setDarkMode((prev) => !prev)}
            >
              <span
                className={`absolute left-0 top-0 w-full h-full rounded-full transition-shadow duration-300 group-hover:shadow-lg group-active:shadow-xl ${
                  darkMode ? "shadow-orange-400/60" : "shadow-gray-400/40"
                }`}
                style={{ pointerEvents: "none" }}
              ></span>
              <span
                className={`w-5 h-5 bg-white dark:bg-orange-500 rounded-full shadow-md transform transition-transform duration-300 ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                } group-hover:scale-110 group-active:scale-95 flex items-center justify-center text-lg`}
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
                <LoginForm authTab={authTab} setAuthTab={setAuthTab} />
              ) : (
                <SignupForm authTab={authTab} setAuthTab={setAuthTab} />
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
