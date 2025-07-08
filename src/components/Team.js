import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ateJez from "../components/imgs/team/ate-jez.webp";
import maamT from "../components/imgs/team/thelma.webp";
import pia from "../components/imgs/team/pia.webp";
import "./styles.css";

function TarakiTeam() {
  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    const swiper = new window.Swiper(".mySwiper", {
      effect: "cards",
      grabCursor: true,
      scrollbar: {
        el: ".swiper-scrollbar",
        hide: false,
      },
      breakpoints: {
        768: {
          slidesPerView: 1,
          spaceBetween: 10,
          freeMode: true,
          centeredSlides: false,
        },
      },
    });
    AOS.init({
      easing: "ease", // Easing function
      once: false,
    });
  }, []);

  return (
    <section id="team">
      <div className="font-satoshi overflow-x-hidden">
        <div className="cont tablet:px-8 phone:py-2">
          <section className="mt-16 tablet:mt-12 text-center">
            <h1
              className="font-montserrat font-semibold text-md tablet:text-lg tablet-m:text-2xl laptop-s:text-3xl laptop-m:text-[2.2rem] desktop-m:text-[2.6rem] aos-init"
              data-aos="fade-down"
              data-aos-delay="200"
            >
              TARAKIs
            </h1>
            <p
              className="font-normal font-montserrat text-sm tablet:text-md tablet-m:text-xl laptop-s:text-xl laptop-m:text-[1.5rem] desktop-m:text-[1.8rem] px-10 tablet:px-0 mt-5 tablet:mt-0 tablet-m:mr-5 tablet-m:mt-4 tablet:leading-6 tablet-m:leading-8 laptop-s:leading-loose aos-init"
              data-aos="fade-up"
              data-aos-delay="600"
            >
              At TARAKI, our team is dedicated to driving technological
              innovation and fostering a collaborative environment for growth
              and advancement. Our experts bring diverse backgrounds and a
              shared commitment to our mission.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-8 mt-12">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={maamT} 
                  alt="Dr. Thelma D. Palaoag"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h1 className="font-montserrat text-[1.8rem] font-semibold text-orange-600">
                  Dr. Thelma D. Palaoag
                </h1>
                <h2 className="font-montserrat text-[1.4rem] text-gray-900 mt-1">
                  Project Leader
                </h2>
                <p className="font-montserrat text-[1.1rem] text-gray-700 mt-4 leading-relaxed">
                  20 years of experience in technology and innovation. Her visionary leadership has been instrumental in shaping TARAKI's strategic direction.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={ateJez} 
                  alt="Jezelle Q. Oliva"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h1 className="font-montserrat text-[1.8rem] font-semibold text-orange-600">
                  Jezelle Q. Oliva
                </h1>
                <h2 className="font-montserrat text-[1.4rem] text-gray-900 mt-1">
                  Startup Community Enabler
                </h2>
                <p className="font-montserrat text-[1.1rem] text-gray-700 mt-4 leading-relaxed">
                  Jezelle is an educator, empowering TARAKI startups, and fosters community growth through spearheading innovative initiatives.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={pia} 
                  alt="Pia Bernardine T. Capuyan"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h1 className="font-montserrat text-[1.8rem] font-semibold text-orange-600">
                  Pia Bernardine T. Capuyan
                </h1>
                <h2 className="font-montserrat text-[1.4rem] text-gray-900 mt-1">
                  Project Assistant
                </h2>
                <p className="font-montserrat text-[1.1rem] text-gray-700 mt-4 leading-relaxed">
                  An experienced writer with a background in architecture, combining creativity with technical insight. She helps drive fresh ideas and solutions within TARAKI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TarakiTeam;