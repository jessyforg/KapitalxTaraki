import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import TBI from "../components/TBI";
import InTTOTBI from "../components/InTTOTBI";
import Framework from "../components/Framework";
import Footer from "../components/Footer";
import Navbar from '../components/Navbar';

function Ecosystem() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
      return null;
    }
  });

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
      <Navbar hideNavLinks />
      <div className="max-w-[95%] mx-auto pt-24">
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
                <h1 className="font-bold text-2xl laptop-s:text-3xl desktop-s:text-4xl text-black dark:text-gray-950">
                  Ecosystem
                </h1>
              </div>
              <TBI hideHeading={true} />
            </div>
          </section>
          {/* Mentors Section */}
          <section id="mentors">
            <InTTOTBI />
          </section>
          {/* Framework Section */}
          <section id="framework">
            <Framework />
            <Footer /> {/* Footer is now only after Framework, inside the section */}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Ecosystem;