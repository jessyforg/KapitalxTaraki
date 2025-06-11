import React, { useState, useEffect } from "react";
import { scroller } from "react-scroll";
import { Link, useNavigate } from "react-router-dom";
import tarakiLogoBlack from "../components/imgs/taraki-black.svg";
import tarakiLogoWhite from "../components/imgs/TARAKI 10X WHITE.png";
import "aos/dist/aos.css";
import Intto from "./imgs/InTTO.svg";
import UP from "./imgs/SILBI_TBI.svg";
import SLU from "./imgs/SLU.svg";
import BSU from "./imgs/BSU.svg";
import IFSU from "./imgs/IFSU-TBI.svg";
import Henry from "./imgs/investors/Henry-removebg-preview.webp";
import Jaydee from "./imgs/investors/Jaydee-removebg-preview.webp";
import Wilson from "./imgs/investors/Wilson-removebg-preview.webp";
import Elmer from "./imgs/investors/Elmer-removebg-preview.webp";
import Angelo from "./imgs/investors/Angelo-removebg-preview.webp";
import Benjie from "./imgs/investors/Benjie-removebg-preview.webp";

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

  const [fadeIn, setFadeIn] = useState(false);

  React.useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleScrollToHome = () => {
    scroller.scrollTo("Home", { smooth: true, duration: 1000, offset: -400 });
    navigate("/");
  };

  return (
    <>
      <div className={`font-montserrat mt-24 laptop-s:mt-32 desktop-s:mt-36 desktop-m:mt-40 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="font-bold text-[1rem] laptop-s:text-xl desktop-s:text-2xl text-center">
          Technological Business Incubators
        </h1>
        <section className="grid grid-cols-1 place-items-center justify-items-center tablet:grid gap-4 tablet-m:gap-1  tablet:grid-cols-2 tablet-m:grid-cols-3 tablet:px-12 laptop-m:px-24 desktop-s:px-28 desktop-m:px-36">
          <a href="/tbi/intto">
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80 transition-all duration-300 hover:scale-110 hover:border-ucgreen hover:border-4">
              <img
                src={Intto}
                alt="1st-ico"
                className="h-12 laptop-s:h-16 desktop-m:h-20 aos-init mb-1"
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
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80 transition-all duration-300 hover:scale-110 hover:border-upred hover:border-4">
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
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80 transition-all duration-300 hover:scale-110 hover:border-slublue hover:border-4">
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
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80 transition-all duration-300 hover:scale-110 hover:border-bsuyellow hover:border-4 tablet-m:hidden">
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
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80 transition-all duration-300 hover:scale-110 hover:border-ifsugreen hover:border-4 tablet-m:hidden">
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
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80 transition-all duration-300 hover:scale-110 hover:border-bsuyellow hover:border-4">
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
            <div className="border flex flex-col justify-center items-center mt-5 border-gray-300 rounded-lg w-72 h-60 laptop-s:w-[23rem] laptop-m:w-[25rem] desktop-s:w-[27rem] desktop-m:w-[32rem] laptop-s:h-72 desktop-m:h-80 transition-all duration-300 hover:scale-110 hover:border-ifsugreen hover:border-4">
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

        <section className="my-10">
          <h1 className="font-bold text-[1rem] laptop-s:text-xl desktop-s:text-2xl text-center mb-6">
            Mentors
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 tablet-m:grid-cols-3 gap-8 px-6 tablet-m:px-8 justify-center items-center place-items-center">
            {/* Henry */}
            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl flex flex-col items-center p-5 pt-3 transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200 dark:border-neutral-800 w-64 h-96 md:w-80 md:h-[28rem] mx-auto">
              <div className="w-64 h-80 md:w-72 md:h-[22rem] flex items-center justify-center mb-2 rounded-xl overflow-hidden">
                <img src={Henry} alt="Henry James Banayat" className="object-contain w-full h-full drop-shadow-lg rounded-xl" />
              </div>
              <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1 mt-1">Henry James Banayat</h2>
              <p className="text-xs text-gray-500 dark:text-gray-300 text-center">Director, Bitshares Labs, Inc. Blockchain and startup growth expert.</p>
            </div>
            {/* Jaydee */}
            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl flex flex-col items-center p-5 pt-3 transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200 dark:border-neutral-800 w-64 h-96 md:w-80 md:h-[28rem] mx-auto">
              <div className="w-64 h-80 md:w-72 md:h-[22rem] flex items-center justify-center mb-2 rounded-xl overflow-hidden">
                <img src={Jaydee} alt="Jaydee Rebadulla" className="object-contain w-full h-full drop-shadow-lg rounded-xl" />
              </div>
              <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1 mt-1">Jaydee Rebadulla</h2>
              <p className="text-xs text-gray-500 dark:text-gray-300 text-center">CEO, Errand Doers PH; Director, Lycaon Creatives; Founder, El Lote PH.</p>
            </div>
            {/* Wilson */}
            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl flex flex-col items-center p-5 pt-3 transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200 dark:border-neutral-800 w-64 h-96 md:w-80 md:h-[28rem] mx-auto">
              <div className="w-64 h-80 md:w-72 md:h-[22rem] flex items-center justify-center mb-2 rounded-xl overflow-hidden">
                <img src={Wilson} alt="Wilson Capuyan" className="object-contain w-full h-full drop-shadow-lg rounded-xl" />
              </div>
              <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1 mt-1">Wilson Capuyan</h2>
              <p className="text-xs text-gray-500 dark:text-gray-300 text-center">Founder & GM, Pixels & Metrics. Startup growth strategist.</p>
            </div>
            {/* Elmer */}
            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl flex flex-col items-center p-5 pt-3 transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200 dark:border-neutral-800 w-64 h-96 md:w-80 md:h-[28rem] mx-auto">
              <div className="w-64 h-80 md:w-72 md:h-[22rem] flex items-center justify-center mb-2 rounded-xl overflow-hidden">
                <img src={Elmer} alt="Elmer Macalingay" className="object-contain w-full h-full drop-shadow-lg rounded-xl" />
              </div>
              <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1 mt-1">Elmer Macalingay</h2>
              <p className="text-xs text-gray-500 dark:text-gray-300 text-center">Founder, Health 100 Restoreant. Food entrepreneur and innovator.</p>
            </div>
            {/* Benjie */}
            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl flex flex-col items-center p-5 pt-3 transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200 dark:border-neutral-800 w-64 h-96 md:w-80 md:h-[28rem] mx-auto">
              <div className="w-64 h-80 md:w-72 md:h-[22rem] flex items-center justify-center mb-2 rounded-xl overflow-hidden">
                <img src={Benjie} alt="Hon. Benjamin Magalong" className="object-contain w-full h-full drop-shadow-lg rounded-xl" />
              </div>
              <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1 mt-1">Hon. Benjamin Magalong</h2>
              <p className="text-xs text-gray-500 dark:text-gray-300 text-center">City Mayor of Baguio. Innovation and governance advocate.</p>
            </div>
            {/* Angelo */}
            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl flex flex-col items-center p-5 pt-3 transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200 dark:border-neutral-800 w-64 h-96 md:w-80 md:h-[28rem] mx-auto">
              <div className="w-64 h-80 md:w-72 md:h-[22rem] flex items-center justify-center mb-2 rounded-xl overflow-hidden">
                <img src={Angelo} alt="Angelo Valdez" className="object-contain w-full h-full drop-shadow-lg rounded-xl" />
              </div>
              <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1 mt-1">Angelo Valdez</h2>
              <p className="text-xs text-gray-500 dark:text-gray-300 text-center">CEO, Harper and Hill. ASEAN HR leader and connector.</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="text-center bg-white p-2 rounded-lg shadow mt-8 laptop-s:text-center">
        <div className="w-full mx-auto max-w-screen-xl p-4 px-14 tablet:px-64 tablet:flex tablet:items-center tablet:justify-between laptop-s:px-[32rem] phone:px-16 tablet-m:px-96">
          <span className="text-xs text-gray-400 text-center laptop-m:text-sm">
            © 2024 | TARAKI | All Rights Reserved Designed by{" "}
            <span className="font-bold text-gray-500"> TARAKI-CAR</span>
          </span>
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
        </div>
      </footer>
    </>
  );
}

export default TBI;