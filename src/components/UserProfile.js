import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../services/api';
import userProfileAPI from '../api/userProfile';
import { fetchRegions, fetchProvinces, fetchCities, fetchBarangays } from '../services/locationAPI';
import {
  FaUser, FaBars, FaFacebook, FaLinkedin, FaWhatsapp, FaTelegram, FaMicrosoft, FaBell, FaEnvelope, FaUserCircle, FaRegCalendarAlt, FaHandshake, FaLock, FaSignOutAlt, FaGraduationCap, FaTimes, FaEdit, FaTwitter, FaInstagram
} from 'react-icons/fa';
import { validatePhoneNumber, validateDate } from '../utils/validation';
import MobileSidebar from './MobileSidebar';
import HamburgerButton from './HamburgerButton';

// Add SKILLS array and TagMultiSelect component at the top after the imports
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

// Format Philippines addresses
const formatPhilippinesAddress = (locationObj) => {
  if (!locationObj || typeof locationObj !== 'object') {
    return typeof locationObj === 'string' ? locationObj : '';
  }

  const parts = [];
  if (locationObj.barangayName) parts.push(locationObj.barangayName);
  if (locationObj.cityName) parts.push(locationObj.cityName);
  if (locationObj.provinceName) parts.push(locationObj.provinceName);
  if (locationObj.regionName) parts.push(locationObj.regionName);
  return parts.join(', ');
};

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
        className="w-full p-2 rounded-full border border-slate-200 bg-gray-100 dark:bg-[#232526] dark:text-white text-black focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
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

// Add formatDisplayDate function
const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting display date:', error);
    return dateString;
  }
};

