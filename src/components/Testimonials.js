import React, { useState } from "react";
import defaultAvatar from './imgs/default-avatar.png';

const testimonials = [
  {
    text: "TARAKI has been instrumental in helping our startup grow. The support and mentorship are unmatched!",
    name: "Michael",
    company: "MDS Manufacturing",
    img: defaultAvatar,
  },
  {
    text: "The community at TARAKI is so welcoming and collaborative. I’ve learned so much from the team and other entrepreneurs.",
    name: "Diane",
    company: "ABC Rentals",
    img: defaultAvatar,
  },
  {
    text: "I highly recommend TARAKI for anyone looking to innovate and connect with like-minded individuals.",
    name: "Allison",
    company: "Grand Party Rental",
    img: defaultAvatar,
  },
  {
    text: "TARAKI's network helped us find the right partners and investors. The experience has been invaluable!",
    name: "Carlos",
    company: "StartupX",
    img: defaultAvatar,
  },
];

const CARDS_TO_SHOW = 3;

function Testimonials() {
  const [current, setCurrent] = useState(0);

  // Calculate which testimonials to show
  const getVisibleTestimonials = () => {
    if (testimonials.length <= CARDS_TO_SHOW) return testimonials;
    let start = current;
    let end = start + CARDS_TO_SHOW;
    if (end > testimonials.length) {
      // Wrap around
      return [
        ...testimonials.slice(start),
        ...testimonials.slice(0, end - testimonials.length),
      ];
    }
    return testimonials.slice(start, end);
  };

  const prev = () => setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);

  return (
    <section className="w-full bg-[#0a3266] py-16 flex justify-center items-center relative overflow-x-hidden">
      <div className="max-w-7xl w-full flex flex-col md:flex-row gap-8 px-4 md:px-8">
        {/* Left Info Panel - increased width */}
        <div className="flex-[1.5] flex flex-col justify-center items-start text-white max-w-2xl mb-10 md:mb-0 pr-0 md:pr-8">
          <div className="bg-[#3386e2] rounded-full w-28 h-28 md:w-32 md:h-32 flex items-center justify-center mb-6 shadow-lg">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="10" y="45" fontSize="48" fill="white" fontWeight="bold">“</text>
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-montserrat">Connect with other members</h2>
          <p className="mb-6 text-base md:text-lg opacity-90 font-montserrat">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
          </p>
          <button className="bg-white text-[#0a3266] font-semibold px-6 py-2 rounded-full flex items-center gap-2 hover:bg-blue-100 transition font-montserrat shadow">
            Connect now <span className="text-lg">→</span>
          </button>
        </div>
        {/* Right Testimonials Cards/Carousel - decreased card width */}
        <div className="flex-[2] flex flex-col items-center">
          <div className="flex gap-4 w-full justify-center items-stretch">
            {getVisibleTestimonials().map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-lg p-0 flex flex-col items-stretch border border-gray-200 w-64 max-w-full transition-all duration-300 relative"
              >
                <div className="h-32 w-full rounded-t-xl overflow-hidden flex items-center justify-center bg-gray-100">
                  <img src={t.img} alt={t.name} className="object-cover h-full w-full" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center mb-2">
                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="14" fill="#3386e2" />
                      <text x="7" y="22" fontSize="16" fill="white" fontWeight="bold">“</text>
                    </svg>
                  </div>
                  <p className="font-montserrat text-gray-700 text-sm mb-4 flex-1">{t.text}</p>
                  <div className="mt-auto">
                    <div className="font-montserrat font-bold text-[#0a3266] text-base">{t.name}</div>
                    <div className="font-montserrat text-xs text-[#3386e2] italic">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Navigation Arrows and Dots */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button onClick={prev} className="bg-[#3386e2] hover:bg-[#0a3266] text-white rounded p-2 text-xl shadow transition"><span className="sr-only">Previous</span>&#8592;</button>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-3 h-3 rounded-full ${idx === current ? 'bg-[#3386e2]' : 'bg-blue-200'} block`}
                ></span>
              ))}
            </div>
            <button onClick={next} className="bg-[#3386e2] hover:bg-[#0a3266] text-white rounded p-2 text-xl shadow transition"><span className="sr-only">Next</span>&#8594;</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials; 