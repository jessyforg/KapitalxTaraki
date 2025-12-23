import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import TBI from "../components/TBI";
import Framework from "../components/Framework";
import Footer from "../components/Footer";
import Navbar from '../components/Navbar';

function Ecosystem() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
      return null;
    }
  });

  // Handle hash navigation - improved to work when navigating from other pages
  useEffect(() => {
    const scrollToSection = (sectionId) => {
      // Wait for page to render, then scroll
      const attemptScroll = (attempts = 0) => {
        const el = document.getElementById(sectionId);
        if (el) {
          const yOffset = -100;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else if (attempts < 10) {
          // Retry if element not found yet (page still loading)
          setTimeout(() => attemptScroll(attempts + 1), 100);
        }
      };
      
      attemptScroll();
    };

    // Get hash from URL
    const hash = location.hash.replace('#', '');
    
    if (hash) {
      // Wait a bit for page to fully render
      setTimeout(() => {
        scrollToSection(hash);
      }, 300);
    }
  }, [location.hash, location.pathname]);

  const handleBack = () => {
    if (user?.role === 'entrepreneur') {
      navigate('/entrepreneur-dashboard');
    } else if (user?.role === 'investor') {
      navigate('/investor-dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[95%] mx-auto pt-32">
        <div className="w-full">
          {/* Main Section: Back button inside main content */}
          <section id="tbi">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors text-3xl rounded-full w-12 h-12 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  aria-label="Back"
                >
                  <FaArrowLeft />
                </button>
                <h1 className="font-bold text-2xl laptop-s:text-3xl desktop-s:text-4xl text-black dark:text-white">
                  Ecosystem
                </h1>
              </div>
              <TBI hideHeading={true} />
            </div>
          </section>
          
          {/* Framework Section */}
          <section id="framework">
            <Framework />
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Ecosystem;