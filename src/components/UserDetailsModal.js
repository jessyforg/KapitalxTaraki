import React, { useState } from 'react';
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

const steps = [
  { label: 'Personal Details' },
  { label: 'Contact Information' },
  { label: 'Professional Information' },
  { label: 'About' },
  { label: 'Privacy Settings' },
];

const UserDetailsModal = ({ user, onClose, onComplete }) => {
  const [formData, setFormData] = useState({
    location: '',
    introduction: '',
    accomplishments: '',
    education: '',
    employment: '',
    gender: '',
    birthdate: '',
    contact_number: '',
    public_email: '',
    industry: '',
    show_in_search: true,
    show_in_messages: true,
    show_in_pages: true
  });
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-stretch content-stretch">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Birthdate</label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
            </div>
            <div />
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col flex-1 justify-between h-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-stretch content-stretch">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                >
                  {CAR_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc ? loc : 'Select location'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="Your contact number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Public Email</label>
                <input
                  type="email"
                  name="public_email"
                  value={formData.public_email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="Public email address"
                />
              </div>
            </div>
            <div />
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col flex-1 justify-between h-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Professional Information</h3>
            <div className="flex flex-col gap-y-6 flex-1 justify-evenly">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind ? ind : 'Select industry'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Education</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="Your educational background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employment</label>
                <textarea
                  name="employment"
                  value={formData.employment}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="Your work experience"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accomplishments</label>
                <textarea
                  name="accomplishments"
                  value={formData.accomplishments}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="Your notable achievements"
                />
              </div>
            </div>
            <div />
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col flex-1 justify-between h-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">About</h3>
            <div className="flex flex-col gap-y-6 flex-1 justify-evenly">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Introduction</label>
                <textarea
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>
            <div />
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col flex-1 justify-between h-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Privacy Settings</h3>
            <div className="flex flex-col gap-y-6 flex-1 justify-evenly">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="show_in_search"
                  checked={formData.show_in_search}
                  onChange={handleChange}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show in search results</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="show_in_messages"
                  checked={formData.show_in_messages}
                  onChange={handleChange}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Allow messages from other users</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="show_in_pages"
                  checked={formData.show_in_pages}
                  onChange={handleChange}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show profile in public pages</span>
              </label>
            </div>
            <div />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <div className="bg-white dark:bg-[#232323] rounded-2xl shadow-lg w-full max-w-4xl min-h-[500px] h-[600px] animate-fadeIn flex">
        {/* Stepper Sidebar */}
        <div className="w-1/4 min-w-[200px] bg-gray-50 dark:bg-gray-900 rounded-l-2xl py-8 px-4 flex flex-col items-start h-full">
          <h2 className="text-lg font-bold mb-6 text-black dark:text-white">Let us know you better</h2>
          <ul className="space-y-4 w-full">
            {steps.map((s, idx) => (
              <li key={s.label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full border-2 ${step === idx ? 'bg-orange-500 border-orange-500' : step > idx ? 'bg-green-500 border-green-500' : 'bg-gray-300 border-gray-300'}`}></span>
                <span className={`text-sm ${step === idx ? 'font-bold text-orange-600' : 'text-gray-700 dark:text-gray-300'}`}>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Main Content */}
        <form onSubmit={step === steps.length - 1 ? handleSubmit : handleNext} className="flex-1 flex flex-col p-12 h-full">
          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}
          <div className="flex-1 flex flex-col justify-between">{renderStep()}</div>
          <div className="flex justify-between pt-8">
            <button
              type="button"
              onClick={handlePrev}
              className={`px-6 py-2 rounded-lg transition-colors ${step === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              disabled={step === 0}
            >
              Previous
            </button>
            <div className="flex gap-2">
              {step === steps.length - 1 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Skip for now
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
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