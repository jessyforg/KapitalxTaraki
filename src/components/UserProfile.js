import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../services/api';
import {
  FaEnvelope, FaMapMarkerAlt, FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaArrowLeft, FaUserCircle, FaUser, FaCheckCircle, FaBriefcase, FaTrophy, FaGraduationCap, FaInfoCircle, FaIdBadge, FaShareAlt, FaBell, FaEnvelopeOpenText, FaCamera, FaEdit, FaKey
} from 'react-icons/fa';

const badgeColors = {
  user: 'bg-orange-600',
  admin: 'bg-blue-600',
  entrepreneur: 'bg-orange-600',
};

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

function capitalizeFirst(str) {
  if (!str || typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatBirthdate(dateString) {
  if (!dateString) return <span className="italic text-gray-400">Not specified</span>;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return <span className="italic text-gray-400">Not specified</span>;
  // Format: Month day, year
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [socialLinks, setSocialLinks] = useState({});
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [profileImageError, setProfileImageError] = useState('');
  const fileInputRef = React.useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const userObj = JSON.parse(stored);
        setUser(userObj);
        fetchProfile(userObj.id);
        // Make social links fetch optional
        fetchSocialLinks(userObj.id).catch(err => {
          console.warn('Failed to fetch social links:', err);
          setSocialLinks({});
        });
      } catch (e) {
        console.warn('Error accessing localStorage:', e);
        setUser(null);
      }
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const profile = await api.getUserProfile(userId);
      setUser(profile);
      // Update localStorage with new profile data
      try {
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (e) {
        console.warn('Error updating localStorage:', e);
      }
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const fetchSocialLinks = async (userId) => {
    try {
      const links = await api.getUserSocialLinks(userId);
      setSocialLinks(links);
    } catch (err) {
      console.warn('Failed to fetch social links:', err);
      setSocialLinks({});
    }
  };

  if (!user) {
    return <div className="flex flex-col min-h-screen"><Navbar /><div className="flex-1 flex justify-center items-center text-gray-200 bg-[#181818]">Please log in to view your profile.</div></div>;
  }

  // Profile picture logic: use DB value, else show icon
  const ProfilePicture = () => {
    if (user.profile_image && user.profile_image.trim() !== "") {
      return (
        <img
          src={user.profile_image}
          alt="Profile"
          className="w-36 h-36 rounded-full border-4 border-orange-500 object-cover bg-gray-800 shadow-lg"
        />
      );
    } else {
      return (
        <div className="w-36 h-36 rounded-full border-4 border-orange-500 bg-gray-800 flex items-center justify-center shadow-lg">
          <FaUserCircle className="text-orange-400" size={120} />
        </div>
      );
    }
  };

  // Handle profile image upload
  const handleProfileImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImageLoading(true);
    setProfileImageError('');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          await api.updateProfileImage(user.id, base64Image);
          fetchProfile(user.id);
        } catch (err) {
          setProfileImageError('Failed to update profile image');
        } finally {
          setProfileImageLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setProfileImageError('Failed to update profile image');
      setProfileImageLoading(false);
    }
  };

  // Helper to show value or placeholder, with optional transform
  const showValue = (val, emptyText = 'Not specified', transform) => {
    if (!val || val.trim() === '') return <span className="italic text-gray-400">{emptyText}</span>;
    return transform ? transform(val) : val;
  };

  // Role badge
  const roleLabel = user.role === 'admin' ? 'Admin' : (user.role === 'entrepreneur' ? 'Entrepreneur' : 'User');
  const roleColor = badgeColors[user.role] || 'bg-orange-600';

  // Verified badge
  const isVerified = user.is_verified === 1 || user.is_verified === true;

  // Edit Profile Modal (real form)
  const EditProfileModal = () => {
    const [formData, setFormData] = useState({
      location: user.location || '',
      introduction: user.introduction || '',
      accomplishments: user.accomplishments || '',
      education: user.education || '',
      employment: user.employment || '',
      gender: user.gender || '',
      birthdate: user.birthdate ? user.birthdate.slice(0, 10) : '',
      contact_number: user.contact_number || '',
      public_email: user.public_email || '',
      industry: user.industry || '',
      show_in_search: user.show_in_search !== undefined ? user.show_in_search : true,
      show_in_messages: user.show_in_messages !== undefined ? user.show_in_messages : true,
      show_in_pages: user.show_in_pages !== undefined ? user.show_in_pages : true,
      facebook_url: user.facebook_url || '',
      instagram_url: user.instagram_url || '',
      linkedin_url: user.linkedin_url || ''
    });
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const steps = [
      { label: 'Personal Details' },
      { label: 'Contact Information' },
      { label: 'Professional Information' },
      { label: 'About' },
      { label: 'Social Links' },
      { label: 'Privacy Settings' },
    ];

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
        setShowEditModal(false);
        fetchProfile(user.id);
      } catch (err) {
        setError(err.message || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    };

    const handleSkip = () => {
      setShowEditModal(false);
    };

    // Step content rendering (copy renderStep from UserDetailsModal, using formData and handleChange)
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
                <div className="md:col-span-2">
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
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Social Links</h3>
              <div className="flex flex-col gap-y-6 flex-1 justify-evenly">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    name="instagram_url"
                    value={formData.instagram_url}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
              <div />
            </div>
          );
        case 5:
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
            <h2 className="text-lg font-bold mb-6 text-black dark:text-white">Edit Profile</h2>
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

  // Change Password Modal (simple example)
  const ChangePasswordModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#232323] rounded-2xl shadow-lg p-8 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-orange-500 text-2xl" onClick={() => setShowPasswordModal(false)}>&times;</button>
        <h2 className="text-2xl font-bold text-white mb-4">Change Password</h2>
        {/* You can add a form here for changing password */}
        <div className="text-gray-300">Password change form goes here.</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#181818]">
      <Navbar />
      {/* Back button above card */}
      <div className="w-full max-w-5xl mx-auto mt-8 mb-2 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold shadow transition"
        >
          <FaArrowLeft /> Back
        </button>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-4 px-2">
        {/* Profile Card */}
        <div className="w-full max-w-5xl bg-gradient-to-br from-[#232323] to-[#181818] rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row gap-8 items-center mb-8 border border-orange-900/30 relative">
          <div className="flex flex-col items-center md:items-start gap-4 md:w-1/3">
            <ProfilePicture />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleProfileImageChange}
            />
            <button
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold shadow transition mt-2"
              onClick={handleProfileImageClick}
              disabled={profileImageLoading}
            >
              {profileImageLoading ? 'Uploading...' : (<><FaCamera /> Change Picture</>)}
            </button>
            {profileImageError && <div className="text-red-500 text-xs mt-1">{profileImageError}</div>}
          </div>
          <div className="flex-1 flex flex-col items-center md:items-start gap-4">
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-4xl font-extrabold text-white mb-2 text-center md:text-left">{showValue(user.full_name, 'No name', capitalizeFirst)}</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white ${roleColor}`}>{roleLabel}</span>
                {isVerified && <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white"><FaCheckCircle /> Verified</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-2 text-orange-200 text-base">
              <span className="flex items-center gap-2"><FaEnvelope /> {showValue(user.email)}</span>
              <span className="flex items-center gap-2"><FaMapMarkerAlt /> {showValue(user.location, 'Not specified', capitalizeFirst)}</span>
              <span className="flex items-center gap-2"><FaPhone /> {showValue(user.contact_number)}</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold shadow transition" onClick={() => setShowEditModal(true)}><FaEdit /> Edit Profile</button>
              <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold shadow transition" onClick={() => setShowPasswordModal(true)}><FaKey /> Change Password</button>
            </div>
          </div>
        </div>
        {/* Info Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Location */}
          <div className="bg-[#232323] rounded-2xl p-5 shadow flex flex-col gap-2 border border-orange-900/20">
            <span className="flex items-center gap-2 text-orange-400 font-semibold text-lg"><FaMapMarkerAlt /> Location</span>
            <span className="text-gray-300">{showValue(user.location, 'Not specified', capitalizeFirst)}</span>
          </div>
          {/* Industry */}
          <div className="bg-[#232323] rounded-2xl p-5 shadow flex flex-col gap-2 border border-orange-900/20">
            <span className="flex items-center gap-2 text-orange-400 font-semibold text-lg"><FaBriefcase /> Industry</span>
            <span className="text-gray-300">{showValue(user.industry, 'Not specified', capitalizeFirst)}</span>
          </div>
          {/* About Me */}
          <div className="bg-[#232323] rounded-2xl p-5 shadow flex flex-col gap-2 border border-orange-900/20">
            <span className="flex items-center gap-2 text-orange-400 font-semibold text-lg"><FaInfoCircle /> About Me</span>
            <span className="text-gray-300">{showValue(user.introduction, 'No introduction provided.')}</span>
          </div>
          {/* Accomplishments */}
          <div className="bg-[#232323] rounded-2xl p-5 shadow flex flex-col gap-2 border border-orange-900/20">
            <span className="flex items-center gap-2 text-orange-400 font-semibold text-lg"><FaTrophy /> Accomplishments</span>
            <span className="text-gray-300">{showValue(user.accomplishments, 'No accomplishments listed.')}</span>
          </div>
          {/* Education */}
          <div className="bg-[#232323] rounded-2xl p-5 shadow flex flex-col gap-2 border border-orange-900/20">
            <span className="flex items-center gap-2 text-orange-400 font-semibold text-lg"><FaGraduationCap /> Education</span>
            <span className="text-gray-300">{showValue(user.education, 'No education information provided.')}</span>
          </div>
          {/* Employment */}
          <div className="bg-[#232323] rounded-2xl p-5 shadow flex flex-col gap-2 border border-orange-900/20">
            <span className="flex items-center gap-2 text-orange-400 font-semibold text-lg"><FaBriefcase /> Employment</span>
            <span className="text-gray-300">{showValue(user.employment, 'No employment history provided.')}</span>
          </div>
          {/* Personal Information */}
          <div className="bg-[#232323] rounded-2xl p-5 shadow flex flex-col gap-2 border border-orange-900/20">
            <span className="flex items-center gap-2 text-orange-400 font-semibold text-lg"><FaUser /> Personal Information</span>
            <span className="text-gray-300"><span className="font-semibold">Gender:</span> {showValue(user.gender, 'Not specified', capitalizeFirst)}</span>
            <span className="text-gray-300"><span className="font-semibold">Birthdate:</span> {formatBirthdate(user.birthdate)}</span>
          </div>
          {/* Contact Information */}
          <div className="bg-[#232323] rounded-2xl p-5 shadow flex flex-col gap-2 border border-orange-900/20">
            <span className="flex items-center gap-2 text-orange-400 font-semibold text-lg"><FaIdBadge /> Contact Information</span>
            <span className="text-gray-300"><span className="font-semibold">Email:</span> {showValue(user.public_email)}</span>
            <span className="text-gray-300"><span className="font-semibold">Phone:</span> {showValue(user.contact_number)}</span>
          </div>
          {/* Social Media */}
          <div className="bg-[#232323] rounded-2xl p-5 shadow flex flex-col gap-2 border border-orange-900/20">
            <span className="flex items-center gap-2 text-orange-400 font-semibold text-lg"><FaShareAlt /> Social Media</span>
            <div className="flex gap-4 text-2xl mt-1">
              {socialLinks.facebook_url && (
                <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition"><FaFacebook /></a>
              )}
              {socialLinks.twitter_url && (
                <a href={socialLinks.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 transition"><FaTwitter /></a>
              )}
              {socialLinks.instagram_url && (
                <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-700 transition"><FaInstagram /></a>
              )}
              {socialLinks.linkedin_url && (
                <a href={socialLinks.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition"><FaLinkedin /></a>
              )}
              {!socialLinks.facebook_url && !socialLinks.twitter_url && !socialLinks.instagram_url && !socialLinks.linkedin_url && (
                <span className="text-gray-400">No social media links provided.</span>
              )}
            </div>
          </div>
        </div>
        {showEditModal && <EditProfileModal />}
        {showPasswordModal && <ChangePasswordModal />}
      </div>
    </div>
  );
}
