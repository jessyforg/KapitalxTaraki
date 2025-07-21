import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./styles.css";
import axios from "axios";
import defaultAvatar from './imgs/default-avatar.png';

function TarakiTeam() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);

  const getApiUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    return `http://${window.location.hostname}:5000/api`;
  };

  const getBaseUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return `http://${window.location.hostname}:5000`;
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get(`${getApiUrl()}/team`);
        setTeamMembers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members');
        setLoading(false);
      }
    };

    fetchTeamMembers();

    AOS.init({
      easing: "ease",
      once: false,
    });

    setTimeout(() => setTestimonialsVisible(true), 200); // slight delay for effect
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <section id="team">
      <div className="font-satoshi overflow-x-hidden">
        <div className="cont tablet:px-8 phone:py-2">
          <section className="mt-16 tablet:mt-12 text-center">
            <h1
              className="font-montserrat font-semibold text-md tablet:text-lg tablet-m:text-4xl laptop-s:text-5xl laptop-m:text-[2.2rem] desktop-m:text-[2.6rem] aos-init"
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
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={`${getBaseUrl()}${member.image_url}`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', e.target.src);
                      e.target.onerror = null;
                      e.target.src = defaultAvatar;
                    }}
                  />
                </div>
                <div className="p-6">
                  <h1 className="font-montserrat text-[1.8rem] font-semibold text-orange-600">
                    {member.name}
                  </h1>
                  <h2 className="font-montserrat text-[1.4rem] text-gray-900 mt-1">
                    {member.position}
                  </h2>
                  <p className="font-montserrat text-[1.1rem] text-gray-700 mt-4 leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Testimonial Section */}
        <section className="mt-20 mb-10">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-8">
            {/* Testimonial 1 */}
            <div className={`bg-white dark:bg-[#232526] rounded-xl shadow-lg p-8 flex flex-col items-center border border-gray-200 dark:border-gray-700 testimonial-fade ${testimonialsVisible ? 'testimonial-fade-in' : ''}`}>
              <p className="font-montserrat text-gray-700 dark:text-gray-200 text-lg mb-6 text-center">“TARAKI has been instrumental in helping our startup grow. The support and mentorship are unmatched!”</p>
              <div className="flex items-center gap-4">
                <img src={defaultAvatar} alt="Testimonial 1" className="w-14 h-14 rounded-full border-2 border-orange-500" />
                <div>
                  <div className="font-montserrat font-bold text-gray-900 dark:text-white">Alex Rivera</div>
                  <div className="font-montserrat text-sm text-gray-500 dark:text-gray-400">Startup Founder</div>
                </div>
              </div>
            </div>
            {/* Testimonial 2 */}
            <div className={`bg-white dark:bg-[#232526] rounded-xl shadow-lg p-8 flex flex-col items-center border border-gray-200 dark:border-gray-700 testimonial-fade ${testimonialsVisible ? 'testimonial-fade-in testimonial-fade-delay-1' : ''}`}>
              <p className="font-montserrat text-gray-700 dark:text-gray-200 text-lg mb-6 text-center">“The community at TARAKI is so welcoming and collaborative. I’ve learned so much from the team and other entrepreneurs.”</p>
              <div className="flex items-center gap-4">
                <img src={defaultAvatar} alt="Testimonial 2" className="w-14 h-14 rounded-full border-2 border-orange-500" />
                <div>
                  <div className="font-montserrat font-bold text-gray-900 dark:text-white">Jamie Cruz</div>
                  <div className="font-montserrat text-sm text-gray-500 dark:text-gray-400">Entrepreneur</div>
                </div>
              </div>
            </div>
            {/* Testimonial 3 */}
            <div className={`bg-white dark:bg-[#232526] rounded-xl shadow-lg p-8 flex flex-col items-center border border-gray-200 dark:border-gray-700 testimonial-fade ${testimonialsVisible ? 'testimonial-fade-in testimonial-fade-delay-2' : ''}`}>
              <p className="font-montserrat text-gray-700 dark:text-gray-200 text-lg mb-6 text-center">“I highly recommend TARAKI for anyone looking to innovate and connect with like-minded individuals.”</p>
              <div className="flex items-center gap-4">
                <img src={defaultAvatar} alt="Testimonial 3" className="w-14 h-14 rounded-full border-2 border-orange-500" />
                <div>
                  <div className="font-montserrat font-bold text-gray-900 dark:text-white">Pat Santos</div>
                  <div className="font-montserrat text-sm text-gray-500 dark:text-gray-400">Investor</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default TarakiTeam;