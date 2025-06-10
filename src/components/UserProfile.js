import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../services/api';
import userProfileAPI from '../api/userProfile';
import {
  FaUser, FaBars, FaFacebook, FaLinkedin, FaWhatsapp, FaTelegram, FaMicrosoft, FaBell, FaEnvelope, FaUserCircle, FaRegCalendarAlt
} from 'react-icons/fa';

// Format date to YYYY-MM-DD to avoid timezone issues
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // If it's already in YYYY-MM-DD format, return as is
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  
  try {
    // Create date object and adjust for timezone
    const date = new Date(dateString);
    // Get the date in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Format gender to capitalize each word and replace underscores with spaces
const formatGender = (gender) => {
  if (!gender) return '';
  return gender
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Move these components outside the main function so they are not re-created on every render
function GeneralInfo({ generalInfo, setGeneralInfo, isEditingGeneral, setIsEditingGeneral, handleSaveGeneral, user }) {
  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setGeneralInfo({ ...generalInfo, birthdate: newDate });
  };

  // Handle gender change
  const handleGenderChange = (e) => {
    const newGender = e.target.value.toLowerCase();
    setGeneralInfo({ ...generalInfo, gender: newGender });
  };

  return (
    <div className="bg-white rounded-2xl shadow p-8 border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-600">General Information</h2>
        {!isEditingGeneral && (
          <button onClick={() => setIsEditingGeneral(true)} className="text-orange-500 font-semibold hover:underline">Edit</button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-6 text-base">
        <div>
          <div className="text-gray-600 mb-1">First Name</div>
          <input id="general-firstName" name="general-firstName" type="text" value={generalInfo.firstName} disabled={!isEditingGeneral} onChange={e => setGeneralInfo({ ...generalInfo, firstName: e.target.value })} className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold" />
        </div>
        <div>
          <div className="text-gray-600 mb-1">Last Name</div>
          <input id="general-lastName" name="general-lastName" type="text" value={generalInfo.lastName} disabled={!isEditingGeneral} onChange={e => setGeneralInfo({ ...generalInfo, lastName: e.target.value })} className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold" />
        </div>
        <div>
          <div className="text-gray-600 mb-1">Date of Birth</div>
          <input
            id="general-birthdate"
            name="general-birthdate"
            type="date"
            value={formatDate(generalInfo.birthdate)}
            disabled={!isEditingGeneral}
            onChange={handleDateChange}
            className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
          />
        </div>
        <div>
          <div className="text-gray-600 mb-1">Gender</div>
          {isEditingGeneral ? (
            <select
              id="general-gender"
              name="general-gender"
              value={generalInfo.gender}
              onChange={handleGenderChange}
              className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          ) : (
            <input 
              id="general-gender" 
              name="general-gender" 
              type="text" 
              value={formatGender(generalInfo.gender)} 
              disabled 
              className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold" 
            />
          )}
        </div>
        <div>
          <div className="text-gray-600 mb-1">Phone</div>
          <input id="general-contact_number" name="general-contact_number" type="text" value={generalInfo.contact_number} disabled={!isEditingGeneral} onChange={e => setGeneralInfo({ ...generalInfo, contact_number: e.target.value })} className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold" />
        </div>
        <div>
          <div className="text-gray-600 mb-1">Email</div>
          <input id="general-email" name="general-email" type="text" value={generalInfo.email} disabled={!isEditingGeneral} onChange={e => setGeneralInfo({ ...generalInfo, email: e.target.value })} className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold" />
        </div>
        <div className="col-span-2">
          <div className="text-gray-600 mb-1">Address</div>
          <input id="general-location" name="general-location" type="text" value={generalInfo.location} disabled={!isEditingGeneral} onChange={e => setGeneralInfo({ ...generalInfo, location: e.target.value })} className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold" />
        </div>
      </div>
      {isEditingGeneral && (
        <div className="flex gap-2 mt-4">
          <button onClick={handleSaveGeneral} className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
          <button onClick={() => { setIsEditingGeneral(false); setGeneralInfo({
            firstName: user?.first_name || '',
            lastName: user?.last_name || '',
            birthdate: user?.birthdate || '',
            gender: user?.gender || '',
            contact_number: user?.contact_number || '',
            email: user?.email || '',
            location: user?.location || ''
          }); }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
        </div>
      )}
    </div>
  );
}

function AboutCard({ about, setAbout, isEditingAbout, setIsEditingAbout, handleSaveAbout, user }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-200 h-auto min-h-0 mb-12">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-orange-600">About</h2>
        {!isEditingAbout && (
          <button onClick={() => setIsEditingAbout(true)} className="text-orange-500 font-semibold hover:underline">Edit</button>
        )}
      </div>
      {isEditingAbout ? (
        <textarea value={about} onChange={e => setAbout(e.target.value)} className="w-full bg-gray-100 rounded px-3 py-3 text-gray-700 min-h-0 h-auto break-words whitespace-pre-line" />
      ) : (
        <div className="bg-gray-100 rounded px-3 py-3 text-gray-700 min-h-0 h-auto break-words whitespace-pre-line">{about}</div>
      )}
      {isEditingAbout && (
        <div className="flex gap-2 mt-4">
          <button onClick={handleSaveAbout} className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
          <button onClick={() => { setIsEditingAbout(false); setAbout(user?.introduction || ''); }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
        </div>
      )}
    </div>
  );
}

function ProfessionalBackgroundCard({ employments: initialEmployments, setEmployments, isEditingProfessional, setIsEditingProfessional, handleSaveProfessional, user }) {
  // Use local state for editing
  const [localEmployments, setLocalEmployments] = useState(initialEmployments || []);

  // Update local state when initialEmployments changes and not editing
  useEffect(() => {
    if (!isEditingProfessional) {
      setLocalEmployments(initialEmployments || []);
    }
  }, [initialEmployments, isEditingProfessional]);

  // Add new employment
  const handleAddEmployment = () => {
    setLocalEmployments([
      ...localEmployments,
      {
        company: '',
        title: '',
        industry: '',
        hire_date: '',
        employment_type: '',
        is_current: false
      }
    ]);
  };

  // Remove employment by index
  const handleRemoveEmployment = (idx) => {
    setLocalEmployments(localEmployments.filter((_, i) => i !== idx));
  };

  // Handle employment field change
  const handleEmploymentChange = (idx, field, value) => {
    setLocalEmployments(prev => {
      const newEmps = [...prev];
      newEmps[idx] = { ...newEmps[idx], [field]: value };
      return newEmps;
    });
  };

  // Handle save
  const handleSave = async () => {
    await handleSaveProfessional(localEmployments);
    setIsEditingProfessional(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setLocalEmployments(initialEmployments || []);
    setIsEditingProfessional(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-orange-600">Professional Background</h3>
        {!isEditingProfessional && (
          <button
            onClick={() => setIsEditingProfessional(true)}
            className="text-orange-500 font-semibold hover:underline"
          >
            Edit
          </button>
        )}
      </div>
      {!isEditingProfessional ? (
        <div>
          {localEmployments.length === 0 && <div className="text-gray-500">No professional background added.</div>}
          {localEmployments.map((emp, idx) => (
            <div key={`view-${idx}`} className="border-b last:border-b-0 py-3 flex justify-between items-center">
              <div>
                <div className="font-semibold">{emp.company}</div>
                <div className="text-gray-600">{emp.title}</div>
              </div>
              <div className="text-gray-500">
                {emp.is_current ? "Current" : (emp.hire_date ? new Date(emp.hire_date).getFullYear() : "")}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {localEmployments.map((emp, idx) => (
            <div key={`edit-${idx}`} className="mb-4 border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={emp.company || ''}
                  onChange={e => handleEmploymentChange(idx, 'company', e.target.value)}
                  className="w-1/2 bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Company Name"
                />
                <input
                  type="text"
                  value={emp.title || ''}
                  onChange={e => handleEmploymentChange(idx, 'title', e.target.value)}
                  className="w-1/2 bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Title"
                />
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={emp.industry || ''}
                  onChange={e => handleEmploymentChange(idx, 'industry', e.target.value)}
                  className="w-1/2 bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Industry"
                />
                <input
                  type="date"
                  value={emp.hire_date ? emp.hire_date.slice(0, 10) : ''}
                  onChange={e => handleEmploymentChange(idx, 'hire_date', e.target.value)}
                  className="w-1/2 bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Hire Date"
                />
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={emp.employment_type || ''}
                  onChange={e => handleEmploymentChange(idx, 'employment_type', e.target.value)}
                  className="w-1/2 bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Employment Type"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emp.is_current || false}
                    onChange={e => handleEmploymentChange(idx, 'is_current', e.target.checked)}
                  />
                  Current
                </label>
                <button onClick={() => handleRemoveEmployment(idx)} className="text-red-500 ml-2">Remove</button>
              </div>
            </div>
          ))}
          <button onClick={handleAddEmployment} className="bg-orange-500 text-white px-4 py-2 rounded mt-2">Add Employment</button>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
            <button onClick={handleCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AcademicProfileCard({ academicProfile: initialAcademicProfile, setAcademicProfile, isEditingAcademic, setIsEditingAcademic, handleSaveAcademic, user }) {
  // Use local state for editing
  const [localAcademicProfile, setLocalAcademicProfile] = useState(initialAcademicProfile || []);

  // Update local state when initialAcademicProfile changes and not editing
  useEffect(() => {
    if (!isEditingAcademic) {
      setLocalAcademicProfile(initialAcademicProfile || []);
    }
  }, [initialAcademicProfile, isEditingAcademic]);

  // Handle academic profile field change
  const handleProfileChange = (idx, field, value) => {
    setLocalAcademicProfile(prev => {
      const newProfile = [...prev];
      newProfile[idx] = { ...newProfile[idx], [field]: value };
      return newProfile;
    });
  };

  // Handle add new education
  const handleAddEducation = () => {
    setLocalAcademicProfile([
      ...localAcademicProfile,
      {
        level: '',
        course: '',
        institution: '',
        address: '',
        graduation_date: ''
      }
    ]);
  };

  // Handle remove education
  const handleRemoveEducation = (idx) => {
    setLocalAcademicProfile(localAcademicProfile.filter((_, i) => i !== idx));
  };

  // Handle save
  const handleSave = async () => {
    await handleSaveAcademic(localAcademicProfile);
    setIsEditingAcademic(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setLocalAcademicProfile(initialAcademicProfile || []);
    setIsEditingAcademic(false);
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow p-8 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-600">Education</h2>
        {!isEditingAcademic && (
          <button onClick={() => setIsEditingAcademic(true)} className="text-orange-500 font-semibold hover:underline">Edit</button>
        )}
      </div>
      {isEditingAcademic ? (
        <div className="space-y-6">
          {localAcademicProfile.map((profile, index) => (
            <div key={`edit-${index}`} className="grid grid-cols-2 gap-4 border-b pb-4 last:border-b-0 last:pb-0">
              <div>
                <div className="text-gray-600 mb-1">Level</div>
                <input
                  type="text"
                  value={profile.level || ''}
                  onChange={e => handleProfileChange(index, 'level', e.target.value)}
                  className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Education Level"
                />
              </div>
              <div>
                <div className="text-gray-600 mb-1">Course</div>
                <input
                  type="text"
                  value={profile.course || ''}
                  onChange={e => handleProfileChange(index, 'course', e.target.value)}
                  className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Course Name"
                />
              </div>
              <div className="col-span-2">
                <div className="text-gray-600 mb-1">Institution</div>
                <input
                  type="text"
                  value={profile.institution || ''}
                  onChange={e => handleProfileChange(index, 'institution', e.target.value)}
                  className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Institution Name"
                />
              </div>
              <div className="col-span-2">
                <div className="text-gray-600 mb-1">Address</div>
                <input
                  type="text"
                  value={profile.address || ''}
                  onChange={e => handleProfileChange(index, 'address', e.target.value)}
                  className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Institution Address"
                />
              </div>
              <div>
                <div className="text-gray-600 mb-1">Graduation Date</div>
                <input
                  type="date"
                  value={profile.graduation_date || ''}
                  onChange={e => handleProfileChange(index, 'graduation_date', e.target.value)}
                  className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 font-semibold"
                />
              </div>
              <div className="flex items-end">
                <button onClick={() => handleRemoveEducation(index)} className="text-red-500">Remove</button>
              </div>
            </div>
          ))}
          <button onClick={handleAddEducation} className="bg-orange-500 text-white px-4 py-2 rounded">Add Education</button>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
            <button onClick={handleCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {localAcademicProfile.length === 0 && <div className="text-gray-500">No education history added.</div>}
          {localAcademicProfile.map((profile, index) => (
            <div key={`view-${index}`} className="border-b last:border-b-0 py-3">
              <div className="font-semibold">{profile.level}</div>
              <div className="text-gray-600">{profile.course}</div>
              <div className="text-gray-500">{profile.institution}</div>
              <div className="text-gray-500">{profile.address}</div>
              <div className="text-gray-500">{profile.graduation_date ? new Date(profile.graduation_date).toLocaleDateString() : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrivacySettingsCard({ user, setUser, fetchProfile }) {
  const [permissions, setPermissions] = useState({
    show_in_search: user?.show_in_search || false,
    show_in_messages: user?.show_in_messages || false,
    show_in_pages: user?.show_in_pages || false
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Handle permission changes
  const handlePermissionChange = async (field) => {
    const newPermissions = {
      ...permissions,
      [field]: !permissions[field]
    };
    
    try {
      await userProfileAPI.updateUserProfile(user.id, {
        ...user,
        [field]: newPermissions[field]
      });
      setPermissions(newPermissions);
      fetchProfile(user.id);
    } catch (err) {
      alert('Failed to update permissions.');
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8 || passwordData.new_password.length > 20) {
      setPasswordError('Password must be between 8 and 20 characters');
      return;
    }

    if (!/[a-z]/.test(passwordData.new_password)) {
      setPasswordError('Password must contain at least one lowercase character');
      return;
    }

    if (!/[A-Z]/.test(passwordData.new_password)) {
      setPasswordError('Password must contain at least one uppercase character');
      return;
    }

    try {
      const result = await userProfileAPI.updatePassword(user.id, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      if (result) {
        setPasswordSuccess('Password updated successfully');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      {/* Left column: Permissions + Connected Accounts stacked */}
      <div className="flex flex-col gap-6 flex-1 mb-6">
        {/* Permissions Card */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 flex flex-col">
          <h2 className="text-xl font-bold text-orange-600 mb-6">Permissions</h2>
          <div className="flex flex-col gap-6 text-lg">
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={permissions.show_in_search} 
                onChange={() => handlePermissionChange('show_in_search')}
                className="accent-orange-500 w-5 h-5" 
              />
              <span className="font-medium text-black">Show in search results</span>
            </label>
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={permissions.show_in_messages} 
                onChange={() => handlePermissionChange('show_in_messages')}
                className="accent-orange-500 w-5 h-5" 
              />
              <span className="font-medium text-black">Allow messages from other users</span>
            </label>
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={permissions.show_in_pages} 
                onChange={() => handlePermissionChange('show_in_pages')}
                className="accent-orange-500 w-5 h-5" 
              />
              <span className="font-medium text-black">Show profile in public pages</span>
            </label>
          </div>
        </div>
        {/* Connected Accounts Card */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 flex flex-col">
          <h2 className="text-xl font-bold text-orange-600 mb-6">Connected Accounts</h2>
          <div className="mb-2 font-semibold text-lg">Social Sign-in</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-white border rounded shadow px-3 py-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5" />
              <span className="font-medium">Google</span>
              <span className="text-xl font-bold ml-auto">+</span>
            </div>
            <div className="flex items-center gap-2 bg-white border rounded shadow px-3 py-2">
              <FaFacebook className="text-blue-700 w-5 h-5" />
              <span className="font-medium">Facebook</span>
              <span className="text-xl font-bold ml-auto">+</span>
            </div>
            <div className="flex items-center gap-2 bg-white border rounded shadow px-3 py-2">
              <FaMicrosoft className="text-blue-700 w-5 h-5" />
              <span className="font-medium">Microsoft</span>
              <span className="text-xl font-bold ml-auto">+</span>
            </div>
            <div className="flex items-center gap-2 bg-white border rounded shadow px-3 py-2">
              <FaTelegram className="text-blue-400 w-5 h-5" />
              <span className="font-medium">Telegram</span>
              <span className="text-xl font-bold ml-auto">+</span>
            </div>
            <div className="flex items-center gap-2 bg-white border rounded shadow px-3 py-2">
              <FaLinkedin className="text-blue-800 w-5 h-5" />
              <span className="font-medium">LinkedIn</span>
              <span className="text-xl font-bold ml-auto">+</span>
            </div>
            <div className="flex items-center gap-2 bg-white border rounded shadow px-3 py-2">
              <FaWhatsapp className="text-green-500 w-5 h-5" />
              <span className="font-medium">Whatsapp</span>
              <span className="text-xl font-bold ml-auto">+</span>
            </div>
          </div>
        </div>
      </div>
      {/* Right column: Password Information */}
      <div className="flex-1 bg-white rounded-2xl shadow p-8 border border-gray-200 mb-6 flex flex-col">
        <h2 className="text-xl font-bold text-orange-600 mb-6">Password Information</h2>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          <label className="font-semibold">Current Password*
            <input 
              type="password" 
              value={passwordData.current_password}
              onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
              placeholder="Enter your current password" 
              className="w-full bg-gray-100 rounded px-3 py-2 mt-1" 
              required
            />
          </label>
          <label className="font-semibold">New Password*
            <input 
              type="password" 
              value={passwordData.new_password}
              onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
              placeholder="Enter your new password" 
              className="w-full bg-gray-100 rounded px-3 py-2 mt-1" 
              required
            />
          </label>
          <label className="font-semibold">Confirm New Password*
            <input 
              type="password" 
              value={passwordData.confirm_password}
              onChange={e => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              placeholder="Confirm new password" 
              className="w-full bg-gray-100 rounded px-3 py-2 mt-1" 
              required
            />
          </label>
          {passwordError && (
            <div className="text-red-500 text-sm">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="text-green-500 text-sm">{passwordSuccess}</div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            <div className="font-semibold text-gray-700">*Password Requirements:</div>
            <ul className="list-disc ml-5">
              <li>At least 8 characters and up to 20 characters</li>
              <li>At least one lowercase character</li>
              <li>At least one uppercase character</li>
            </ul>
          </div>
          <button 
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold transition self-end mt-4"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('personal');
  // Determine if viewing own profile
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const isOwnProfile = loggedInUser && user && String(loggedInUser.id) === String(user.id);

  // Edit states and form data for each section
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [isEditingSocial, setIsEditingSocial] = useState(false);

  const [generalInfo, setGeneralInfo] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    birthdate: user?.birthdate || '',
    gender: user?.gender || '',
    contact_number: user?.contact_number || '',
    email: user?.email || '',
    location: user?.location || ''
  });
  const [about, setAbout] = useState(user?.introduction || '');
  const [employments, setEmployments] = useState(
    Array.isArray(user?.employment) ? user.employment : user?.employment ? [user.employment] : []
  );
  const [academicProfile, setAcademicProfile] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    microsoft_url: '',
    whatsapp_url: '',
    telegram_url: ''
  });

  // Fetch profile and social links only when id changes
  useEffect(() => {
    if (id) {
      fetchProfile(id);
      fetchSocialLinks(id);
    } else {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const userObj = JSON.parse(stored);
          setUser(userObj);
          fetchProfile(userObj.id);
          fetchSocialLinks(userObj.id);
        } catch (e) {
          setUser(null);
        }
      }
    }
  }, [id]);

  // Sync generalInfo with user only when user or isEditingGeneral changes
  useEffect(() => {
    if (!isEditingGeneral) {
      setGeneralInfo({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        birthdate: formatDate(user?.birthdate) || '',
        gender: user?.gender || '',
        contact_number: user?.contact_number || '',
        email: user?.email || '',
        location: user?.location || ''
      });
    }
  }, [user, isEditingGeneral]);

  // Sync employments with user only when user or isEditingProfessional changes
  useEffect(() => {
    if (!isEditingProfessional) {
      setEmployments(Array.isArray(user?.employment) ? user.employment : user?.employment ? [user.employment] : []);
    }
  }, [user, isEditingProfessional]);

  // Sync about, academicProfile, and socialLinks as needed
  useEffect(() => {
    if (!isEditingAbout) {
      setAbout(user?.introduction || '');
    }
    if (!isEditingAcademic) {
      setAcademicProfile(user?.academic_profile || []);
    }
    if (!isEditingSocial) {
      setSocialLinks(user?.social_links || {});
    }
  }, [user, isEditingAbout, isEditingAcademic, isEditingSocial]);

  const fetchProfile = async (userId) => {
    try {
      const profile = await api.getUserProfile(userId);
      setUser(profile);
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      if (loggedInUser && String(loggedInUser.id) === String(userId)) {
        localStorage.setItem('user', JSON.stringify(profile));
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
      setSocialLinks({});
    }
  };

  // Save handlers
  const handleSaveGeneral = async () => {
    // Format the birthdate to ensure it's in YYYY-MM-DD format without timezone conversion
    const birthdate = formatDate(generalInfo.birthdate);
    
    console.log('handleSaveGeneral called', {
      first_name: generalInfo.firstName,
      last_name: generalInfo.lastName,
      email: generalInfo.email,
      profile_image: user.profile_image,
      birthdate,
      gender: generalInfo.gender,
      contact_number: generalInfo.contact_number,
      location: generalInfo.location,
      introduction: about,
      industry: employments[0]?.industry || '',
      show_in_search: user.show_in_search,
      show_in_messages: user.show_in_messages,
      show_in_pages: user.show_in_pages
    });
    
    try {
      await userProfileAPI.updateUserProfile(user.id, {
        first_name: generalInfo.firstName,
        last_name: generalInfo.lastName,
        email: generalInfo.email,
        profile_image: user.profile_image,
        birthdate,
        gender: generalInfo.gender,
        contact_number: generalInfo.contact_number,
        location: generalInfo.location,
        introduction: about,
        industry: employments[0]?.industry || '',
        show_in_search: user.show_in_search,
        show_in_messages: user.show_in_messages,
        show_in_pages: user.show_in_pages,
        employment: employments
      });
      setIsEditingGeneral(false);
      fetchProfile(user.id);
    } catch (err) {
      alert('Failed to update general information.');
    }
  };

  const handleSaveAbout = async () => {
    console.log('handleSaveAbout called', {
      first_name: generalInfo.firstName,
      last_name: generalInfo.lastName,
      email: generalInfo.email,
      profile_image: user.profile_image,
      birthdate: generalInfo.birthdate,
      gender: generalInfo.gender,
      contact_number: generalInfo.contact_number,
      location: generalInfo.location,
      introduction: about,
      industry: employments[0]?.industry || '',
      show_in_search: user.show_in_search,
      show_in_messages: user.show_in_messages,
      show_in_pages: user.show_in_pages
    });
    try {
      await userProfileAPI.updateUserProfile(user.id, {
        first_name: generalInfo.firstName,
        last_name: generalInfo.lastName,
        email: generalInfo.email,
        profile_image: user.profile_image,
        birthdate: generalInfo.birthdate,
        gender: generalInfo.gender,
        contact_number: generalInfo.contact_number,
        location: generalInfo.location,
        introduction: about,
        industry: employments[0]?.industry || '',
        show_in_search: user.show_in_search,
        show_in_messages: user.show_in_messages,
        show_in_pages: user.show_in_pages,
        employment: employments
      });
      setIsEditingAbout(false);
      fetchProfile(user.id);
    } catch (err) {
      alert('Failed to update about section.');
    }
  };

  const handleSaveProfessional = async (updatedEmployments) => {
    console.log('handleSaveProfessional called', {
      first_name: generalInfo.firstName,
      last_name: generalInfo.lastName,
      email: generalInfo.email,
      profile_image: user.profile_image,
      birthdate: generalInfo.birthdate,
      gender: generalInfo.gender,
      contact_number: generalInfo.contact_number,
      location: generalInfo.location,
      introduction: about,
      industry: updatedEmployments[0]?.industry || '',
      show_in_search: user.show_in_search,
      show_in_messages: user.show_in_messages,
      show_in_pages: user.show_in_pages,
      employment: updatedEmployments
    });
    try {
      await userProfileAPI.updateUserProfile(user.id, {
        first_name: generalInfo.firstName,
        last_name: generalInfo.lastName,
        email: generalInfo.email,
        profile_image: user.profile_image,
        birthdate: generalInfo.birthdate,
        gender: generalInfo.gender,
        contact_number: generalInfo.contact_number,
        location: generalInfo.location,
        introduction: about,
        industry: updatedEmployments[0]?.industry || '',
        show_in_search: user.show_in_search,
        show_in_messages: user.show_in_messages,
        show_in_pages: user.show_in_pages,
        employment: updatedEmployments
      });
      setEmployments(updatedEmployments);
      fetchProfile(user.id);
    } catch (err) {
      alert('Failed to update professional background.');
    }
  };

  const handleSaveAcademic = async (updatedAcademicProfile) => {
    console.log('handleSaveAcademic called', {
      first_name: generalInfo.firstName,
      last_name: generalInfo.lastName,
      email: generalInfo.email,
      profile_image: user.profile_image,
      birthdate: generalInfo.birthdate,
      gender: generalInfo.gender,
      contact_number: generalInfo.contact_number,
      location: generalInfo.location,
      introduction: about,
      industry: employments[0]?.industry || '',
      show_in_search: user.show_in_search,
      show_in_messages: user.show_in_messages,
      show_in_pages: user.show_in_pages,
      academic_profile: updatedAcademicProfile
    });
    try {
      await userProfileAPI.updateUserProfile(user.id, {
        first_name: generalInfo.firstName,
        last_name: generalInfo.lastName,
        email: generalInfo.email,
        profile_image: user.profile_image,
        birthdate: generalInfo.birthdate,
        gender: generalInfo.gender,
        contact_number: generalInfo.contact_number,
        location: generalInfo.location,
        introduction: about,
        industry: employments[0]?.industry || '',
        show_in_search: user.show_in_search,
        show_in_messages: user.show_in_messages,
        show_in_pages: user.show_in_pages,
        academic_profile: updatedAcademicProfile
      });
      setAcademicProfile(updatedAcademicProfile);
      setIsEditingAcademic(false);
      fetchProfile(user.id);
    } catch (err) {
      alert('Failed to update academic profile.');
    }
  };

  const handleSaveSocial = async () => {
    console.log('handleSaveSocial called', {
      first_name: generalInfo.firstName,
      last_name: generalInfo.lastName,
      email: generalInfo.email,
      profile_image: user.profile_image,
      birthdate: generalInfo.birthdate,
      gender: generalInfo.gender,
      contact_number: generalInfo.contact_number,
      location: generalInfo.location,
      introduction: about,
      industry: employments[0]?.industry || '',
      show_in_search: user.show_in_search,
      show_in_messages: user.show_in_messages,
      show_in_pages: user.show_in_pages,
      social_links: socialLinks
    });
    try {
      await userProfileAPI.updateUserProfile(user.id, {
        first_name: generalInfo.firstName,
        last_name: generalInfo.lastName,
        email: generalInfo.email,
        profile_image: user.profile_image,
        birthdate: generalInfo.birthdate,
        gender: generalInfo.gender,
        contact_number: generalInfo.contact_number,
        location: generalInfo.location,
        introduction: about,
        industry: employments[0]?.industry || '',
        show_in_search: user.show_in_search,
        show_in_messages: user.show_in_messages,
        show_in_pages: user.show_in_pages,
        social_links: socialLinks
      });
      setIsEditingSocial(false);
      fetchProfile(user.id);
    } catch (err) {
      alert('Failed to update social links.');
    }
  };

  if (!user) {
    return <div className="flex flex-col min-h-screen"><Navbar /><div className="flex-1 flex justify-center items-center text-gray-200 bg-[#181818]">Please log in to view your profile.</div></div>;
  }

  // Sidebar
  const Sidebar = () => (
    <div className="bg-white rounded-2xl shadow w-[270px] h-[calc(100vh-110px)] flex flex-col items-center py-6 px-6 pb-8 mr-8 border border-gray-200 overflow-y-auto min-h-0">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-3 relative group">
          {user.profile_image && user.profile_image.trim() !== '' ? (
            <img src={user.profile_image} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-orange-500 bg-gray-100 mb-2" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-orange-500 flex items-center justify-center mb-2">
              <FaUser className="text-white" size={60} />
            </div>
          )}
          {/* Profile picture upload button */}
          <label className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow cursor-pointer opacity-80 hover:opacity-100 transition-opacity group-hover:opacity-100">
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  // Validate file type
                  if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return;
                  }

                  // Validate file size (5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    alert('Image size must be less than 5MB');
                    return;
                  }

                  try {
                    const reader = new window.FileReader();
                    reader.onloadend = async () => {
                      try {
                        const base64Image = reader.result;
                        await userProfileAPI.updateProfileImage(user.id, base64Image);
                        await fetchProfile(user.id);
                        // Show success message
                        alert('Profile image updated successfully');
                      } catch (error) {
                        console.error('Error updating profile image:', error);
                        alert(error.message || 'Failed to update profile image. Please try again.');
                      }
                    };
                    reader.onerror = () => {
                      alert('Error reading the image file. Please try again.');
                    };
                    reader.readAsDataURL(file);
                  } catch (error) {
                    console.error('Error processing image:', error);
                    alert('Error processing the image. Please try again.');
                  }
                }
              }}
            />
            <span className="text-xs text-orange-500 font-semibold">Edit</span>
          </label>
        </div>
        <div className="text-center">
          <div className="font-bold text-xl text-gray-800">{user.first_name} {user.last_name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      </div>
      <nav className="flex-1 w-full">
        <ul className="space-y-6 text-left">
          <li className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'personal' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-400'}`} onClick={() => setActiveSection('personal')}><FaBars /> Personal Details</li>
          <li className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'academic' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-400'}`} onClick={() => setActiveSection('academic')}><FaBars /> Academic Profile</li>
          {isOwnProfile && (
            <li className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'privacy' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-400'}`} onClick={() => setActiveSection('privacy')}><FaBars /> Privacy Settings</li>
          )}
        </ul>
      </nav>
      <div className="mt-auto w-full pt-8">
        <button className="flex items-center gap-3 text-left text-orange-500 font-semibold hover:underline w-full"><FaBars /> Logout</button>
      </div>
    </div>
  );

  // Header
  const Header = () => (
    <div className="flex items-center justify-between w-full px-8 py-4 bg-white rounded-2xl shadow mb-8">
      <div className="flex items-center gap-4 w-1/2">
        <input type="text" placeholder="Search" className="w-full px-4 py-2 rounded border border-gray-300 bg-gray-50 focus:outline-none" />
      </div>
      <div className="flex items-center gap-6">
        <FaBell className="text-orange-500 text-xl cursor-pointer" />
        <FaEnvelope className="text-orange-500 text-xl cursor-pointer" />
        {user.profile_image && user.profile_image.trim() !== '' ? (
          <img src={user.profile_image} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-orange-500 bg-gray-100" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
            <FaUser className="text-white text-xl" />
          </div>
        )}
      </div>
    </div>
  );

  // Right Panel
  const RightPanel = () => (
    <div className="flex flex-col gap-6 min-h-[700px] max-w-[420px] w-full">
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-200 flex items-center gap-4 mb-2">
        {user.profile_image && user.profile_image.trim() !== '' ? (
          <img src={user.profile_image} alt="Profile" className="w-16 h-16 rounded-full object-cover border-4 border-orange-500 bg-gray-100" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
            <FaUser className="text-white text-3xl" />
          </div>
        )}
        <div>
          <div className="font-bold text-lg text-gray-800">{user.first_name} {user.last_name}</div>
          <div className="text-sm text-gray-500">System Developer</div>
        </div>
      </div>
      <ProfessionalBackgroundCard 
        employments={employments} 
        setEmployments={setEmployments} 
        isEditingProfessional={isEditingProfessional} 
        setIsEditingProfessional={setIsEditingProfessional} 
        handleSaveProfessional={handleSaveProfessional} 
        user={user} 
      />
    </div>
  );

  // Academic Profile Section
  const AcademicProfile = () => (
    <div className="flex flex-row gap-8">
      <AcademicProfileCard
        academicProfile={academicProfile}
        setAcademicProfile={setAcademicProfile}
        isEditingAcademic={isEditingAcademic}
        setIsEditingAcademic={setIsEditingAcademic}
        handleSaveAcademic={handleSaveAcademic}
        user={user}
      />
    </div>
  );

  // Privacy Settings Section (only for profile owner)
  const PrivacySettings = () => (
    <PrivacySettingsCard user={user} setUser={setUser} fetchProfile={fetchProfile} />
  );

  // Main Layout
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <Navbar />
      <div className="flex flex-row w-full gap-8 px-8 pt-24 pb-8">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {activeSection === 'personal' && <>
            <GeneralInfo generalInfo={generalInfo} setGeneralInfo={setGeneralInfo} isEditingGeneral={isEditingGeneral} setIsEditingGeneral={setIsEditingGeneral} handleSaveGeneral={handleSaveGeneral} user={user} />
            <AboutCard about={about} setAbout={setAbout} isEditingAbout={isEditingAbout} setIsEditingAbout={setIsEditingAbout} handleSaveAbout={handleSaveAbout} user={user} />
          </>}
          {activeSection === 'academic' && <AcademicProfile />}
          {activeSection === 'privacy' && isOwnProfile && <PrivacySettings />}
        </div>
        {activeSection === 'personal' && <RightPanel />}
      </div>
    </div>
  );
}

