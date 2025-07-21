import React, { useEffect, useState } from "react";
import tarakiLogo from "./imgs/TARAKI 10X WHITE.png";
import video from "../components/imgs/taraki-home-video.webm";

function Home() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_startups: 0,
    total_entrepreneurs: 0,
    total_investors: 0
  });

  // Dynamic API URL that works for both localhost and network access
  const getApiUrl = () => {
    // If we're accessing from localhost, use localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    // Otherwise, use the same hostname as the frontend (for network access)
    return `http://${window.location.hostname}:5000/api`;
  };

  const fetchStats = () => {
    fetch(`${getApiUrl()}/admin/dashboard-stats`)
      .then(response => response.json())
      .then(data => {
        if (!data.error) {
          setStats(data);
        }
      })
      .catch(error => console.error('Error fetching stats:', error));
  };

  useEffect(() => {
    document.title = "Welcome to TARAKI";
    
    // Initial fetch
    fetchStats();

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchStats, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Save original overflow
    const originalHtmlOverflow = document.documentElement.style.overflowX;
    const originalBodyOverflow = document.body.style.overflowX;
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.documentElement.style.overflowX = originalHtmlOverflow;
      document.body.style.overflowX = originalBodyOverflow;
    };
  }, []);

  return (
    <div style={{ width: '100vw', overflowX: 'hidden' }}>
      <div
        className="font-montserrat overflow-x-hidden min-h-screen w-full max-w-full flex flex-col items-center justify-center bg-trkblack"
        style={{ overflowX: 'hidden' }}
      >
        <section id="home" className="relative flex flex-col items-center justify-center w-full max-w-full h-screen">
          {/* Video background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            loading="lazy"
            style={{ minHeight: '100vh', width: '100%', minWidth: 0 }}
          >
            <source src={video} type="video/webm" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-10 z-10"></div>
          <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
            <img
              src={tarakiLogo}
              alt="TARAKI LOGO"
              className="w-full max-w-[20rem] sm:max-w-md md:max-w-lg lg:max-w-2xl"
              style={{ filter: "invert(0)" }}
            />
          </div>
        </section>

        {/* Analytics Section */}
        <section className="w-full max-w-full py-12 sm:py-20 px-4 bg-trkblack">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 w-full max-w-full">
              {/* Active Startups Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl transform hover:scale-105 transition-transform duration-300">
                <div className="text-center">
                  <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">{stats.total_startups}</h3>
                  <p className="text-gray-300 text-base sm:text-lg">Active Startups</p>
                </div>
              </div>

              {/* Active Entrepreneurs Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl transform hover:scale-105 transition-transform duration-300">
                <div className="text-center">
                  <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">{stats.total_entrepreneurs}</h3>
                  <p className="text-gray-300 text-base sm:text-lg">Active Entrepreneurs</p>
                </div>
              </div>

              {/* Active Investors Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl transform hover:scale-105 transition-transform duration-300">
                <div className="text-center">
                  <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">{stats.total_investors}</h3>
                  <p className="text-gray-300 text-base sm:text-lg">Active Investors</p>
                </div>
              </div>

              {/* Funded Startups Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl transform hover:scale-105 transition-transform duration-300">
                <div className="text-center">
                  <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">{stats.total_funded_startups || 0}</h3>
                  <p className="text-gray-300 text-base sm:text-lg">Funded Startups</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;


