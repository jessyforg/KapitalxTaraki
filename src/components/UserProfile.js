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
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const userObj = JSON.parse(stored);
      setUser(userObj);
      fetchProfile(userObj.id);
      fetchSocialLinks(userObj.id);
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const profile = await api.getUserProfile(userId);
      setUser(profile);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const fetchSocialLinks = async (userId) => {
    try {
      const links = await api.getUserSocialLinks(userId);
      setSocialLinks(links);
    } catch (err) {
      setSocialLinks({});
    }
  };

  if (!user) {
    return <div className="flex flex-col min-h-screen"><Navbar /><div className="flex-1 flex justify-center items-center text-gray-200 bg-[#181818]">Please log in to view your profile.</div></div>;
  }

  // Profile picture logic: use DB value, else show icon
  const ProfilePicture = () => {
    if (user.profile_picture_url && user.profile_picture_url.trim() !== "") {
      return (
        <img
          src={user.profile_picture_url}
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
    const [form, setForm] = useState({
      full_name: user.full_name || '',
      location: user.location || '',
      industry: user.industry || '',
      introduction: user.introduction || '',
      accomplishments: user.accomplishments || '',
      education: user.education || '',
      employment: user.employment || '',
      gender: user.gender || '',
      birthdate: user.birthdate ? user.birthdate.slice(0, 10) : '',
      contact_number: user.contact_number || '',
      public_email: user.public_email || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        await api.updateUserProfile(user.id, form);
        setSuccess('Profile updated!');
        setShowEditModal(false);
        fetchProfile(user.id);
      } catch (err) {
        setError(err.message || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-[#232323] rounded-2xl shadow-lg p-8 w-full max-w-3xl relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-orange-500 text-2xl" onClick={() => setShowEditModal(false)}>&times;</button>
          <h2 className="text-2xl font-bold text-white mb-4">Edit Profile</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Full Name</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full p-2 rounded bg-[#181818] text-white border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Location</label>
                <select name="location" value={form.location} onChange={handleChange} className="w-full p-2 rounded bg-[#181818] text-white border border-gray-700">
                  {CAR_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc ? loc : 'Select location'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Industry</label>
                <select name="industry" value={form.industry} onChange={handleChange} className="w-full p-2 rounded bg-[#181818] text-white border border-gray-700">
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind ? ind : 'Select industry'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full p-2 rounded bg-[#181818] text-white border border-gray-700">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Birthdate</label>
                <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} className="w-full p-2 rounded bg-[#181818] text-white border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Contact Number</label>
                <input name="contact_number" value={form.contact_number} onChange={handleChange} className="w-full p-2 rounded bg-[#181818] text-white border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Public Email</label>
                <input name="public_email" value={form.public_email} onChange={handleChange} className="w-full p-2 rounded bg-[#181818] text-white border border-gray-700" />
              </div>
            </div>
            <div className="space-y-4 flex flex-col h-full justify-between">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Introduction</label>
                <textarea name="introduction" value={form.introduction} onChange={handleChange} className="w-full p-2 rounded bg-[#181818] text-white border border-gray-700" rows={2} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Accomplishments</label>
                <textarea name="accomplishments" value={form.accomplishments} onChange={handleChange} className="w-full p-2 rounded bg-[#181818] text-white border border-gray-700" rows={2} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Education</label>
                <textarea name="education" value={form.education} onChange={handleChange} className="w-full p-2 rounded bg-[#181818] text-white border border-gray-700" rows={2} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Employment</label>
                <textarea name="employment" value={form.employment} onChange={handleChange} className="w-full p-2 rounded bg-[#181818] text-white border border-gray-700" rows={2} />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-500 text-sm">{success}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-orange-600 text-white font-semibold" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
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
            <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold shadow transition mt-2"><FaCamera /> Change Picture</button>
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