// Move these components outside the main function so they are not re-created on every render
const GeneralInfo = React.memo(({ generalInfo, setGeneralInfo, isEditingGeneral, setIsEditingGeneral, handleSaveGeneral, user, isOwnProfile, isEditingProfile, idPrefix }) => {
  const [validationError, setValidationError] = useState('');
  const [localInfo, setLocalInfo] = useState(generalInfo);

  // Update local state when generalInfo changes and not editing
  useEffect(() => {
    if (!isEditingGeneral) {
      setLocalInfo(generalInfo);
    }
  }, [generalInfo, isEditingGeneral]);

  const handleChange = useCallback((field, value) => {
    setLocalInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    setGeneralInfo(localInfo);
    handleSaveGeneral(localInfo); // Pass the local state to save
  }, [localInfo, setGeneralInfo, handleSaveGeneral]);

  const handleCancel = useCallback(() => {
    setLocalInfo(generalInfo);
    setIsEditingGeneral(false);
  }, [generalInfo, setIsEditingGeneral]);

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    handleChange('birthdate', newDate);
    
    // Validate the date
    if (newDate) {
      const validation = validateDate(newDate, 'birthdate');
      if (!validation.isValid) {
        setValidationError(validation.message);
      } else {
        setValidationError('');
      }
    } else {
      setValidationError('');
    }
  };

  // Handle gender change
  const handleGenderChange = (e) => {
    const newGender = e.target.value.toLowerCase();
    handleChange('gender', newGender);
  };

  // Add function to handle phone number input
  const handlePhoneInput = (e) => {
    const { value } = e.target;
    
    // Only allow numbers and plus sign
    const sanitizedValue = value.replace(/[^\d+]/g, '');
    
    // Ensure plus sign is only at the start
    let formattedValue = sanitizedValue;
    if (formattedValue.includes('+') && !formattedValue.startsWith('+')) {
      formattedValue = formattedValue.replace('+', '');
      if (!formattedValue.startsWith('+')) {
        formattedValue = '+' + formattedValue;
      }
    }
    
    // Validate the number
    const validation = validatePhoneNumber(formattedValue, true);
    if (!validation.isValid) {
      setValidationError(validation.message);
    } else {
    setValidationError('');
    }
    
    // Update local info
    handleChange('contact_number', formattedValue);
  };

  return (
    <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-8 border border-gray-200 mb-6">
      {validationError && (
        <div className="text-red-500 mb-4">{validationError}</div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-600">General Information</h2>
        {!isEditingGeneral && isOwnProfile && (
          <button onClick={() => setIsEditingGeneral(true)} className="text-orange-500 font-semibold hover:underline">Edit</button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
        <div>
          <div className="text-gray-600 mb-1">First Name</div>
          <input
            id={`${idPrefix}general-firstName`}
            name="general-firstName"
            type="text"
            value={localInfo.firstName || ''}
            disabled={!isEditingGeneral}
            onChange={e => handleChange('firstName', e.target.value)}
            className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
          />
        </div>
        <div>
          <div className="text-gray-600 mb-1">Last Name</div>
          <input 
            id={`${idPrefix}general-lastName`} 
            name="general-lastName" 
            type="text" 
            value={localInfo.lastName || ''} 
            disabled={!isEditingGeneral} 
            onChange={e => handleChange('lastName', e.target.value)} 
            className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold" 
          />
        </div>
        <div>
          <div className="text-gray-600 mb-1">Date of Birth</div>
          {isEditingGeneral ? (
          <input
            id={`${idPrefix}general-birthdate`}
              name="birthdate"
            type="date"
              value={localInfo.birthdate || ''}
            onChange={handleDateChange}
            className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
          />
          ) : (
            <div className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold">
              {localInfo.birthdate ? formatDisplayDate(localInfo.birthdate) : 'Not set'}
            </div>
          )}
        </div>
        <div>
          <div className="text-gray-600 mb-1">Gender</div>
          {isEditingGeneral ? (
            <select
              id={`${idPrefix}general-gender`}
              name="general-gender"
              value={localInfo.gender || ''}
              onChange={handleGenderChange}
              className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          ) : (
            <input 
              id={`${idPrefix}general-gender`} 
              name="general-gender" 
              type="text" 
              value={formatGender(localInfo.gender)} 
              disabled 
              className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold" 
            />
          )}
        </div>
        <div>
          <div className="text-gray-600 mb-1">Contact Number</div>
          {isEditingGeneral ? (
            <div className="relative">
          <input 
            id={`${idPrefix}general-contact_number`} 
                name="contact_number"
            type="tel"
            value={localInfo.contact_number || ''} 
                onChange={handlePhoneInput}
                placeholder="+63XXXXXXXXXX"
            className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold" 
          />
              <span className="text-xs text-gray-500 mt-1 block">Format: +63XXXXXXXXXX</span>
              {validationError && validationError.includes('phone') && (
                <span className="text-xs text-red-500 mt-1 block">{validationError}</span>
              )}
            </div>
          ) : (
            <div className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold">
              {localInfo.contact_number || 'Not set'}
            </div>
          )}
        </div>
        <div>
          <div className="text-gray-600 mb-1">Email</div>
          <input 
            id={`${idPrefix}general-email`} 
            name="general-email" 
            type="text" 
            value={localInfo.email || ''} 
            disabled={!isEditingGeneral} 
            onChange={e => handleChange('email', e.target.value)} 
            className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold" 
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <div className="text-gray-600 mb-1">Address</div>
          {isEditingGeneral ? (
            <PhilippinesLocationSelector
              value={localInfo.location}
              onChange={value => handleChange('location', value)}
              disabled={false}
            />
          ) : (
            <input 
              id={`${idPrefix}general-location`} 
              name="general-location" 
              type="text" 
              value={formatPhilippinesAddress(localInfo.location)} 
              disabled 
              className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold" 
            />
          )}
        </div>
      </div>
      {isEditingGeneral && (
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
          <button onClick={handleCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
        </div>
      )}
    </div>
  );
});

const AboutCard = React.memo(({ about, setAbout, isEditingAbout, setIsEditingAbout, handleSaveAbout, user, isOwnProfile, idPrefix }) => {
  const textRef = useRef(about);

  useEffect(() => {
    if (!isEditingAbout) {
      textRef.current = about;
    }
  }, [about, isEditingAbout]);

  const handleChange = useCallback((value) => {
    textRef.current = value;
    // Only update parent state on save
  }, []);

  const handleSave = useCallback(() => {
    setAbout(textRef.current);
    handleSaveAbout();
  }, [setAbout, handleSaveAbout]);

  const handleCancel = useCallback(() => {
    textRef.current = about;
    setIsEditingAbout(false);
  }, [about, setIsEditingAbout]);

  return (
    <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-6 border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-orange-600">About</h2>
        {!isEditingAbout && isOwnProfile && (
          <button onClick={() => setIsEditingAbout(true)} className="text-orange-500 font-semibold hover:underline">Edit</button>
        )}
      </div>
      {isEditingAbout ? (
        <textarea 
          defaultValue={textRef.current} 
          onChange={e => handleChange(e.target.value)} 
          className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-3 text-gray-700 min-h-[120px] resize-none" 
          placeholder="Tell us about yourself..."
        />
      ) : (
        <div className="bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-3 text-gray-700 whitespace-pre-line min-h-[120px]">
          {textRef.current || 'No description provided.'}
        </div>
      )}
      {isEditingAbout && (
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
          <button onClick={handleCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
        </div>
      )}
    </div>
  );
});

const ProfessionalBackgroundCard = React.memo(({ employments: initialEmployments, setEmployments, isEditingProfessional, setIsEditingProfessional, handleSaveProfessional, user, isOwnProfile }) => {
  // Use local state for editing
  const [localEmployments, setLocalEmployments] = useState(initialEmployments || []);

  // Update local state when initialEmployments changes and not editing
  useEffect(() => {
    if (!isEditingProfessional) {
      setLocalEmployments(initialEmployments || []);
    }
  }, [initialEmployments, isEditingProfessional]);

  // Handle employment field change
  const handleEmploymentChange = useCallback((idx, field, value) => {
    setLocalEmployments(prev => {
      const newEmps = [...prev];
      newEmps[idx] = { ...newEmps[idx], [field]: value };
      return newEmps;
    });
  }, []);

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
    <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-8 border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-orange-600">Professional Background</h3>
        {!isEditingProfessional && isOwnProfile && (
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
                  className="w-1/2 bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Company Name"
                />
                <input
                  type="text"
                  value={emp.title || ''}
                  onChange={e => handleEmploymentChange(idx, 'title', e.target.value)}
                  className="w-1/2 bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Title"
                />
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={emp.industry || ''}
                  onChange={e => handleEmploymentChange(idx, 'industry', e.target.value)}
                  className="w-1/2 bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Industry"
                />
                <div className="w-1/2">
                  <label htmlFor={`employment-date-${idx}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date Started</label>
                <input
                    id={`employment-date-${idx}`}
                  type="date"
                  value={emp.hire_date ? emp.hire_date.slice(0, 10) : ''}
                  onChange={e => handleEmploymentChange(idx, 'hire_date', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
                />
                </div>
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={emp.employment_type || ''}
                  onChange={e => handleEmploymentChange(idx, 'employment_type', e.target.value)}
                  className="w-1/2 bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
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
});

const AcademicProfileCard = React.memo(({ academicProfile: initialAcademicProfile, setAcademicProfile, isEditingAcademic, setIsEditingAcademic, handleSaveAcademic, user, isOwnProfile }) => {
  // Use local state for editing
  const [localAcademicProfile, setLocalAcademicProfile] = useState(initialAcademicProfile || []);

  // Update local state when initialAcademicProfile changes and not editing
  useEffect(() => {
    if (!isEditingAcademic) {
      setLocalAcademicProfile(initialAcademicProfile || []);
    }
  }, [initialAcademicProfile, isEditingAcademic]);

  // Handle academic profile field change
  const handleProfileChange = useCallback((idx, field, value) => {
    setLocalAcademicProfile(prev => {
      const newProfile = [...prev];
      newProfile[idx] = { ...newProfile[idx], [field]: value };
      return newProfile;
    });
  }, []);

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
    <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-8 border border-gray-200 mb-6 w-full min-h-[320px] flex flex-col justify-between overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-600">Education</h2>
        {!isEditingAcademic && isOwnProfile && (
          <button onClick={() => setIsEditingAcademic(true)} className="text-orange-500 font-semibold hover:underline">Edit</button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
      {isEditingAcademic ? (
              <div>
            {localAcademicProfile.map((profile, index) => (
              <div key={index} className="mb-4 border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex gap-2 mb-2">
                  <div className="w-1/2">
                <div className="text-gray-600 mb-1">Level</div>
                <input
                  type="text"
                  value={profile.level || ''}
                  onChange={e => handleProfileChange(index, 'level', e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Education Level"
                />
              </div>
                  <div className="w-1/2">
                <div className="text-gray-600 mb-1">Course</div>
                <input
                  type="text"
                  value={profile.course || ''}
                  onChange={e => handleProfileChange(index, 'course', e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Course Name"
                />
                  </div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-600 mb-1">Institution</div>
                <input
                  type="text"
                  value={profile.institution || ''}
                  onChange={e => handleProfileChange(index, 'institution', e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Institution Name"
                />
              </div>
              <div className="col-span-2">
                <div className="text-gray-600 mb-1">Address</div>
                <input
                  type="text"
                  value={profile.address || ''}
                  onChange={e => handleProfileChange(index, 'address', e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
                  placeholder="Institution Address"
                />
              </div>
                <div className="flex items-center justify-between">
                  <div className="w-1/2">
                    <label htmlFor={`education-date-${index}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Graduation Date</label>
                <input
                      id={`education-date-${index}`}
                  type="date"
                  value={profile.graduation_date || ''}
                  onChange={e => handleProfileChange(index, 'graduation_date', e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
                />
              </div>
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
              <div key={`view-${index}`} className="border-b last:border-b-0 py-3 space-y-1">
                <div><span className="font-semibold text-gray-700">Level:</span> <span className="font-medium">{profile.level}</span></div>
                <div><span className="font-semibold text-gray-700">Course:</span> <span className="text-gray-600">{profile.course}</span></div>
                <div><span className="font-semibold text-gray-700">Institution:</span> <span className="text-gray-600">{profile.institution}</span></div>
                <div><span className="font-semibold text-gray-700">Address:</span> <span className="text-gray-600">{profile.address}</span></div>
                <div><span className="font-semibold text-gray-700">Graduation Date:</span> <span className="text-gray-600">{profile.graduation_date ? new Date(profile.graduation_date).toLocaleDateString() : ''}</span></div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
});

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
        <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow border border-gray-200 p-8 flex flex-col">
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
        <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow border border-gray-200 p-8 flex flex-col">
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
      <div className="flex-1 bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-8 border border-gray-200 mb-6 flex flex-col">
        <h2 className="text-xl font-bold text-orange-600 mb-6">Password Information</h2>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          <label className="font-semibold">Current Password*
            <input 
              type="password" 
              value={passwordData.current_password}
              onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
              placeholder="Enter your current password" 
              className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 mt-1" 
              required
            />
          </label>
          <label className="font-semibold">New Password*
            <input 
              type="password" 
              value={passwordData.new_password}
              onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
              placeholder="Enter your new password" 
              className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 mt-1" 
              required
            />
          </label>
          <label className="font-semibold">Confirm New Password*
            <input 
              type="password" 
              value={passwordData.confirm_password}
              onChange={e => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              placeholder="Confirm new password" 
              className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 mt-1" 
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

// Add a helper function for formatting
function formatPreferenceText(text) {
  if (!text || typeof text !== 'string') return '';
  // Replace underscores and hyphens with spaces, capitalize each word
  return text
    .replace(/_/g, ' ')
    .replace(/-/g, '- ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/- /g, '-'); // Keep hyphenated words tight
}

function formatStartupStage(stage) {
  if (!stage || typeof stage !== 'string') return '';
  if (stage.toLowerCase() === 'mvp') return 'MVP';
  return formatPreferenceText(stage);
}

// Update the parseArrayField function
const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) {
    return field.map(item => {
      if (typeof item === 'string') {
        return item.replace(/[\[\]"'\\]/g, '').trim();
      }
      return item;
    });
  }
  try {
    if (typeof field === 'string') {
      // Remove all brackets, quotes, and escape characters
      const cleaned = field.replace(/[\[\]"'\\]/g, '').trim();
      if (!cleaned) return [];
      
      // Split by comma if it's a comma-separated string
      if (cleaned.includes(',')) {
        return cleaned.split(',').map(item => item.trim()).filter(Boolean);
      }
      
      return [cleaned];
    }
    return [];
  } catch (error) {
    console.error('Error parsing array field:', error);
    if (typeof field === 'string') {
      return [field.replace(/[\[\]"'\\]/g, '').trim()];
    }
    return [];
  }
};

const MatchmakingPreferencesCard = React.memo(({ preferences, setPreferences, isEditingPreferences, setIsEditingPreferences, handleSavePreferences, user, isOwnProfile }) => {
  const [localPreferences, setLocalPreferences] = useState(preferences || {
    position_desired: '',
    preferred_industries: [],
    preferred_startup_stage: '',
    preferred_location: ''
  });

  // Handle preference field change
  const handlePreferenceChange = useCallback((field, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Update local state when preferences change and not editing
  useEffect(() => {
    if (!isEditingPreferences) {
      const parsedPreferences = preferences ? {
        ...preferences,
        preferred_industries: parseArrayField(preferences.preferred_industries)
      } : {
        position_desired: '',
        preferred_industries: [],
        preferred_startup_stage: '',
        preferred_location: ''
      };
      setLocalPreferences(parsedPreferences);
    }
  }, [preferences, isEditingPreferences]);

  // Handle save
  const handleSave = async () => {
    // Ensure preferred_industries is a string when saving
    const preferencesToSave = {
      ...localPreferences,
      preferred_industries: JSON.stringify(localPreferences.preferred_industries)
    };
    await handleSavePreferences(preferencesToSave);
    setIsEditingPreferences(false);
  };

  // Handle cancel
  const handleCancel = () => {
    const parsedPreferences = preferences ? {
      ...preferences,
      preferred_industries: parseArrayField(preferences.preferred_industries)
    } : {
      position_desired: '',
      preferred_industries: [],
      preferred_startup_stage: '',
      preferred_location: ''
    };
    setLocalPreferences(parsedPreferences);
    setIsEditingPreferences(false);
  };

  // Ensure preferred_industries is always an array
  const industries = parseArrayField(localPreferences.preferred_industries);

  return (
    <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-8 border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-600">Matchmaking Preferences</h2>
        {!isEditingPreferences && isOwnProfile && (
          <button onClick={() => setIsEditingPreferences(true)} className="text-orange-500 font-semibold hover:underline">Edit</button>
        )}
      </div>
      {isEditingPreferences ? (
        <div className="space-y-6">
          <div>
            <div className="text-gray-600 mb-1">Position Desired</div>
            <select
              value={localPreferences.position_desired || ''}
              onChange={e => handlePreferenceChange('position_desired', e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
            >
              <option value="">Select position</option>
              <option value="co-founder">Co-Founder</option>
              <option value="technical_co-founder">Technical Co-Founder</option>
              <option value="business_co_founder">Business Co-Founder</option>
              <option value="investor">Investor</option>
              <option value="advisor">Advisor</option>
            </select>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Preferred Industries</div>
            <TagMultiSelect
              id="preferred-industries"
              name="preferred_industries"
              options={[
                'Technology',
                'Healthcare',
                'Finance',
                'Education',
                'Retail',
                'Manufacturing',
                'Agriculture',
                'Transportation',
                'Real Estate',
                'Energy',
                'Entertainment',
                'Food & Beverage'
              ]}
              selected={industries}
              onChange={selected => handlePreferenceChange('preferred_industries', selected)}
              placeholder="Select or type industries..."
            />
          </div>
          <div>
            <div className="text-gray-600 mb-1">Preferred Startup Stage</div>
            <select
              value={localPreferences.preferred_startup_stage || ''}
              onChange={e => handlePreferenceChange('preferred_startup_stage', e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
            >
              <option value="">Select stage</option>
              <option value="idea">Idea Stage</option>
              <option value="mvp">MVP Stage</option>
              <option value="scaling">Scaling Stage</option>
              <option value="established">Established Stage</option>
            </select>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Preferred Location</div>
            <PhilippinesLocationSelector
              value={localPreferences.preferred_location}
              onChange={value => handlePreferenceChange('preferred_location', value)}
              disabled={false}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
            <button onClick={handleCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="text-gray-600 mb-1">Position Desired</div>
            <div className="font-semibold">{formatPreferenceText(localPreferences.position_desired) || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Preferred Industries</div>
            <div className="flex flex-wrap gap-2">
              {industries.length > 0 ? (
                industries.map((industry, index) => (
                  <span key={index} className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                    {industry.replace(/[\[\]"'\\]/g, '').trim()}
                  </span>
                ))
              ) : (
                <div className="font-semibold">Not specified</div>
              )}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Preferred Startup Stage</div>
            <div className="font-semibold">{formatStartupStage(localPreferences.preferred_startup_stage) || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Preferred Location</div>
            <div className="font-semibold">
              {formatPhilippinesAddress(localPreferences.preferred_location) || 'Not specified'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Replace the SkillsCard component with this updated version
function SkillsCard({ skills = [], setSkills, isEditingSkills, setIsEditingSkills, handleSaveSkills, user, isOwnProfile, cardClassName, isEditingProfile }) {
  return (
    <div className={cardClassName || "bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-6 border border-gray-200 mb-6"}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-orange-600">Skills</h2>
        {!isEditingSkills && isOwnProfile && (
          <button onClick={() => setIsEditingSkills(true)} className="text-orange-500 font-semibold hover:underline">Edit</button>
        )}
      </div>
      {isEditingSkills ? (
        <div>
          <TagMultiSelect
            id="user-skills"
            name="skills"
            options={SKILLS}
            selected={skills}
            onChange={setSkills}
            placeholder="Type or select skills..."
          />
          <div className="flex gap-2 mt-4">
            <button onClick={handleSaveSkills} className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
            <button onClick={() => { setIsEditingSkills(false); }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.length === 0 && <div className="text-gray-500">No skills added yet.</div>}
          {skills.map((skill, index) => (
            <div key={index} className="bg-gray-100 rounded-full px-3 py-1">
              {skill}
            </div>
          ))}
        </div>
      )}
      {isOwnProfile && isEditingProfile && !isEditingSkills && (
        <button onClick={() => setIsEditingSkills(true)} className="mt-4 text-orange-500 font-semibold hover:underline">Edit</button>
      )}
    </div>
  );
}

// Social Media Links Card Component
const SocialMediaLinksCard = React.memo(({ socialLinks, setSocialLinks, isEditingSocial, setIsEditingSocial, handleSaveSocial, user, isOwnProfile }) => {
  const [localSocialLinks, setLocalSocialLinks] = useState(socialLinks || {
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    microsoft_url: '',
    whatsapp_url: '',
    telegram_url: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Update local state when socialLinks changes
  useEffect(() => {
    console.log('SocialMediaLinksCard useEffect triggered:', { socialLinks, isEditingSocial });
    if (!isEditingSocial) {
      const newLinks = socialLinks || {
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
        linkedin_url: '',
        microsoft_url: '',
        whatsapp_url: '',
        telegram_url: ''
      };
      console.log('Updating localSocialLinks:', newLinks);
      setLocalSocialLinks(newLinks);
    }
  }, [socialLinks, isEditingSocial]);

  // URL validation function
  const validateURL = (url, platform) => {
    if (!url || url.trim() === '') return { isValid: true, message: '' };
    
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    
    if (!urlPattern.test(url)) {
      return { isValid: false, message: 'Please enter a valid URL' };
    }

    // Platform-specific validations
    const platformValidations = {
      facebook: /facebook\.com|fb\.com/i,
      twitter: /twitter\.com|x\.com/i,
      instagram: /instagram\.com/i,
      linkedin: /linkedin\.com/i,
      microsoft: /microsoft\.com|outlook\.com|live\.com/i,
      whatsapp: /whatsapp\.com|wa\.me/i,
      telegram: /telegram\.org|t\.me/i
    };

    if (platformValidations[platform] && !platformValidations[platform].test(url)) {
      return { isValid: false, message: `Please enter a valid ${platform.charAt(0).toUpperCase() + platform.slice(1)} URL` };
    }

    return { isValid: true, message: '' };
  };

  // Handle input changes with validation
  const handleInputChange = (field, value) => {
    setLocalSocialLinks(prev => ({ ...prev, [field]: value }));
    
    // Validate URL
    const platform = field.replace('_url', '');
    const validation = validateURL(value, platform);
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? '' : validation.message
    }));
  };

  // Handle save
  const handleSave = async () => {
    // Validate all URLs before saving
    const errors = {};
    Object.keys(localSocialLinks).forEach(field => {
      const platform = field.replace('_url', '');
      const validation = validateURL(localSocialLinks[field], platform);
      if (!validation.isValid) {
        errors[field] = validation.message;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSocialLinks(localSocialLinks);
    await handleSaveSocial(localSocialLinks);
    setIsEditingSocial(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setLocalSocialLinks(socialLinks || {
      facebook_url: '',
      twitter_url: '',
      instagram_url: '',
      linkedin_url: '',
      microsoft_url: '',
      whatsapp_url: '',
      telegram_url: ''
    });
    setValidationErrors({});
    setIsEditingSocial(false);
  };

  // Social media platforms configuration
  const socialPlatforms = [
    { key: 'facebook_url', name: 'Facebook', icon: FaFacebook, color: 'text-blue-600', placeholder: 'https://facebook.com/yourprofile' },
    { key: 'twitter_url', name: 'Twitter/X', icon: FaTwitter, color: 'text-black', placeholder: 'https://twitter.com/yourprofile' },
    { key: 'instagram_url', name: 'Instagram', icon: FaInstagram, color: 'text-pink-600', placeholder: 'https://instagram.com/yourprofile' },
    { key: 'linkedin_url', name: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-700', placeholder: 'https://linkedin.com/in/yourprofile' },
    { key: 'microsoft_url', name: 'Microsoft', icon: FaMicrosoft, color: 'text-blue-500', placeholder: 'https://outlook.com/yourprofile' },
    { key: 'whatsapp_url', name: 'WhatsApp', icon: FaWhatsapp, color: 'text-green-500', placeholder: 'https://wa.me/yourphonenumber' },
    { key: 'telegram_url', name: 'Telegram', icon: FaTelegram, color: 'text-blue-400', placeholder: 'https://t.me/yourprofile' }
  ];

  return (
    <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-8 border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-600">Social Media Links</h2>
        {!isEditingSocial && isOwnProfile && (
          <button onClick={() => setIsEditingSocial(true)} className="text-orange-500 font-semibold hover:underline">Edit</button>
        )}
      </div>

      {isEditingSocial ? (
        <div className="space-y-4">
          {socialPlatforms.map(platform => (
            <div key={platform.key}>
              <label className="flex items-center gap-2 text-gray-600 mb-2">
                <platform.icon className={`w-5 h-5 ${platform.color}`} />
                <span className="font-medium">{platform.name}</span>
              </label>
              <input
                type="url"
                value={localSocialLinks[platform.key] || ''}
                onChange={e => handleInputChange(platform.key, e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-medium border focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder={platform.placeholder}
              />
              {validationErrors[platform.key] && (
                <div className="text-red-500 text-sm mt-1">{validationErrors[platform.key]}</div>
              )}
            </div>
          ))}
          <div className="flex gap-2 mt-6">
            <button onClick={handleSave} className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
            <button onClick={handleCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {socialPlatforms.map(platform => {
            // Use socialLinks from parent when not editing, localSocialLinks when editing
            const currentLinks = isEditingSocial ? localSocialLinks : socialLinks || {};
            const url = currentLinks[platform.key];
            return (
              <div key={platform.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#2a2b2c] rounded-lg">
                <div className="flex items-center gap-3">
                  <platform.icon className={`w-5 h-5 ${platform.color}`} />
                  <span className="font-medium">{platform.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {url && url.trim() !== '' ? (
                    <>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                      >
                        View Profile
                      </a>
                                             {isOwnProfile && (
                         <button
                           onClick={async () => {
                             try {
                               const platformName = platform.key.replace('_url', '');
                               await userProfileAPI.deleteSocialLink(user.id, platformName);
                               const updatedLinks = { ...currentLinks, [platform.key]: '' };
                               setSocialLinks(updatedLinks);
                               await fetchProfile(user.id);
                             } catch (error) {
                               alert('Failed to remove social link: ' + error.message);
                             }
                           }}
                           className="text-red-500 hover:text-red-600 text-sm"
                         >
                           Remove
                         </button>
                       )}
                    </>
                  ) : (
                    <span className="text-gray-500 text-sm">Not connected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

// Philippines Location Selector Component
function PhilippinesLocationSelector({ value, onChange, disabled = false }) {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');

  // Load regions on component mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const regionData = await fetchRegions();
        setRegions(regionData);
      } catch (error) {
        console.error('Error loading regions:', error);
      }
    };
    loadRegions();
  }, []);

  // Parse the current value to set initial selections
  useEffect(() => {
    if (value && typeof value === 'object') {
      setSelectedRegion(value.regionCode || '');
      setSelectedProvince(value.provinceCode || '');
      setSelectedCity(value.cityCode || '');
      setSelectedBarangay(value.barangayCode || '');
      
      // Load the dependent dropdowns
      if (value.regionCode) {
        loadProvinces(value.regionCode);
      }
      if (value.provinceCode) {
        loadCities(value.provinceCode);
      }
      if (value.cityCode) {
        loadBarangays(value.cityCode);
      }
    } else if (typeof value === 'string' && value !== '') {
      // If it's a string, clear selections and set as display text
      setSelectedRegion('');
      setSelectedProvince('');
      setSelectedCity('');
      setSelectedBarangay('');
    }
  }, [value]);

  const loadProvinces = async (regionCode) => {
    if (!regionCode) {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
      return;
    }
    
    setLoading(true);
    try {
      const provinceData = await fetchProvinces(regionCode);
      setProvinces(provinceData);
      setCities([]);
      setBarangays([]);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (provinceCode) => {
    if (!provinceCode) {
      setCities([]);
      setBarangays([]);
      return;
    }
    
    setLoading(true);
    try {
      const cityData = await fetchCities(provinceCode);
      setCities(cityData);
      setBarangays([]);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBarangays = async (cityCode) => {
    if (!cityCode) {
      setBarangays([]);
      return;
    }
    
    setLoading(true);
    try {
      const barangayData = await fetchBarangays(cityCode);
      setBarangays(barangayData);
    } catch (error) {
      console.error('Error loading barangays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    setSelectedRegion(regionCode);
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedBarangay('');
    
    loadProvinces(regionCode);
    
    if (regionCode) {
      const region = regions.find(r => r.code === regionCode);
      updateValue({ regionCode, regionName: region?.name });
    } else {
      updateValue(null);
    }
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedCity('');
    setSelectedBarangay('');
    
    loadCities(provinceCode);
    
    if (provinceCode && selectedRegion) {
      const region = regions.find(r => r.code === selectedRegion);
      const province = provinces.find(p => p.code === provinceCode);
      updateValue({
        regionCode: selectedRegion,
        regionName: region?.name,
        provinceCode,
        provinceName: province?.name
      });
    }
  };

  const handleCityChange = (e) => {
    const cityCode = e.target.value;
    setSelectedCity(cityCode);
    setSelectedBarangay('');
    
    loadBarangays(cityCode);
    
    if (cityCode && selectedProvince && selectedRegion) {
      const region = regions.find(r => r.code === selectedRegion);
      const province = provinces.find(p => p.code === selectedProvince);
      const city = cities.find(c => c.code === cityCode);
      updateValue({
        regionCode: selectedRegion,
        regionName: region?.name,
        provinceCode: selectedProvince,
        provinceName: province?.name,
        cityCode,
        cityName: city?.name
      });
    }
  };

  const handleBarangayChange = (e) => {
    const barangayCode = e.target.value;
    setSelectedBarangay(barangayCode);
    
    if (barangayCode && selectedCity && selectedProvince && selectedRegion) {
      const region = regions.find(r => r.code === selectedRegion);
      const province = provinces.find(p => p.code === selectedProvince);
      const city = cities.find(c => c.code === selectedCity);
      const barangay = barangays.find(b => b.code === barangayCode);
      updateValue({
        regionCode: selectedRegion,
        regionName: region?.name,
        provinceCode: selectedProvince,
        provinceName: province?.name,
        cityCode: selectedCity,
        cityName: city?.name,
        barangayCode,
        barangayName: barangay?.name
      });
    }
  };

  const updateValue = (locationData) => {
    onChange(locationData);
  };

  const formatDisplayValue = () => {
    return formatPhilippinesAddress(value);
  };

  if (disabled) {
    return (
      <input
        type="text"
        value={formatDisplayValue()}
        disabled
        className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
        placeholder="No location specified"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Region</label>
          <select
            value={selectedRegion}
            onChange={handleRegionChange}
            className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
            disabled={loading}
          >
            <option value="">Select Region</option>
            {regions.map(region => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Province</label>
          <select
            value={selectedProvince}
            onChange={handleProvinceChange}
            className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
            disabled={loading || !selectedRegion}
          >
            <option value="">Select Province</option>
            {provinces.map(province => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">City/Municipality</label>
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
            disabled={loading || !selectedProvince}
          >
            <option value="">Select City/Municipality</option>
            {cities.map(city => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Barangay</label>
          <select
            value={selectedBarangay}
            onChange={handleBarangayChange}
            className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-2 text-gray-700 font-semibold"
            disabled={loading || !selectedCity}
          >
            <option value="">Select Barangay</option>
            {barangays.map(barangay => (
              <option key={barangay.code} value={barangay.code}>
                {barangay.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {formatDisplayValue() && (
        <div className="text-sm text-gray-600 bg-gray-50 dark:bg-[#2a2b2c] rounded px-3 py-2">
          <strong>Selected:</strong> {formatDisplayValue()}
        </div>
      )}
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Determine if viewing own profile
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const isOwnProfile = loggedInUser && user && String(loggedInUser.id) === String(user.id);

  // Edit states and form data for each section
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [preferences, setPreferences] = useState(null);

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

  // Add skills state
  const [skills, setSkills] = useState([]);
  const [isEditingSkills, setIsEditingSkills] = useState(false);

  // Add state for editing the whole profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Fetch profile and social links only when id changes
  useEffect(() => {
    if (id) {
      fetchProfile(id);
    } else {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const userObj = JSON.parse(stored);
          setUser(userObj);
          fetchProfile(userObj.id);
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
    // Sync skills from user profile
    setSkills(Array.isArray(user?.skills) ? user.skills : []);
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
      
      // Fetch preferences
      try {
        const prefs = await api.getUserPreferences(userId);
        setPreferences(prefs);
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setPreferences(null);
      }

      // Fetch social links
      try {
        const links = await api.getUserSocialLinks(userId);
        console.log('Fetched social links:', links);
        setSocialLinks(links);
      } catch (err) {
        console.error('Error fetching social links:', err);
        setSocialLinks({});
      }
    } catch (err) {
      setError('Failed to load profile');
    }
  };



  // Save handlers
  const handleSaveGeneral = async (localInfo) => {
    // Validate phone number on save
    if (localInfo.contact_number) {
      const validation = validatePhoneNumber(localInfo.contact_number, false);
      if (!validation.isValid) {
        setValidationError(validation.message);
        return;
      }
    }

    // Format the birthdate to ensure it's in YYYY-MM-DD format without timezone conversion
    const birthdate = formatDate(localInfo.birthdate);
    
    try {
      await userProfileAPI.updateUserProfile(user.id, {
        first_name: localInfo.firstName,
        last_name: localInfo.lastName,
        email: localInfo.email,
        profile_image: user.profile_image,
        birthdate,
        gender: localInfo.gender,
        contact_number: localInfo.contact_number,
        location: localInfo.location,
        introduction: about,
        industry: employments[0]?.industry || '',
        show_in_search: user.show_in_search,
        show_in_messages: user.show_in_messages,
        show_in_pages: user.show_in_pages,
        employment: employments
      });
      setIsEditingGeneral(false);
      await fetchProfile(user.id); // Refresh the profile data
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

  const handleSaveSocial = async (updatedSocialLinks = null) => {
    const linksToSave = updatedSocialLinks || socialLinks;
    console.log('handleSaveSocial called', {
      social_links: linksToSave,
      current_socialLinks: socialLinks
    });
    try {
      const result = await userProfileAPI.updateSocialLinks(user.id, linksToSave);
      console.log('API result:', result);
      // Update local state immediately with the result from the API
      setSocialLinks(result || linksToSave);
      console.log('Setting socialLinks to:', result || linksToSave);
      setIsEditingSocial(false);
      // Refresh the entire profile to ensure consistency
      await fetchProfile(user.id);
    } catch (err) {
      console.error('Error saving social links:', err);
      alert('Failed to update social links: ' + err.message);
    }
  };

  const handleSavePreferences = async (updatedPreferences) => {
    try {
      await userProfileAPI.updateUserProfile(user.id, {
        ...user,
        position_desired: updatedPreferences.position_desired,
        preferred_industries: updatedPreferences.preferred_industries,
        preferred_startup_stage: updatedPreferences.preferred_startup_stage,
        preferred_location: updatedPreferences.preferred_location
      });
      setPreferences(updatedPreferences);
      fetchProfile(user.id);
    } catch (err) {
      alert('Failed to update matchmaking preferences.');
    }
  };

  // Add skills save handler
  const handleSaveSkills = async (updatedSkills) => {
    try {
      await userProfileAPI.updateUserProfile(user.id, {
        ...user,
        skills: updatedSkills
      });
      setSkills(updatedSkills);
      setIsEditingSkills(false);
      fetchProfile(user.id);
    } catch (err) {
      alert('Failed to update skills.');
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Update the MobileSidebar component
  const MobileSidebar = () => (
    <>
      <div 
        className={`lg:hidden fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-white dark:bg-[#232526] shadow-lg transition-transform duration-300 ease-in-out z-50`}
      >
        <nav className="flex-1 px-4 py-6 h-full overflow-y-auto">
          {user && (
            <div className="flex flex-col items-center mb-8">
              <div className="mb-3 relative group">
                {user.profile_image && user.profile_image.trim() !== '' ? (
                  <img src={user.profile_image} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-orange-500 bg-gray-100 mb-2" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-orange-500 flex items-center justify-center mb-2">
                    <FaUser className="text-white" size={60} />
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-gray-800 dark:text-white">{user.first_name} {user.last_name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
              </div>
            </div>
          )}
                        <ul className="space-y-6">
                <li 
                  className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'personal' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-400'}`} 
                  onClick={() => { setActiveSection('personal'); setIsSidebarOpen(false); }}
                >
                  <FaUser /> Personal Details
                </li>
                <li 
                  className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'academic' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-400'}`}
                  onClick={() => { setActiveSection('academic'); setIsSidebarOpen(false); }}
                >
                  <FaGraduationCap /> Academic Profile
                </li>
                <li 
                  className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'social' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-400'}`}
                  onClick={() => { setActiveSection('social'); setIsSidebarOpen(false); }}
                >
                  <FaFacebook /> Social Media
                </li>
                <li 
                  className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'matchmaking' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-400'}`}
                  onClick={() => { setActiveSection('matchmaking'); setIsSidebarOpen(false); }}
                >
                  <FaHandshake /> Matchmaking Preferences
                </li>
                {isOwnProfile && (
                  <li 
                    className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'privacy' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-400'}`}
                    onClick={() => { setActiveSection('privacy'); setIsSidebarOpen(false); }}
                  >
                    <FaLock /> Privacy Settings
                  </li>
                )}
              </ul>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => { navigate('/login'); localStorage.clear(); }} 
              className="flex items-center gap-3 text-left text-orange-500 font-semibold hover:underline w-full"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </nav>
      </div>
    </>
  );

  // Update the Sidebar component
  const Sidebar = () => (
    <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow w-full lg:w-[270px] lg:h-[calc(100vh-110px)] flex flex-col items-center py-6 px-6 pb-8 lg:mr-8 border border-gray-200 overflow-y-auto min-h-0">
      {user && (
      <div className="flex flex-col items-center mb-8">
        <div className="mb-3 relative group">
          {user.profile_image && user.profile_image.trim() !== '' ? (
            <img src={user.profile_image} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-orange-500 bg-gray-100 mb-2" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-orange-500 flex items-center justify-center mb-2">
              <FaUser className="text-white" size={60} />
            </div>
          )}
          {isOwnProfile && (
            <label className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow cursor-pointer opacity-80 hover:opacity-100 transition-opacity group-hover:opacity-100">
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (!file.type.startsWith('image/')) {
                      alert('Please select an image file');
                      return;
                    }
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
          )}
        </div>
        <div className="text-center">
          <div className="font-bold text-xl text-gray-800">{user.first_name} {user.last_name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      </div>
      )}
      <nav className="flex-1 w-full">
        <ul className="space-y-6 text-left">
          <li className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'personal' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-400'}`} onClick={() => setActiveSection('personal')}><FaUser /> Personal Details</li>
          <li className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'academic' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-400'}`} onClick={() => setActiveSection('academic')}><FaGraduationCap /> Academic Profile</li>
          <li className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'social' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-400'}`} onClick={() => setActiveSection('social')}><FaFacebook /> Social Media</li>
          <li className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'matchmaking' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-400'}`} onClick={() => setActiveSection('matchmaking')}><FaHandshake /> Matchmaking Preferences</li>
          {isOwnProfile && (
            <li className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'privacy' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-400'}`} onClick={() => setActiveSection('privacy')}><FaLock /> Privacy Settings</li>
          )}
        </ul>
      </nav>
      <div className="mt-auto w-full pt-8">
        <button className="flex items-center gap-3 text-left text-orange-500 font-semibold hover:underline w-full"><FaSignOutAlt /> Logout</button>
      </div>
    </div>
  );

  // Update the PersonalSection component
  const PersonalSection = () => (
    <>
      {/* Mobile Profile Section */}
      {user && (
        <div className="lg:hidden flex flex-col gap-6">
          {/* Edit Profile Button (only for own profile) */}
          {isOwnProfile && !isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="self-end mb-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold shadow hover:bg-orange-200 transition-colors"
              aria-label="Edit Profile"
            >
              <span className="flex items-center gap-1"><FaEdit className="inline-block" /> Edit Profile</span>
            </button>
          )}
          {isOwnProfile && isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(false)}
              className="self-end mb-2 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-semibold shadow hover:bg-gray-300 transition-colors"
              aria-label="Done Editing"
            >
              <span className="flex items-center gap-1"><FaTimes className="inline-block" /> Done</span>
            </button>
          )}
          <div className="flex flex-col items-center mb-2">
            <div className="mb-3 relative group">
        {user.profile_image && user.profile_image.trim() !== '' ? (
                <img src={user.profile_image} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-orange-500 bg-gray-100 mb-2" />
        ) : (
                <div className="w-28 h-28 rounded-full bg-orange-500 flex items-center justify-center mb-2">
                  <FaUser className="text-white" size={60} />
          </div>
              )}
              {isOwnProfile && (
                <div className="absolute -bottom-2 right-0 flex gap-2">
                  <label className="bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors border-2 border-orange-500">
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (!file.type.startsWith('image/')) {
                            alert('Please select an image file');
                            return;
                          }
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
                    <FaEdit className="w-4 h-4 text-orange-500" />
                  </label>
                  {user.profile_image && (
                    <button
                      onClick={async () => {
                        try {
                          await userProfileAPI.updateProfileImage(user.id, '');
                          await fetchProfile(user.id);
                          alert('Profile image removed successfully');
                        } catch (error) {
                          console.error('Error removing profile image:', error);
                          alert(error.message || 'Failed to remove profile image. Please try again.');
                        }
                      }}
                      className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors border-2 border-red-500"
                    >
                      <FaTimes className="w-4 h-4 text-red-500" />
                    </button>
        )}
      </div>
              )}
    </div>
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user.first_name} {user.last_name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          {/* About Section with edit for mobile */}
          <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-6 border border-gray-200 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">About</h2>
              {!isEditingAbout && isOwnProfile && isEditingProfile && (
                <button onClick={() => setIsEditingAbout(true)} className="text-orange-500 font-semibold hover:underline">Edit</button>
              )}
            </div>
            {isEditingAbout ? (
              <>
                <textarea
                  defaultValue={about}
                  onChange={e => setAbout(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#232526] dark:text-white rounded px-3 py-3 text-gray-700 min-h-[120px] resize-none"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex gap-2 mt-4">
                  <button onClick={handleSaveAbout} className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
                  <button onClick={() => { setAbout(user?.introduction || ''); setIsEditingAbout(false); }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 whitespace-pre-line min-h-[60px]">{about || 'No description provided.'}</p>
            )}
          </div>
          <GeneralInfo 
            generalInfo={generalInfo} 
            setGeneralInfo={setGeneralInfo} 
            isEditingGeneral={isEditingGeneral} 
            setIsEditingGeneral={setIsEditingGeneral} 
            handleSaveGeneral={handleSaveGeneral} 
            user={user} 
            isOwnProfile={isOwnProfile}
            isEditingProfile={isEditingProfile}
            cardClassName="mb-4"
            idPrefix="mobile-"
          />
          {/* Social Media Links as icons only, like desktop */}
          <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-6 border border-gray-200 mb-4">
            <h3 className="text-lg font-bold text-orange-600 mb-4">Social Links</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {socialLinks.facebook_url && (
                <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <FaFacebook size={20} />
                </a>
              )}
              {socialLinks.instagram_url && (
                <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-colors">
                  <FaInstagram size={20} />
                </a>
              )}
              {socialLinks.linkedin_url && (
                <a href={socialLinks.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center text-white hover:bg-blue-900 transition-colors">
                  <FaLinkedin size={20} />
                </a>
              )}
              {socialLinks.twitter_url && (
                <a href={socialLinks.twitter_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                  <FaTwitter size={20} />
                </a>
              )}
              {socialLinks.whatsapp_url && (
                <a href={socialLinks.whatsapp_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors">
                  <FaWhatsapp size={20} />
                </a>
              )}
              {socialLinks.telegram_url && (
                <a href={socialLinks.telegram_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                  <FaTelegram size={20} />
                </a>
              )}
              {socialLinks.microsoft_url && (
                <a href={socialLinks.microsoft_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
                  <FaMicrosoft size={20} />
                </a>
              )}
              {!socialLinks.facebook_url && !socialLinks.instagram_url && !socialLinks.linkedin_url && 
               !socialLinks.twitter_url && !socialLinks.whatsapp_url && !socialLinks.telegram_url && 
               !socialLinks.microsoft_url && (
                <div className="text-gray-500 text-sm">No social links added yet.</div>
              )}
            </div>
            {/* Social Links Edit Button */}
            {isOwnProfile && isEditingProfile && !isEditingSocial && (
              <button onClick={() => setIsEditingSocial(true)} className="mt-4 text-orange-500 font-semibold hover:underline">Edit</button>
            )}
          </div>
          <SkillsCard 
            skills={skills}
            setSkills={setSkills}
            isEditingSkills={isEditingSkills}
            setIsEditingSkills={setIsEditingSkills}
            handleSaveSkills={handleSaveSkills}
            user={user}
            isOwnProfile={isOwnProfile}
            cardClassName="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-6 border border-gray-200 mb-4"
            isEditingProfile={isEditingProfile}
          />
          <ProfessionalBackgroundCard 
            employments={employments} 
            setEmployments={setEmployments} 
            isEditingProfessional={isEditingProfessional} 
            setIsEditingProfessional={setIsEditingProfessional} 
            handleSaveProfessional={handleSaveProfessional} 
            user={user} 
            isOwnProfile={isOwnProfile}
            isEditingProfile={isEditingProfile}
            cardClassName="mb-4"
          />
        </div>
      )}
    </>
  );

  // Update the RightPanel component
  const RightPanel = () => (
    <div className="flex flex-col gap-8 min-h-[700px] max-w-[420px] w-full">
      {user && (
        <>
      <div className="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-orange-600 mb-4">Social Links</h3>
        <div className="flex flex-wrap gap-3">
          {socialLinks.facebook_url && (
            <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" 
               className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
              <FaFacebook size={20} />
            </a>
          )}
          {socialLinks.instagram_url && (
            <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" 
               className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-colors">
              <FaInstagram size={20} />
            </a>
          )}
          {socialLinks.linkedin_url && (
            <a href={socialLinks.linkedin_url} target="_blank" rel="noopener noreferrer" 
               className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center text-white hover:bg-blue-900 transition-colors">
              <FaLinkedin size={20} />
            </a>
          )}
          {socialLinks.twitter_url && (
            <a href={socialLinks.twitter_url} target="_blank" rel="noopener noreferrer" 
               className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
              <FaTwitter size={20} />
            </a>
          )}
          {socialLinks.whatsapp_url && (
            <a href={socialLinks.whatsapp_url} target="_blank" rel="noopener noreferrer" 
               className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors">
              <FaWhatsapp size={20} />
            </a>
          )}
          {socialLinks.telegram_url && (
            <a href={socialLinks.telegram_url} target="_blank" rel="noopener noreferrer" 
               className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
              <FaTelegram size={20} />
            </a>
          )}
          {socialLinks.microsoft_url && (
            <a href={socialLinks.microsoft_url} target="_blank" rel="noopener noreferrer" 
               className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
              <FaMicrosoft size={20} />
            </a>
          )}
          {!socialLinks.facebook_url && !socialLinks.instagram_url && !socialLinks.linkedin_url && 
           !socialLinks.twitter_url && !socialLinks.whatsapp_url && !socialLinks.telegram_url && 
           !socialLinks.microsoft_url && (
            <div className="text-gray-500 text-sm">No social links added yet.</div>
          )}
        </div>
      </div>
      <ProfessionalBackgroundCard 
        employments={employments} 
        setEmployments={setEmployments} 
        isEditingProfessional={isEditingProfessional} 
        setIsEditingProfessional={setIsEditingProfessional} 
        handleSaveProfessional={handleSaveProfessional} 
        user={user} 
        isOwnProfile={isOwnProfile}
      />
      <SkillsCard 
        skills={skills}
        setSkills={setSkills}
        isEditingSkills={isEditingSkills}
        setIsEditingSkills={setIsEditingSkills}
        handleSaveSkills={handleSaveSkills}
        user={user}
        isOwnProfile={isOwnProfile}
        cardClassName="bg-white dark:bg-[#232526] dark:text-white rounded-2xl shadow p-6 border border-gray-200 mb-4"
      />
        </>
      )}
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
        isOwnProfile={isOwnProfile}
      />
    </div>
  );

  // Privacy Settings Section (only for profile owner)
  const PrivacySettings = () => (
    <PrivacySettingsCard user={user} setUser={setUser} fetchProfile={fetchProfile} />
  );

  const handleGeneralInfoChange = useCallback((newInfo) => {
    setGeneralInfo(newInfo);
  }, []);

  const handleAboutChange = useCallback((newAbout) => {
    setAbout(newAbout);
  }, []);

  // Main Layout
  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#181818] flex flex-col">
      <Navbar />
      <div className="flex flex-col lg:flex-row w-full gap-8 px-4 sm:px-8 pt-24 lg:pt-24 pb-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden">
          <HamburgerButton
            isOpen={isSidebarOpen}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <MobileSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            title="Profile"
          >
            <nav className="flex-1 px-4 py-6 h-full overflow-y-auto">
              {user && (
                <div className="flex flex-col items-center mb-8">
                  <div className="mb-3 relative group">
                    {user.profile_image && user.profile_image.trim() !== '' ? (
                      <img src={user.profile_image} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-orange-500 bg-gray-100 mb-2" />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-orange-500 flex items-center justify-center mb-2">
                        <FaUser className="text-white" size={60} />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-gray-800 dark:text-white">{user.first_name} {user.last_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
              )}
              <ul className="space-y-6">
                <li 
                  className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'personal' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-400'}`} 
                  onClick={() => { setActiveSection('personal'); setIsSidebarOpen(false); }}
                >
                  <FaUser /> Personal Details
                </li>
                <li 
                  className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'academic' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-400'}`}
                  onClick={() => { setActiveSection('academic'); setIsSidebarOpen(false); }}
                >
                  <FaGraduationCap /> Academic Profile
                </li>
                <li 
                  className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'social' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-400'}`}
                  onClick={() => { setActiveSection('social'); setIsSidebarOpen(false); }}
                >
                  <FaFacebook /> Social Media
                </li>
                <li 
                  className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'matchmaking' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-400'}`}
                  onClick={() => { setActiveSection('matchmaking'); setIsSidebarOpen(false); }}
                >
                  <FaHandshake /> Matchmaking Preferences
                </li>
                {isOwnProfile && (
                  <li 
                    className={`flex items-center gap-3 font-semibold cursor-pointer ${activeSection === 'privacy' ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-400'}`}
                    onClick={() => { setActiveSection('privacy'); setIsSidebarOpen(false); }}
                  >
                    <FaLock /> Privacy Settings
                  </li>
                )}
              </ul>
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => { navigate('/login'); localStorage.clear(); }} 
                  className="flex items-center gap-3 text-left text-orange-500 font-semibold hover:underline w-full"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </nav>
          </MobileSidebar>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop view: About and General Information */}
          <div className="hidden lg:block">
            {activeSection === 'personal' && (
              <>
                <AboutCard
                  about={about}
                  setAbout={setAbout}
                  isEditingAbout={isEditingAbout}
                  setIsEditingAbout={setIsEditingAbout}
                  handleSaveAbout={handleSaveAbout}
                  user={user}
                  isOwnProfile={isOwnProfile}
                  idPrefix="desktop-"
                />
                <GeneralInfo
                  generalInfo={generalInfo}
                  setGeneralInfo={setGeneralInfo}
                  isEditingGeneral={isEditingGeneral}
                  setIsEditingGeneral={setIsEditingGeneral}
                  handleSaveGeneral={handleSaveGeneral}
                  user={user}
                  isOwnProfile={isOwnProfile}
                  isEditingProfile={true}
                  cardClassName="mb-4"
                  idPrefix="desktop-"
                />
              </>
            )}
          </div>
          {/* Mobile view: PersonalSection already handles About and General Info */}
          <div className="block lg:hidden">
            <PersonalSection />
          </div>
          {activeSection === 'academic' && <AcademicProfile />}
          {activeSection === 'social' && (
            <SocialMediaLinksCard
              socialLinks={socialLinks}
              setSocialLinks={setSocialLinks}
              isEditingSocial={isEditingSocial}
              setIsEditingSocial={setIsEditingSocial}
              handleSaveSocial={handleSaveSocial}
              user={user}
              isOwnProfile={isOwnProfile}
            />
          )}
          {activeSection === 'matchmaking' && (
            <MatchmakingPreferencesCard
              preferences={preferences}
              setPreferences={setPreferences}
              isEditingPreferences={isEditingPreferences}
              setIsEditingPreferences={setIsEditingPreferences}
              handleSavePreferences={handleSavePreferences}
              user={user}
              isOwnProfile={isOwnProfile}
            />
          )}
          {activeSection === 'privacy' && isOwnProfile && <PrivacySettings />}
        </div>
        {activeSection === 'personal' && <div className="hidden lg:block"><RightPanel /></div>}
      </div>
    </div>
  );
}