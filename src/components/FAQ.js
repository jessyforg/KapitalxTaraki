import React, { useState } from "react";

function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const tarakiFaqItems = [
    {
      question: "How can I get involved with TARAKI?",
      answer: "Stay connected with us through our vibrant community on Facebook and Instagram. Explore tailored events and initiatives designed just for you."
    },
    {
      question: "Who can join TARAKI's programs and initiatives?",
      answer: "Everyone with a spark of innovation is invited! Whether you're a startup founder, an enthusiast, or simply curious about the startup ecosystem, TARAKI welcomes you with open arms."
    },
    {
      question: "Does TARAKI offer resources for startups?",
      answer: "Absolutely! Dive into a wealth of resources tailored for startups: from personalized mentorship sessions to enlightening seminars, workshops, and engaging talks by industry experts at our innovation-driven events."
    },
    {
      question: "How can TARAKI support my startup?",
      answer: "Let TARAKI fuel your startup journey with our acceleration program and a plethora of events specially curated for Cordilleran startups. Stay informed by following our dynamic updates on our Facebook Page."
    }
  ];

  const platformFaqItems = [
    {
      question: "What is Taraki?",
      answer: "Taraki is a platform that connects entrepreneurs, investors, and professionals in the startup ecosystem. It provides tools for networking, investment matching, and business development."
    },
    {
      question: "How do I update my profile information?",
      answer: "You can update your profile information by going to the Settings page and clicking on the Profile tab. From there, you can modify your personal information, profile picture, and other details. Remember to click 'Save Changes' after making your updates."
    },
    {
      question: "How do I change my password?",
      answer: "To change your password, navigate to Settings > Security. Enter your current password, then your new password twice for confirmation. Make sure your new password meets our security requirements (minimum 8 characters, including numbers and special characters)."
    },
    {
      question: "How do I manage my notification preferences?",
      answer: "Go to Settings > Notifications to manage your notification preferences. You can toggle different types of notifications such as messages, application status updates, investment matches, and system alerts. Changes are saved automatically."
    },
    {
      question: "How do I report an issue or bug?",
      answer: "You can report issues by clicking the 'Contact Support' button in the Help & Support section. Please provide as much detail as possible about the issue, including steps to reproduce it and any error messages you're seeing."
    },
    {
      question: "How do I delete my account?",
      answer: "To delete your account, go to Settings > Security and scroll to the bottom. Click on 'Delete Account' and follow the confirmation steps. Please note that this action is permanent and cannot be undone."
    },
    {
      question: "How do I manage my privacy settings?",
      answer: "Privacy settings can be managed in Settings > Security. Here you can control who can see your profile, contact you, and view your activity. You can also manage your data sharing preferences."
    },
    {
      question: "How do I connect with other users?",
      answer: "You can connect with other users by visiting their profiles and clicking the 'Connect' button. You can also find potential connections through the platform's search feature or through recommended connections based on your interests and activities."
    },
    {
      question: "How do I update my investment preferences?",
      answer: "Investment preferences can be updated in your profile settings. You can specify your investment range, preferred industries, and other criteria that will help match you with relevant opportunities."
    },
    {
      question: "How do I submit a support ticket?",
      answer: "To submit a support ticket, go to Settings > Help & Support and click on 'Submit Ticket'. Fill in the required information including title, description, and type of issue. Our support team will review and respond to your ticket as soon as possible."
    },
    {
      question: "How do I manage my startup profile?",
      answer: "You can manage your startup profile by going to your dashboard and selecting the 'Startups' tab. From there, you can update your startup information, add team members, and manage your funding rounds."
    },
    {
      question: "How do I find potential investors?",
      answer: "You can find potential investors through the platform's search feature or by browsing the Investors section. The platform will also suggest matches based on your startup's industry, stage, and funding needs."
    },
    {
      question: "How do I track my application status?",
      answer: "You can track your application status in the Notifications section or by visiting the specific application page. You'll receive updates when there are changes to your application status."
    },
    {
      question: "How do I customize my dashboard?",
      answer: "You can customize your dashboard by clicking on the settings icon in the dashboard view. From there, you can choose which widgets to display and arrange them according to your preferences."
    },
    {
      question: "How do I export my data?",
      answer: "You can export your data by going to Settings > Data Management. From there, you can choose which data to export and in what format (PDF or Excel). This is useful for keeping records or transferring information."
    }
  ];

  const renderFaqSection = (items, title) => (
    <div className="mb-16">
      <h3 className="text-2xl font-bold mb-8 text-orange-600">{title}</h3>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-[#232526] shadow-sm hover:shadow-md transition-all duration-300 mb-6"
          >
            <button
              className="w-full text-left px-8 py-5 text-gray-800 dark:text-white text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={() => toggleFAQ(idx)}
            >
              {item.question}
              <span
                className={`ml-4 transition-transform duration-300 ${
                  openIndex === idx ? "rotate-180" : ""
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  className="text-gray-500 dark:text-gray-400"
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
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === idx
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-8 pb-6 text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div id="FAQs" className="py-20 px-4 tablet:px-16 bg-white dark:bg-[#18191a]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-16 text-orange-600 text-center">
          Frequently Asked Questions
        </h2>
        {renderFaqSection(tarakiFaqItems, "About TARAKI")}
        {renderFaqSection(platformFaqItems, "Platform Features & Support")}
      </div>
    </div>
  );
}

export default FAQs;