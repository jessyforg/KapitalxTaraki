import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

function FAQs() {
  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-in-out", once: false });
  }, []);

  const [activeIndex, setActiveIndex] = useState(null);
  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "How can I get involved with TARAKI?",
      answer:
        "Stay connected with us through our vibrant community on Facebook and Instagram. Explore tailored events and initiatives designed just for you.",
    },
    {
      question: "Who can join TARAKI's programs and initiatives?",
      answer:
        "Everyone with a spark of innovation is invited! Whether you're a startup founder, an enthusiast, or simply curious about the startup ecosystem, TARAKI welcomes you with open arms.",
    },
    {
      question: "Does TARAKI offer resources for startups?",
      answer:
        "Absolutely! Dive into a wealth of resources tailored for startups: from personalized mentorship sessions to enlightening seminars, workshops, and engaging talks by industry experts at our innovation-driven events.",
    },
    {
      question: "How can TARAKI support my startup?",
      answer:
        "Let TARAKI fuel your startup journey with our acceleration program and a plethora of events specially curated for Cordilleran startups. Stay informed by following our dynamic updates on our Facebook Page.",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center py-16 bg-white dark:bg-[#181818] min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-orange-600">
        Frequently Asked Questions
      </h2>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {faqItems.map((item, idx) => (
          <div
            key={idx}
            data-aos="fade-up"
            data-aos-delay={idx * 100}
            className="border-2 border-orange-600 rounded-lg px-4 bg-white dark:bg-[#181818] shadow-md transition-all duration-200"
          >
            <button
              className="w-full text-left py-5 focus:outline-none flex items-center justify-between text-trkblack dark:text-white text-lg font-semibold transition-colors duration-300"
              onClick={() => toggleFAQ(idx)}
            >
              {item.question}
              <span
                className={`ml-4 transition-transform duration-300 ${
                  activeIndex === idx ? "rotate-180" : ""
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  className="text-trkblack dark:text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.355a.75.75 0 111.02 1.1l-4.25 3.85a.75.75 0 01-1.02 0l-4.25-3.85a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                activeIndex === idx
                  ? "max-h-40 opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-2"
              }`}
            >
              <div className="px-2 pb-5 text-trkblack dark:text-white text-base font-normal transition-colors duration-300">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQs;