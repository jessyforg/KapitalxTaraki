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
              className="font-montserrat font-bold text-md tablet:text-lg tablet-m:text-2xl laptop-s:text-3xl laptop-m:text-[2.3rem] desktop-m:text-[2.9rem] desktop-m:mb-7 aos-init"
              data-aos="fade-down"
              data-aos-delay="200"
            >
              TARAKIs
            </h1>
            <p
              className="font-montserrat font-light tablet:font-normal tablet:leading-6 text-sm tablet:text-md tablet-m:text-lg tablet-m:px-24 tablet:px-20 px-10 mt-5 tablet:mt-2 laptop-s:text-lg laptop-m:text-[1.4rem] desktop-m:text-[1.6rem] laptop-s:mx-40 laptop-m:mx-80 aos-init"
              data-aos="fade-up"
              data-aos-delay="600"
            >
              At TARAKI, our team is dedicated to driving technological
              innovation and fostering a collaborative environment for growth
              and advancement. Our experts bring diverse backgrounds and a
              shared commitment to our mission.
            </p>
          </section>
          <section id="team" className="mx-auto mt-5 tablet:px-3 tablet-m:px-8">
            <div className="swiper mySwiper px-10 tablet:hidden">
              <div className="swiper-wrapper aos-init" data-aos="flip-right">
                <div className="swiper-slide shadow-lg bg-white flex flex-col justify-center items-center w-[100%] tablet:w-full tablet:my-4 tablet:h-64 tablet-m:h-80 h-[26rem] my-5">
                  <div
                    className="bg-cover bg-center w-full h-64 tablet:h-72 tablet-m:h-80"
                    style={{ backgroundImage: `url(${maamT})` }}
                  ></div>
                  <div className="flex flex-col justify-center px-2 py-2 tablet:px-3">
                    <h1 className="font-montserrattext-[1.1rem] tablet:text-[1.5rem] tablet-m:text-[1.7rem] font-semibold text-orange-700">
                      Dr. Thelma D. Palaoag
                    </h1>
                    <h1 className="font-montserrat text-[0.9rem] tablet:text-lg tablet-m:text-xl">
                      Project Leader
                    </h1>
                    <p className="font-montserrat bg-white font-extralight text-[0.8rem] tablet:mt-2 tablet-m:mt-6 tablet:text-[1rem] tablet-m:text-[1.1rem] leading-relaxed">
                      Dr. Thelma brings over 20 years of experience in
                      technology and innovation. Her visionary leadership has
                      been instrumental in shaping TARAKI's strategic direction.
                    </p>
                  </div>
                </div>
                <div className="swiper-slide shadow-lg bg-white flex flex-col justify-center items-center w-[100%] tablet:w-full tablet:my-4 tablet:h-64 tablet-m:h-80 h-[26rem] my-5">
                  <div
                    className="bg-cover bg-center w-full h-64 tablet:h-72 tablet-m:h-80"
                    style={{ backgroundImage: `url(${ateJez})` }}
                  ></div>
                  <div className="flex flex-col justify-center px-2 py-2 tablet:px-3">
                    <h1 className="font-montserrat text-[1.1rem] tablet:text-[1.5rem] tablet-m:text-[1.7rem] font-semibold text-orange-700">
                      Jezelle Q. Oliva
                    </h1>
                    <h1 className="font-montserrat text-[0.9rem] tablet:text-lg tablet-m:text-xl">
                      Startup Community Enabler
                    </h1>
                    <p className="font-montserrat bg-white font-extralight text-[0.8rem] tablet:mt-2 tablet-m:mt-6 tablet:text-[1rem] tablet-m:text-[1.1rem] leading-relaxed">
                      Jezelle is an educator, empowering TARAKI startups, and
                      fosters community growth through spearheading innovative
                      initiatives.
                    </p>
                  </div>
                </div>
                <div className="swiper-slide shadow-lg bg-white flex flex-col justify-center items-center w-[100%] tablet:w-full tablet:my-4 tablet:h-64 tablet-m:h-80 h-[26rem] my-5">
                  <div
                    className="bg-cover bg-center w-full h-64 tablet:h-72 tablet-m:h-80"
                    style={{ backgroundImage: `url(${pia})` }}
                  ></div>
                  <div className="flex flex-col justify-center px-2 py-2 tablet:px-3">
                    <h1 className="font-montserrat text-[1.1rem] tablet:text-[1.5rem] tablet-m:text-[1.7rem] font-semibold text-orange-700">
                      Pia Bernardine T. Capuyan
                    </h1>
                    <h1 className="font-montserrat text-[0.9rem] tablet:text-lg tablet-m:text-xl">
                      Project Assistant
                    </h1>
                    <p className="font-montserrat bg-white font-extralight text-[0.7rem] tablet:mt-2 tablet-m:mt-6 tablet:text-[1rem] tablet-m:text-[1.1rem] leading-relaxed">
                      An experienced writer with a background in architecture, combining creativity with technical insight. 
                      She helps drive fresh ideas and solutions within TARAKI.
                    </p>
                  </div>
                </div>
              </div>
              <div className="swiper-scrollbar"></div>
            </div>

            <div className="tabletCont phone:hidden tablet-m:hidden tablet:flex justify-between items-center">
              <div
                className="relative overflow-hidden shadow-md m-2 w-56 h-72 rounded-3xl cursor-pointer text-2xl font-bold group transition-all duration-500 hover:w-[120rem] aos-init"
                data-aos="flip-left"
                data-aos-delay="200"
              >
                <div
                  className="bg-cover bg-center h-full w-full transition-all duration-500 group-hover:w-1/3"
                  style={{ backgroundImage: `url(${maamT})` }}
                ></div>
                <div className="absolute top-0 left-0 h-full px-3 flex items-center justify-center bg-white transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:left-1/3">
                  <div className="font-montserrat flex flex-col justify-center tablet:px-3">
                    <h1 className="font-montserrat text-[0.9rem] tablet:text-[1.5rem] tablet-m:text-[1.7rem] laptop-m:text-[2rem] font-semibold text-orange-700">
                      Dr. Thelma D. Palaoag
                    </h1>
                    <h1 className="text-[0.8rem] font-montserrat tablet:text-lg tablet-m:text-xl laptop-m:text-2xl">
                      Project Leader
                    </h1>
                    <p className="bg-white font-montserrat font-extralight text-[0.7rem] tablet:mt-2 tablet-m:mt-6 tablet:text-[1rem] tablet-m:text-[1.1rem] laptop-m:text-[1.4rem] leading-relaxed">
                      Dr. Thelma brings over 20 years of experience in
                      technology and innovation. Her visionary leadership has
                      been instrumental in shaping TARAKI's strategic direction.
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="relative overflow-hidden w-56 h-72 shadow-md m-2 rounded-3xl cursor-pointer text-2xl font-bold group transition-all duration-500 hover:w-[120rem] aos-init"
                data-aos="flip-left"
                data-aos-delay="400"
              >
                <div
                  className="bg-cover bg-center h-full w-full transition-all duration-500 group-hover:w-1/3"
                  style={{ backgroundImage: `url(${ateJez})` }}
                ></div>
                <div className="absolute top-0 left-0 h-full px-3 flex items-center justify-center bg-white transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:left-1/3">
                  <div className="font-montserrat flex flex-col justify-center tablet:px-3">
                    <h1 className="font-montserrat text-[0.9rem] tablet:text-[1.5rem] tablet-m:text-[1.7rem] laptop-m:text-[2rem] font-semibold text-orange-700">
                      Jezelle Q. Oliva
                    </h1>
                    <h1 className="font-montserrat text-[0.8rem] tablet:text-lg tablet-m:text-xl laptop-m:text-2xl">
                      Startup Community Enabler
                    </h1>
                    <p className="font-montserrat bg-white font-extralight text-[0.7rem] tablet:mt-2 tablet-m:mt-6 tablet:text-[1rem] tablet-m:text-[1.1rem] laptop-m:text-[1.4rem] leading-relaxed">
                      Jezelle is an educator, empowering TARAKI startups, and
                      fosters community growth through spearheading innovative
                      initiatives.
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="relative overflow-hidden w-56 h-72 shadow-md m-2 rounded-3xl cursor-pointer text-2xl font-bold group transition-all duration-500 hover:w-[120rem] aos-init"
                data-aos="flip-left"
                data-aos-delay="600"
              >
                <div
                  className="bg-cover bg-center h-full w-full transition-all duration-500 group-hover:w-1/3"
                  style={{ backgroundImage: `url(${pia})` }}
                ></div>
                <div className="absolute top-0 left-0 h-full px-3 flex items-center justify-center bg-white transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:left-1/3">
                  <div className="font-montserrat flex flex-col justify-center tablet:px-3">
                    <h1 className="font-montserrat text-[0.9rem] tablet:text-[1.5rem] tablet-m:text-[1.7rem] laptop-m:text-[2rem] font-semibold text-orange-700">
                      Pia Bernardine T. Capuyan
                    </h1>
                    <h1 className="font-montserrat text-[0.8rem] tablet:text-lg tablet-m:text-xl laptop-m:text-2xl">
                      Project Assistant
                    </h1>
                    <p className="font-montserrat bg-white font-extralight text-[0.7rem] tablet:mt-2 tablet-m:mt-6 tablet:text-[1rem] tablet-m:text-[1.1rem] laptop-m:text-[1.4rem] leading-relaxed">
                      An experienced writer with a background in architecture, combining creativity with technical insight. 
                      She helps drive fresh ideas and solutions within TARAKI.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="laptopCont px-0 hidden tablet-m:flex justify-between items-center">
              <div
                className="shadow-lg bg-white flex flex-col justify-center items-center w-[100%] tablet:w-full tablet:my-4 tablet:h-64 tablet-m:w-[30%] tablet-m:h-[36rem] desktop-s:h-[45rem] h-[26rem] my-5 transition-all duration-300 hover:scale-105 hover:z-10 aos-init"
                data-aos="flip-right"
                data-aos-duration="1000"
              >
                <div
                  className="bg-cover bg-center w-full h-64 tablet:h-72 tablet-m:h-80"
                  style={{ backgroundImage: `url(${maamT})` }}
                ></div>
                <div className="flex flex-col justify-center px-2 py-2 tablet:px-3">
                  <h1 className="font-montserrat laptop-s:text-[1.2rem] laptop-m:text-2xl desktop-m:text-3xl font-semibold text-orange-700">
                    Dr. Thelma D. Palaoag
                  </h1>
                  <h1 className="font-montserrat font-semibold laptop-s:text-xl desktop-m:text-2xl">
                    Project Leader
                  </h1>
                  <p className="font-montserrat bg-white font-extralight laptop-s:mt-2 laptop-s:text-[1rem] laptop-m:text-lg desktop-m:text-xl leading-relaxed tablet-m:pb-[1.65rem] laptop-s:pb-[1.7rem] desktop-m:pb-[3.2rem]">
                    20 years of experience in technology and innovation. Her
                    visionary leadership has been instrumental in shaping
                    TARAKI's strategic direction.
                  </p>
                </div>
              </div>
              <div
                className="shadow-lg bg-white flex flex-col justify-center items-center w-[100%] tablet:w-full tablet:my-4 tablet:h-64 tablet-m:w-[30%] tablet-m:h-[36rem] desktop-s:h-[45rem] h-[26rem] my-5 transition-all duration-300 hover:scale-105 hover:z-10 aos-init"
                data-aos="flip-right"
                data-aos-duration="1000"
              >
                <div
                  className="bg-cover bg-center w-full h-64 tablet:h-72 tablet-m:h-80"
                  style={{ backgroundImage: `url(${ateJez})` }}
                ></div>
                <div className="flex flex-col justify-center px-2 py-2 tablet:px-3">
                  <h1 className="font-montserrat laptop-s:text-[1.2rem] laptop-m:text-2xl desktop-m:text-3xl font-semibold text-orange-700">
                    Jezelle Q. Oliva
                  </h1>
                  <h1 className="font-montserrat font-semibold laptop-s:text-xl desktop-m:text-2xl">
                    Startup Community Enabler
                  </h1>
                  <p className="font-montserrat bg-white font-extralight laptop-s:mt-2 laptop-s:text-[1rem] laptop-m:text-lg desktop-m:text-xl leading-relaxed tablet-m:pb-[1.65rem] laptop-s:pb-[1.7rem] desktop-m:pb-[3.2rem]">
                    Jezelle is an educator, empowering TARAKI startups, and
                    fosters community growth through spearheading innovative
                    initiatives.
                  </p>
                </div>
              </div>
              <div
                className="shadow-lg bg-white flex flex-col justify-center items-center w-[100%] tablet:w-full tablet:my-4 tablet:h-64 tablet-m:w-[30%] tablet-m:h-[36rem] desktop-s:h-[45rem] h-[26rem] my-5 transition-all duration-300 hover:scale-105 hover:z-10 aos-init"
                data-aos="flip-right"
                data-aos-duration="1000"
              >
                <div
                  className="bg-cover bg-center w-full h-64 tablet:h-72 tablet-m:h-80"
                  style={{ backgroundImage: `url(${pia})` }}
                ></div>
                <div className="flex flex-col justify-center px-2 py-2 tablet:px-3">
                  <h1 className="font-montserrat laptop-s:text-[1.2rem] laptop-m:text-2xl desktop-m:text-3xl font-semibold text-orange-700">
                    Pia Bernardine T. Capuyan
                  </h1>
                  <h1 className="font-montserrat font-semibold laptop-s:text-xl desktop-m:text-2xl">
                    Project Assistant
                  </h1>
                  <p className="font-montserrat bg-white font-extralight laptop-s:mt-2 laptop-s:text-[1rem] laptop-m:text-lg desktop-m:text-xl leading-relaxed tablet-m:pb-[1.65rem] laptop-s:pb-[1.7rem] desktop-m:pb-[3.2rem]">
                    An experienced writer with a background in architecture, combining creativity with technical insight. 
                    She helps drive fresh ideas and solutions within TARAKI.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
export default TarakiTeam;