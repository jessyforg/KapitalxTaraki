import React, { useState } from "react";
import defaultAvatar from './imgs/default-avatar.png';
import iloisaImg from './imgs/testimonial/iloisa.webp';
import evaImg from './imgs/testimonial/eva.webp';

const testimonials = [
  {
    text: "TARAKI didn't just help us refine our presentations; they truly professionalized Session Groceries from the ground up. Their insights into effective communication and strategic storytelling were invaluable. TaRAKi transformed our raw ideas into compelling narratives, making our business resonate powerfully. The impact was immediate and undeniable: we went on to win multiple contests, a testament to the heightened quality and clarity of our presentations. We are incredibly grateful for how TARaki empowered us to present our business at its absolute best.",
    name: "Ms. Iloisa Romaraog-Diga",
    company: "Founder of Session Groceries",
    img: iloisaImg,
  },
  {
    text: "We are very much thankful for having the TARAKI team 'cause they helped us a lot professionally in marketing our products- Dulche Chocolates, and they also helped us with our cacao farm visitation and our feeding program. I want to thank the TARAKI team for helping us also with our IPO registration; they are very helpful and up to now they are still inviting us with the events that can also help us with the Dulche Chocolates, Incorporated.",
    name: "Ms. Eva Ritchelle Padua",
    company: "CEO of Dulce Chocolates Inc.",
    img: evaImg,
  },
];

function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);

  const currentTestimonial = testimonials[current];

  return (
    <section className="w-full bg-gray-50 py-16 flex justify-center items-center relative overflow-x-hidden">
      <div className="max-w-6xl w-full flex flex-col items-center px-4 md:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-montserrat">
            Trust is built with consistency
          </h2>
          {/* Decorative elements */}
          <div className="flex justify-center items-center gap-2">
            <div className="w-16 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-12 h-3 bg-green-600 rounded-full"></div>
          </div>
        </div>

        {/* Main Testimonial Card */}
        <div className="w-full max-w-6xl">
          <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[600px] lg:h-[550px]">
            {/* Left Section - Text Content */}
            <div className="flex-1 p-10 lg:p-16 flex flex-col justify-center h-full">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <div className="w-1 h-5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <blockquote className="text-white text-lg md:text-xl leading-relaxed mb-8 font-montserrat">
                  "{currentTestimonial.text}"
                </blockquote>
                <div className="text-white mt-auto">
                  <div className="font-semibold text-xl font-montserrat">{currentTestimonial.name}</div>
                  <div className="text-gray-300 text-base font-montserrat">{currentTestimonial.company}</div>
                </div>
              </div>
            </div>

            {/* Right Section - Image */}
            <div className="flex-1 bg-white h-full">
              <div className="h-full w-full flex items-center justify-center p-4">
                <img 
                  src={currentTestimonial.img} 
                  alt={currentTestimonial.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              onClick={prev} 
              className="w-12 h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={next} 
              className="w-12 h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials; 