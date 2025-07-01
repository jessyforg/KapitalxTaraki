import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CAR_LOCATIONS = [
  '',
  'Abra',
  'Apayao',
  'Benguet',
  'Ifugao',
  'Kalinga',
  'Mountain Province',
  'Baguio City',
];

const INDUSTRIES = [
  '',
  'Agriculture',
  'Education',
  'Healthcare',
  'Tourism',
  'Information Technology',
  'Manufacturing',
  'Retail',
  'Construction',
  'Finance',
  'Government',
  'Transportation',
  'Arts & Culture',
  'Other',
];

const POSITIONS = [
  'Developer',
  'Designer',
  'Product Manager',
  'Marketing',
  'Sales',
  'Business Development',
  'Operations',
  'Finance',
  'Legal',
  'Other'
];

const STARTUP_STAGES = [
  'Idea',
  'MVP',
  'Scaling',
  'Established'
];

const SKILLS = [
  'JavaScript',
  'Python',
  'Java',
  'React',
  'Node.js',
  'UI/UX Design',
  'Product Management',
  'Marketing',
  'Sales',
  'Business Development',
  'Operations',
  'Finance',
  'Legal',
  'Other'
];

const steps = [
  { label: 'Basic Information' },
  { label: 'Professional Background' },
  { label: 'Bio & Social Links' },
  { label: 'Matchmaking Preferences' },
  { label: 'Privacy Settings' },
];

