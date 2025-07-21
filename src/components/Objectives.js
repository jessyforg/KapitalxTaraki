import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import icon1 from "../components/imgs/2.webp";
import icon2 from "../components/imgs/3.webp";
import icon3 from "../components/imgs/5.webp";
import icon4 from "../components/imgs/6.webp";
import icon5 from "../components/imgs/7.webp";
import icon6 from "../components/imgs/8.webp";

function Objective() {
  useEffect(() => {
    AOS.init({
      duration: 800, // Animation duration
      easing: "ease", // Easing function
      once: false,
    });
  }, []);

  return (
    <div id="objectives" className="py-8 px-4 tablet:px-16 bg-transparent">
      <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8" data-aos="fade-up">Objectives</h1>
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-8">
        {/* Objective 1 */}
        <div className="bg-white rounded-xl shadow-lg flex flex-col items-center p-6" style={{ background: '#fff' }}>
          <img
            src={icon1}
            alt="1st-ico"
            className="w-28 h-28 mb-4 aos-init"
            data-aos="fade-right"
          />
          <p className="text-center text-black dark:text-white font-montserrat aos-init" data-aos="fade-right">
            Establishment of a 5-yr Regional Startup Development Plan and Roadmaps
          </p> 
        </div>
        {/* Objective 2 */}
        <div className="bg-white rounded-xl shadow-lg flex flex-col items-center p-6" style={{ background: '#fff' }}>
          <img
            src={icon2}
            alt="2nd-ico"
            className="w-28 h-28 mb-4 aos-init"
            data-aos="fade-down"
          />
          <p className="text-center text-black dark:text-white font-montserrat aos-init" data-aos="fade-down">
            Increasing Awareness about the Consortium
          </p>
        </div>
        {/* Objective 3 */}
        <div className="bg-white rounded-xl shadow-lg flex flex-col items-center p-6" style={{ background: '#fff' }}>
          <img
            src={icon3}
            alt="3rd-ico"
            className="w-28 h-28 mb-4 aos-init"
            data-aos="fade-left"
          />
          <p className="text-center text-black dark:text-white font-montserrat aos-init" data-aos="fade-left">
            Upskilling and Upscaling Activities
          </p>
        </div>
        {/* Objective 4 */}
        <div className="bg-white rounded-xl shadow-lg flex flex-col items-center p-6" style={{ background: '#fff' }}>
          <img
            src={icon4}
            alt="4th-ico"
            className="w-28 h-28 mb-4 aos-init"
            data-aos="fade-right"
          />
          <p className="text-center text-black dark:text-white font-montserrat aos-init" data-aos="fade-right">
            Establishment of Local Investor Network
          </p>
        </div>
        {/* Objective 5 */}
        <div className="bg-white rounded-xl shadow-lg flex flex-col items-center p-6" style={{ background: '#fff' }}>
          <img
            src={icon5}
            alt="5th-ico"
            className="w-28 h-28 mb-4 aos-init"
            data-aos="fade-up"
          />
          <p className="text-center text-black dark:text-white font-montserrat aos-init" data-aos="fade-up">
            Cross Pollination Undertakings Among Stakeholders
          </p>
        </div>
        {/* Objective 6 */}
        <div className="bg-white rounded-xl shadow-lg flex flex-col items-center p-6" style={{ background: '#fff' }}>
          <img
            src={icon6}
            alt="6th-ico"
            className="w-28 h-28 mb-4 aos-init"
            data-aos="fade-left"
          />
          <p className="text-center text-black dark:text-white font-montserrat aos-init" data-aos="fade-left">
            Activating startup activity hubs in lesser active provinces in the regions
          </p>
        </div>
      </div>
    </div>
  );
}

export default Objective;
