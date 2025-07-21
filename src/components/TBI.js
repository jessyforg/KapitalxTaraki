import React, { useState, useEffect } from "react";
import { scroller } from "react-scroll";
import { Link, useNavigate } from "react-router-dom";
import tarakiLogoBlack from "../components/imgs/taraki-black.svg";
import tarakiLogoWhite from "../components/imgs/TARAKI 10X WHITE.png";
import Intto from "./imgs/InTTO.svg";
import UP from "./imgs/SILBI_TBI.svg";
import SLU from "./imgs/SLU.svg";
import BSU from "./imgs/BSU.svg";
import IFSU from "./imgs/IFSU-TBI.svg";
import Henry from "./imgs/investors/Henry.webp";
import Jaydee from "./imgs/investors/Jaydee.webp";
import Wilson from "./imgs/investors/Wilson.webp";
import Elmer from "./imgs/investors/Elmer.webp";
import Angelo from "./imgs/investors/Angelo.webp";
import Benjie from "./imgs/investors/Benjie.webp";

function TBI() {
  const navigate = useNavigate();
  // Update dark mode state management
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("taraki-dark-mode") === "true";
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
      return false;
    }
  });

  // Add useEffect to sync with document class
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
  const handleScrollToHome = () => {
    scroller.scrollTo("Home", { smooth: true, duration: 1000, offset: -400 });
    navigate("/");
  };

  return (
    <>        
    <h1 className="font-semibold text-4xl sm:text-5xl text-center">
    Technological Business Incubators
     </h1>
      <div className="font-montserrat mt-6 laptop-s:mt-10 desktop-s:mt-12 desktop-m:mt-16">
        <div className="px-2 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* InTTO */}
            <a href="/tbi/intto">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <img
                  src={Intto}
                  alt="1st-ico"
                  className="w-24 h-24 object-contain mb-4"
                />
                <h2 className="font-bold text-lg mb-2 text-center">InTTO</h2>
                <p className="text-black dark:text-white text-center">
                  The Innovation and Technology Transfer Office (InTTO) fosters
                  innovation by offering business and technology transfer
                  opportunities to faculty, students, alumni, and the community
                  through its two specialized units.
                </p>
              </div>
            </a>
            {/* SILBI */}
            <a
              href="https://upbsilbi.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <img
                  src={UP}
                  alt="1st-ico"
                  className="w-24 h-24 object-contain mb-4"
                />
                <h2 className="font-bold text-lg mb-2 text-center">SILBI</h2>
                <p className="text-black dark:text-white text-center">
                  Silbi, meaning "service" in Filipino, reflects UP Baguio's
                  dedication to community service. The SILBI Center drives
                  transformation in Cordillera and Northern Luzon through research
                  and innovation, fostering public service initiatives.
                </p>
              </div>
            </a>
            {/* ConRes */}
            <a
              href="https://www.facebook.com/slu.edu.ph"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <img
                  src={SLU}
                  alt="1st-ico"
                  className="w-24 h-24 object-contain mb-4"
                />
                <h2 className="font-bold text-lg mb-2 text-center">ConRes</h2>
                <p className="text-black dark:text-white text-center">
                  Established in 2017 with CHED funding, the SIRIB Center created
                  a Technology Hub and Co-Working Space. It launched
                  "Technopreneurship 101" to integrate entrepreneurship into
                  engineering education, fostering tech-savvy entrepreneurs.
                </p>
              </div>
            </a>
            {/* ATBI / IC */}
            <a
              href="https://www.facebook.com/BenguetStateUniversity"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <img
                  src={BSU}
                  alt="1st-ico"
                  className="w-24 h-24 object-contain mb-4"
                />
                <h2 className="font-bold text-lg mb-2 text-center">ATBI / IC</h2>
                <p className="text-black dark:text-white text-center">
                  Founded under BOR Resolution No. 1939, s. 2010, the Agri-based
                  Technology Business Incubator/Innovation Center supports
                  start-ups and micro businesses in agricultural technology,
                  offering professional services to help them grow.
                </p>
              </div>
            </a>
            {/* IFSU IPTBM */}
            <a
              href="https://www.facebook.com/ifugaostateuniversity"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <img
                  src={IFSU}
                  alt="1st-ico"
                  className="w-24 h-24 object-contain mb-4"
                />
                <h2 className="font-bold text-lg mb-2 text-center">IFSU IPTBM</h2>
                <p className="text-black dark:text-white text-center">
                  Founded under BOR Resolution No. 1939, s. 2010, the Agri-based
                  Technology Business Incubator/Innovation Center supports
                  start-ups and micro businesses in agricultural technology,
                  offering professional services to help them grow.
                </p>
              </div>
            </a>
          </div>
        </div>
        <section id="mentors" className="my-16">
          <h1 className="font-semibold text-4xl md:text-5xl text-center mb-12 text-black dark:text-white">
            Our Mentors
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 px-4 md:px-8 max-w-7xl mx-auto">
            {/* Henry */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full overflow-hidden border-[5px] border-orange-400 shadow-xl">
                  <img 
                    className="w-full h-full object-cover" 
                    src={Henry} 
                    alt="Henry James Banayat" 
                  />
                </div>
              </div>
              <h2 className="font-bold text-xl text-black dark:text-white mt-6">Henry James Banayat</h2>
              <p className="text-sm text-black dark:text-white text-center mt-2 max-w-xs">Director of Business Development at Bitshares Labs, Inc.</p>
            </div>
            {/* Jaydee */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full overflow-hidden border-[5px] border-orange-400 shadow-xl">
                  <img 
                    className="w-full h-full object-cover" 
                    src={Jaydee} 
                    alt="Jaydee Rebadulla" 
                  />
                </div>
              </div>
              <h2 className="font-bold text-xl text-black dark:text-white mt-6">Jaydee Rebadulla</h2>
              <p className="text-sm text-black dark:text-white text-center mt-2 max-w-xs">Director at Lycaon Creatives; Chairman & CEO at Errand Doers PH; Owner and Founder at El Lote PH</p>
            </div>
            {/* Wilson */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full overflow-hidden border-[5px] border-orange-400 shadow-xl">
                  <img 
                    className="w-full h-full object-cover" 
                    src={Wilson} 
                    alt="Wilson Capuyan" 
                  />
                </div>
              </div>
              <h2 className="font-bold text-xl text-black dark:text-white mt-6">Wilson Capuyan</h2>
              <p className="text-sm text-black dark:text-white text-center mt-2 max-w-xs">Founder & General Manager at Pixels & Metrics Head of Growth at the Neutral and Space for the startups in the region</p>
            </div>
            {/* Elmer */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full overflow-hidden border-[5px] border-orange-400 shadow-xl">
                  <img 
                    className="w-full h-full object-cover" 
                    src={Elmer} 
                    alt="Elmer Macalingay" 
                  />
                </div>
              </div>
              <h2 className="font-bold text-xl text-black dark:text-white mt-6">Elmer Macalingay</h2>
              <p className="text-sm text-black dark:text-white text-center mt-2 max-w-xs">Founder & General Manager at Pixels & Metrics Head of Growth at the Neutral and Space for the startups in the region</p>
            </div>
            {/* Benjie */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full overflow-hidden border-[5px] border-orange-400 shadow-xl">
                  <img 
                    className="w-full h-full object-cover" 
                    src={Benjie} 
                    alt="Hon. Benjamin Magalong" 
                  />
                </div>
              </div>
              <h2 className="font-bold text-xl text-black dark:text-white mt-6">Hon. Benjamin Magalong</h2>
              <p className="text-sm text-black dark:text-white text-center mt-2 max-w-xs">City Mayor of Baguio</p>            </div>
            {/* Angelo */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full overflow-hidden border-[5px] border-orange-400 shadow-xl">
                  <img 
                    className="w-full h-full object-cover" 
                    src={Angelo} 
                    alt="Angelo Valdez" 
                  />
                </div>
              </div>
              <h2 className="font-bold text-xl text-black dark:text-white mt-6">Angelo Valdez</h2>
              <p className="text-sm text-black dark:text-white text-center mt-2 max-w-xs">CEO of Harper and Hill, Global & International Network Connector, ASEAN HR Business leader & Former Director for South East Asia at Morgan Philips Group</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default TBI;