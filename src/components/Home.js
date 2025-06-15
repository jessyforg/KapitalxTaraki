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

  const fetchStats = () => {
    fetch('http://localhost/KapitalXTaraki/KapitalxTaraki/src/api/get_stats.php')
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

  return (
    <div className="font-montserrat overflow-x-hidden min-h-screen w-full flex flex-col items-center justify-center bg-trkblack">
      <section id="home" className="relative flex flex-col items-center justify-center w-full h-screen">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          loading="lazy"
          style={{ minHeight: '100vh', minWidth: '100vw' }}
        >
          <source src={video} type="video/webm" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 z-10"></div>
        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
          <img
            src={tarakiLogo}
            alt="TARAKI LOGO"
            className="w-[60rem] tablet:w-[60rem] laptop-s:w-[60rem] desktop-m:w-[60rem] mx-auto"
            style={{ filter: "invert(0)" }}
          />
        </div>
      </section>

      {/* Analytics Section */}
      <section className="w-full py-20 px-4 bg-trkblack">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Active Startups Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <h3 className="text-4xl font-bold text-white mb-2">{stats.total_startups}</h3>
                <p className="text-gray-300 text-lg">Active Startups</p>
              </div>
            </div>

            {/* Active Entrepreneurs Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <h3 className="text-4xl font-bold text-white mb-2">{stats.total_entrepreneurs}</h3>
                <p className="text-gray-300 text-lg">Active Entrepreneurs</p>
              </div>
            </div>

            {/* Active Investors Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <h3 className="text-4xl font-bold text-white mb-2">{stats.total_investors}</h3>
                <p className="text-gray-300 text-lg">Active Investors</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