// Tag-based MultiSelect component
function TagMultiSelect({ id, name, options, selected, onChange, placeholder }) {
  const [input, setInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const filtered = options.filter(
    (opt) =>
      opt.toLowerCase().includes(input.toLowerCase()) && !selected.includes(opt)
  );

  const handleAdd = (opt) => {
    onChange([...selected, opt]);
    setInput('');
    setShowDropdown(false);
  };
  const handleRemove = (opt) => {
    onChange(selected.filter((s) => s !== opt));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((tag) => (
          <span key={tag} className="flex items-center bg-[#FF7A1A] text-white rounded-full px-3 py-1 text-sm font-medium shadow">
            {tag}
            <button type="button" className="ml-2 text-white hover:text-[#FFB26B] focus:outline-none" onClick={() => handleRemove(tag)}>
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        id={id}
        name={name}
        type="text"
        className="w-full p-2 rounded-full border border-slate-200 bg-[#e7e7e7] text-black focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
        placeholder={placeholder}
        value={input}
        onChange={e => { setInput(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />
      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-auto">
          {filtered.map((opt) => (
            <li
              key={opt}
              className="px-4 py-2 cursor-pointer hover:bg-[#FFB26B] hover:text-[#FF7A1A] transition-all rounded-xl"
              onMouseDown={() => handleAdd(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const UserDetailsModal = ({ user, onClose, onComplete }) => {
  const [formData, setFormData] = useState({
    gender: '',
    birthdate: '',
    location: '',
    contact_number: '',
    public_email: '',
    industry: '',
    education: '',
    employment: '',
    accomplishments: '',
    introduction: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    skills: [],
    position_desired: '',
    preferred_industries: [],
    preferred_startup_stage: '',
    preferred_location: '',
    show_in_search: true,
    show_in_messages: true,
    show_in_pages: true,
  });

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Force light mode on this modal
  useEffect(() => {
    const modalElement = document.getElementById('user-details-modal');
    if (modalElement) {
      modalElement.classList.add('light');
    }
  }, []);

  // Fetch user data on mount
  useEffect(() => {
    if (user && user.id) {
      api.getUserProfile(user.id).then(data => {
        setFormData(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(data).map(([k, v]) => [
              k,
              v === null || v === undefined
                ? (Array.isArray(prev[k]) ? [] : typeof prev[k] === 'boolean' ? false : '')
                : v
            ])
          )
        }));
      }).catch(() => {});
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = (e) => {
    e && e.preventDefault();
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = (e) => {
    e && e.preventDefault();
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.updateUserProfile(user.id, formData);
      onComplete();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Step content rendering
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col flex-1 justify-between h-full">
            <h3 className="text-lg font-semibold text-[#F04F06] mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-stretch content-stretch">
              <div>
                <label htmlFor="user-gender" className="block text-sm font-medium text-black mb-1">Gender</label>
                <select
                  id="user-gender"
                  name="gender"
                  value={formData.gender ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  autoComplete="sex"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label htmlFor="user-birthdate" className="block text-sm font-medium text-black mb-1">Birthdate</label>
                <input
                  type="date"
                  id="user-birthdate"
                  name="birthdate"
                  value={formData.birthdate ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  autoComplete="bday"
                />
              </div>
              <div>
                <label htmlFor="user-location" className="block text-sm font-medium text-black mb-1">Location</label>
                <select
                  id="user-location"
                  name="location"
                  value={formData.location ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  autoComplete="address-level1"
                >
                  {CAR_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc ? loc : 'Select location'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="user-contact_number" className="block text-sm font-medium text-black mb-1">Contact Number</label>
                <input
                  type="tel"
                  id="user-contact_number"
                  name="contact_number"
                  value={formData.contact_number ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  placeholder="Your contact number"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="user-public_email" className="block text-sm font-medium text-black mb-1">Public Email</label>
                <input
                  type="email"
                  id="user-public_email"
                  name="public_email"
                  value={formData.public_email ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  placeholder="Public email address"
                  autoComplete="email"
                />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col flex-1 justify-between h-full">
            <h3 className="text-lg font-semibold text-[#F04F06] mb-4">Professional Background</h3>
            <div className="flex flex-col gap-y-6 flex-1 justify-evenly">
              <div>
                <label htmlFor="user-industry" className="block text-sm font-medium text-black mb-1">Industry</label>
                <select
                  id="user-industry"
                  name="industry"
                  value={formData.industry ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  autoComplete="off"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind ? ind : 'Select industry'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="user-education" className="block text-sm font-medium text-black mb-1">Education</label>
                <textarea
                  id="user-education"
                  name="education"
                  value={formData.education ?? ''}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded font-medium focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  placeholder="Your educational background"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="user-employment" className="block text-sm font-medium text-black mb-1">Employment</label>
                <textarea
                  id="user-employment"
                  name="employment"
                  value={formData.employment ?? ''}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded font-medium focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  placeholder="Your work experience"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="user-accomplishments" className="block text-sm font-medium text-black mb-1">Accomplishments</label>
                <textarea
                  id="user-accomplishments"
                  name="accomplishments"
                  value={formData.accomplishments ?? ''}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded font-medium focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  placeholder="Your notable achievements"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col flex-1 justify-between h-full">
            <h3 className="text-lg font-semibold text-[#F04F06] mb-4">Bio & Social Links</h3>
            <div className="flex flex-col gap-y-6 flex-1 justify-evenly">
              <div>
                <label htmlFor="user-introduction" className="block text-sm font-medium text-black mb-1">Introduction</label>
                <textarea
                  id="user-introduction"
                  name="introduction"
                  value={formData.introduction ?? ''}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded font-medium focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  placeholder="Tell us about yourself"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="user-facebook_url" className="block text-sm font-medium text-black mb-1">Facebook URL</label>
                <input
                  type="url"
                  id="user-facebook_url"
                  name="facebook_url"
                  value={formData.facebook_url ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-black font-medium"
                  placeholder="https://facebook.com/yourprofile"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="user-instagram_url" className="block text-sm font-medium text-black mb-1">Instagram URL</label>
                <input
                  type="url"
                  id="user-instagram_url"
                  name="instagram_url"
                  value={formData.instagram_url ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-black font-medium"
                  placeholder="https://instagram.com/yourprofile"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="user-linkedin_url" className="block text-sm font-medium text-black mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  id="user-linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-black font-medium"
                  placeholder="https://linkedin.com/in/yourprofile"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col flex-1 justify-between h-full">
            <h3 className="text-lg font-semibold text-[#F04F06] mb-4">Matchmaking Preferences</h3>
            <div className="flex flex-col gap-y-6 flex-1 justify-evenly">
              <div>
                <label htmlFor="user-skills" className="block text-sm font-medium text-black mb-1">Skills & Experience</label>
                <TagMultiSelect
                  id="user-skills"
                  name="skills"
                  options={SKILLS}
                  selected={formData.skills ?? []}
                  onChange={val => handleMultiSelect('skills', val)}
                  placeholder="Type or select skills..."
                />
              </div>
              <div>
                <label htmlFor="user-position_desired" className="block text-sm font-medium text-black mb-1">Position Desired</label>
                <select
                  id="user-position_desired"
                  name="position_desired"
                  value={formData.position_desired ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  autoComplete="off"
                >
                  <option value="">Select position</option>
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="user-preferred_industries" className="block text-sm font-medium text-black mb-1">Preferred Industries</label>
                <TagMultiSelect
                  id="user-preferred_industries"
                  name="preferred_industries"
                  options={INDUSTRIES.filter(ind => ind)}
                  selected={formData.preferred_industries ?? []}
                  onChange={val => handleMultiSelect('preferred_industries', val)}
                  placeholder="Type or select industries..."
                />
              </div>
              <div>
                <label htmlFor="user-preferred_startup_stage" className="block text-sm font-medium text-black mb-1">Preferred Startup Stage</label>
                <select
                  id="user-preferred_startup_stage"
                  name="preferred_startup_stage"
                  value={formData.preferred_startup_stage ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  autoComplete="off"
                >
                  <option value="">Select stage</option>
                  {STARTUP_STAGES.map((stage) => (
                    <option key={stage} value={stage.toLowerCase()}>{stage}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="user-preferred_location" className="block text-sm font-medium text-black mb-1">Preferred Location</label>
                <select
                  id="user-preferred_location"
                  name="preferred_location"
                  value={formData.preferred_location ?? ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                  autoComplete="off"
                >
                  <option value="">Select location</option>
                  {CAR_LOCATIONS.filter(loc => loc).map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col flex-1 justify-between h-full">
            <h3 className="text-lg font-semibold text-[#F04F06] mb-4">Privacy Settings</h3>
            <div className="flex flex-col gap-y-6 flex-1 justify-evenly">
              <label htmlFor="user-show_in_search" className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="user-show_in_search"
                  name="show_in_search"
                  checked={formData.show_in_search ?? false}
                  onChange={handleChange}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-black font-medium">Show in search results</span>
              </label>
              <label htmlFor="user-show_in_messages" className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="user-show_in_messages"
                  name="show_in_messages"
                  checked={formData.show_in_messages ?? false}
                  onChange={handleChange}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-black font-medium">Allow messages from other users</span>
              </label>
              <label htmlFor="user-show_in_pages" className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="user-show_in_pages"
                  name="show_in_pages"
                  checked={formData.show_in_pages ?? false}
                  onChange={handleChange}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-black font-medium">Show profile in public pages</span>
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="user-details-modal" className="fixed inset-0 z-50 bg-slate-50 bg-opacity-95 p-0 md:p-4 flex items-start md:items-center justify-center">
      <div className="bg-white rounded-none md:rounded-3xl shadow-xl w-full h-full md:w-full md:max-w-2xl md:h-[620px] animate-fadeIn flex flex-col md:flex-row border-0 md:border-2 border-slate-200 overflow-hidden">
        {/* Stepper Sidebar */}
        <div className="w-full md:w-56 bg-slate-100 md:rounded-l-3xl py-4 px-4 flex flex-col items-center md:items-start h-auto md:h-full shadow-lg border-b md:border-r md:border-b-0 border-slate-200">
          <h2 className="text-lg font-extrabold mb-4 text-[#F04F06] tracking-wide px-2 hidden md:block">Let us know you better</h2>
          <ul className="w-full flex flex-row items-center justify-center md:flex-col md:items-start md:space-y-5">
            {steps.map((s, idx) => (
              <li key={s.label} className="flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-3 px-1 md:px-2 text-center md:text-left">
                <span className={`flex items-center justify-center w-8 h-8 md:w-6 md:h-6 rounded-full border-2 text-sm font-bold transition-all duration-200 
                  ${step === idx ? 'bg-[#FF7A1A] border-[#FF7A1A] text-white shadow-lg' : step > idx ? 'bg-[#FFB26B] border-[#FFB26B] text-[#FF7A1A]' : 'bg-slate-200 border-slate-200 text-slate-400'}`}>{idx + 1}</span>
                <span className={`text-xs md:text-sm transition-all duration-200 ${step === idx ? 'font-bold text-[#FF7A1A]' : step > idx ? 'text-[#FF7A1A]' : 'text-slate-400'}`}>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Main Content */}
        <form onSubmit={step === steps.length - 1 ? handleSubmit : handleNext} className="flex-1 flex flex-col p-4 md:p-8 h-full bg-white md:rounded-r-3xl shadow-inner overflow-hidden">
          {error && (
            <div className="text-[#FF7A1A] text-sm text-center mb-3 font-semibold">{error}</div>
          )}
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 md:pr-4 md:-mr-4 custom-scrollbar">
            <div className="bg-slate-50 rounded-2xl shadow p-6 mb-6 border border-slate-200">
              {renderStep()}
            </div>
          </div>
          <div className="sticky bottom-0 left-0 right-0 bg-white pt-5 border-t border-slate-200 z-10 flex justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF7A1A] text-sm
                ${step === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white text-[#FF7A1A] border border-[#FF7A1A] hover:bg-[#FFB26B] hover:text-[#FF7A1A]'}`}
              disabled={step === 0}
            >
              Previous
            </button>
            <div className="flex gap-2">
              {step === steps.length - 1 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-5 py-2 rounded-full text-[#FF7A1A] bg-white border border-[#FF7A1A] hover:bg-[#FFB26B] hover:text-[#FF7A1A] font-semibold transition-all duration-200 shadow-md text-sm"
                >
                  Skip for now
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#FF7A1A] text-white rounded-full font-bold shadow-lg hover:bg-[#FFB26B] hover:text-[#FF7A1A] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A1A] disabled:opacity-50 text-sm"
              >
                {step === steps.length - 1 ? (loading ? 'Saving...' : 'Save Profile') : 'Next'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetailsModal; 