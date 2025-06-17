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
      <div className="font-montserrat mt-4 laptop-s:mt-8 desktop-s:mt-10 desktop-m:mt-12">
        <h1 className="font-bold text-[1rem] laptop-s:text-xl desktop-s:text-2xl text-center">
          Technological Business Incubators
        </h1>
        <section id="tbi" className="grid grid-cols-1 place-items-center justify-items-center tablet:grid gap-4 tablet-m:gap-1  tablet:grid-cols-2 tablet-m:grid-cols-3 tablet:px-12 laptop-m:px-24 desktop-s:px-28 desktop-m:px-36">
          <a href="/tbi/intto">
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80">
              <img
                src={Intto}
                alt="1st-ico"
                className="h-12 laptop-s:h-16 desktop-m:h-20 mb-1"
              />
              <h3 className="py-3 text-center text-[0.9rem] laptop-s:text-xl desktop-m:[1.5rem] text-ucgreen font-bold">
                InTTO
              </h3>
              <p className="text-[0.7rem] laptop-s:text-[0.8rem] desktop-m:text-[0.9rem]  text-center font-regular px-10 mt-1 aos-init">
                The Innovation and Technology Transfer Office (InTTO) fosters
                innovation by offering business and technology transfer
                opportunities to faculty, students, alumni, and the community
                through its two specialized units.
              </p>
            </div>
          </a>
          <a
            href="https://upbsilbi.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80">
              <img
                src={UP}
                alt="1st-ico"
                className="h-12 laptop-s:h-16 desktop-m:h-20 aos-init"
              />
              <h3 className="py-3 text-center text-[0.9rem] laptop-s:text-xl desktop-m:[1.5rem] font-bold text-upred">
                SILBI
              </h3>
              <p className="text-[0.7rem] tablet-m:text-[0.6rem] laptop-s:text-[0.8rem] desktop-m:text-[0.9rem] text-center font-regular px-10 mt-1 aos-init">
                Silbi, meaning "service" in Filipino, reflects UP Baguio's
                dedication to community service. The SILBI Center drives
                transformation in Cordillera and Northern Luzon through research
                and innovation, fostering public service initiatives.
              </p>
            </div>
          </a>
          <a
            href="https://www.facebook.com/slu.edu.ph"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80">
              <img
                src={SLU}
                alt="1st-ico"
                className="h-12 laptop-s:h-16 desktop-m:h-20 aos-init"
              />
              <h3 className="py-3 text-center text-[0.9rem] laptop-s:text-xl desktop-m:[1.5rem] font-bold text-slublue">
                ConRes
              </h3>
              <p className="text-[0.7rem] tablet-m:text-[0.6rem] laptop-s:text-[0.8rem] desktop-m:text-[0.9rem]  text-center font-regular px-10 mt-1 aos-init">
                Established in 2017 with CHED funding, the SIRIB Center created
                a Technology Hub and Co-Working Space. It launched
                "Technopreneurship 101" to integrate entrepreneurship into
                engineering education, fostering tech-savvy entrepreneurs.
              </p>
            </div>
          </a>
          <a
            href="https://www.facebook.com/BenguetStateUniversity"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80 tablet-m:hidden">
              <img
                src={BSU}
                alt="1st-ico"
                className="h-12 laptop-s:h-16 desktop-m:h-20 aos-init"
              />
              <h3 className="py-3 text-center text-[0.9rem] laptop-s:text-xl desktop-m:[1.5rem] font-bold text-bsuyellow">
                ATBI / IC
              </h3>
              <p className="text-[0.7rem] tablet-m:text-[0.6rem] laptop-s:text-[0.8rem] desktop-m:text-[0.9rem]  text-center font-regular px-10 mt-1 aos-init">
                Founded under BOR Resolution No. 1939, s. 2010, the Agri-based
                Technology Business Incubator/Innovation Center supports
                start-ups and micro businesses in agricultural technology,
                offering professional services to help them grow.
              </p>
            </div>
          </a>
          <a
            href="https://www.facebook.com/ifugaostateuniversity"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80 tablet-m:hidden">
              <img
                src={IFSU}
                alt="1st-ico"
                className="h-[4.5rem] laptop-s:h-10 laptop-s:w-10 desktop-m:w-[25rem] aos-init"
              />
              <h3 className="py-3 text-center text-[0.9rem] laptop-s:text-xl desktop-m:[1.5rem] font-bold text-ifsugreen">
                IFSU IPTBM
              </h3>
              <p className="text-[0.7rem] tablet-m:text-[0.6rem] laptop-s:text-[0.8rem] desktop-m:text-[0.9rem]  text-center font-regular px-10 mt-1 aos-init">
                Founded under BOR Resolution No. 1939, s. 2010, the Agri-based
                Technology Business Incubator/Innovation Center supports
                start-ups and micro businesses in agricultural technology,
                offering professional services to help them grow.
              </p>
            </div>
          </a>
        </section>
        <section className="grid grid-cols-1 place-items-center justify-items-center tablet-m:grid gap-4 tablet-m:gap-1  tablet:grid-cols-2 tablet-m:grid-cols-2 tablet-m:px-[12.5rem] laptop-s:px-[15.3rem] laptop-m:px-[18.9rem] desktop-s:px-[21.3rem] desktop-m:px-[26rem] phone:pt-4 phone:hidden tablet:hidden">
          <a
            href="https://www.facebook.com/BenguetStateUniversity"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80">
              <img
                src={BSU}
                alt="1st-ico"
                className="h-12 laptop-s:h-16 desktop-m:h-20 aos-init"
              />
              <h3 className="py-3 text-center text-xl laptop-s:text-xl desktop-m:[1.5rem] font-bold text-bsuyellow">
                ATBI / IC
              </h3>
              <p className="text-[0.7rem] tablet-m:text-[0.6rem] laptop-s:text-[0.8rem] desktop-m:text-[0.9rem]  text-center font-regular px-10 mt-1 aos-init">
                Founded under BOR Resolution No. 1939, s. 2010, the Agri-based
                Technology Business Incubator/Innovation Center supports
                start-ups and micro businesses in agricultural technology,
                offering professional services to help them grow.
              </p>
            </div>
          </a>
          <a
            href="https://www.facebook.com/ifugaostateuniversity"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80">
              <img
                src={IFSU}
                alt="1st-ico"
                className="h-14 tablet-m:w-[3.8rem] laptop-s:h-[4.5rem] laptop-s:w-20 desktop-m:w-[5.7rem] desktop-m:h-20 aos-init"
              />
              <h3 className="py-3 text-center text-xl laptop-s:text-xl desktop-m:[1.5rem] font-bold text-ifsugreen">
                IFSU IPTBM
              </h3>
              <p className="text-[0.7rem] tablet-m:text-[0.6rem] laptop-s:text-[0.8rem] desktop-m:text-[0.9rem]  text-center font-regular px-10 mt-1 aos-init">
                Founded under BOR Resolution No. 1939, s. 2010, the Agri-based
                Technology Business Incubator/Innovation Center supports
                start-ups and micro businesses in agricultural technology,
                offering professional services to help them grow.
              </p>
            </div>
          </a>
        </section>

        <section id="mentors" className="my-16">
          <h1 className="font-bold text-2xl md:text-3xl text-center mb-12 text-gray-800 dark:text-white">
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
              <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mt-6">Henry James Banayat</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2 max-w-xs">Director of Business Development at Bitshares Labs, Inc.</p>
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
              <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mt-6">Jaydee Rebadulla</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2 max-w-xs">Director at Lycaon Creatives; Chairman & CEO at Errand Doers PH; Owner and Founder at El Lote PH</p>
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
              <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mt-6">Wilson Capuyan</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2 max-w-xs">Founder & General Manager at Pixels & Metrics Head of Growth at the Neutral and Space for the startups in the region</p>
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
              <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mt-6">Elmer Macalingay</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2 max-w-xs">Founder & General Manager at Pixels & Metrics Head of Growth at the Neutral and Space for the startups in the region</p>
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
              <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mt-6">Hon. Benjamin Magalong</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2 max-w-xs">City Mayor of Baguio</p>            </div>
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
              <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mt-6">Angelo Valdez</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2 max-w-xs">CEO of Harper and Hill, Global & International Network Connector, ASEAN HR Business leader & Former Director for South East Asia at Morgan Philips Group</p>
            </div>
          </div>
        </section>
      </div>
          <ul className="flex flex-wrap items-center mt-0 text-sm font-medium phone:hidden laptop:flex text-gray-400">
            <li>
              <a href="#section2" className="hover:underline me-4 tablet:me-6">
                About
              </a>
            </li>
            <li>
              <a href="#1" className="hover:underline me-4 tablet:me-6">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#2" className="hover:underline me-4 tablet:me-6">
                Licensing
              </a>
            </li>
          </ul>
    </>
  );
}

export default TBI;