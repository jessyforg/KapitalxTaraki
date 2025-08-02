import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { validatePhoneNumber, validateDate } from '../utils/validation';
import { fetchRegions, fetchProvinces, fetchCities, fetchBarangays } from '../services/locationAPI';

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

const EDUCATION_LEVELS = [
  'Elementary',
  'High School',
  'Senior High School',
  'Vocational/Technical',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate/PhD',
  'Professional Degree',
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
        className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
        placeholder="No location specified"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-black mb-1">Region</label>
          <select
            value={selectedRegion}
            onChange={handleRegionChange}
            className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
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
          <label className="block text-sm text-black mb-1">Province</label>
          <select
            value={selectedProvince}
            onChange={handleProvinceChange}
            className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
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
          <label className="block text-sm text-black mb-1">City/Municipality</label>
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
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
          <label className="block text-sm text-black mb-1">Barangay</label>
          <select
            value={selectedBarangay}
            onChange={handleBarangayChange}
            className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
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
        <div className="text-sm text-gray-600 bg-gray-50 rounded-full px-3 py-2">
          <strong>Selected:</strong> {formatDisplayValue()}
        </div>
      )}
    </div>
  );
}

const steps = [
  { label: 'Basic Information' },
  { label: 'Background & Experience' },
  { label: 'Social Links' },
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

const UserDetailsModal = ({ user, onClose, onComplete }) => {
  const [formData, setFormData] = useState({
    gender: '',
    birthdate: '',
    location: '',
    contact_number: '',
    industry: '',
    employment: [],
    academic_profile: [],
    accomplishments: [],
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
    is_founder: false,
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
          ...data,
          employment: Array.isArray(data.employment) ? data.employment : data.employment ? [data.employment] : [],
          academic_profile: Array.isArray(data.academic_profile) ? data.academic_profile : data.academic_profile ? [data.academic_profile] : [],
          accomplishments: Array.isArray(data.accomplishments) ? data.accomplishments : data.accomplishments ? [data.accomplishments] : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          preferred_industries: Array.isArray(data.preferred_industries) ? data.preferred_industries : []
        }));
      }).catch(() => {});
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Validate phone number during typing
    if (name === 'contact_number') {
      const validation = validatePhoneNumber(value, true);
      if (!validation.isValid) {
        setError(validation.message);
        return;
      }
      setError('');
    }

    // Validate dates
    if (type === 'date') {
      let dateType = 'general';
      if (name === 'birthdate') dateType = 'birthdate';
      else if (name.includes('hire_date')) dateType = 'hire_date';
      else if (name.includes('graduation_date')) dateType = 'graduation_date';
      
      if (value) {
        const validation = validateDate(value, dateType);
        if (!validation.isValid) {
          setError(validation.message);
          return;
        }
        setError('');
      } else {
        setError('');
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocationChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (name, value) => {
    // Ensure value is always an array
    const arrayValue = Array.isArray(value) ? value : [];
    setFormData(prev => ({
      ...prev,
      [name]: arrayValue
    }));
  };

  const handleEmploymentChange = (idx, field, value) => {
    if (field === 'hire_date') {
      const validation = validateDate(value, 'hire_date');
      if (!validation.isValid) {
        setError(validation.message);
        return;
      }
      setError('');
    }

    const newEmployment = [...formData.employment];
    newEmployment[idx] = { ...newEmployment[idx], [field]: value };
    setFormData({ ...formData, employment: newEmployment });
  };

  const handleAcademicChange = (idx, field, value) => {
    if (field === 'graduation_date') {
      const validation = validateDate(value, 'graduation_date');
      if (!validation.isValid) {
        setError(validation.message);
        return;
      }
      setError('');
    }

    const newAcademic = [...formData.academic_profile];
    newAcademic[idx] = { ...newAcademic[idx], [field]: value };
    setFormData({ ...formData, academic_profile: newAcademic });
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
    
    // Validate phone number on submit
    if (formData.contact_number) {
      const validation = validatePhoneNumber(formData.contact_number, false);
      if (!validation.isValid) {
        setError(validation.message);
        setLoading(false);
        return;
      }
    }

    try {
      // Prepare the data for submission
      const dataToSubmit = {
        ...formData,
        // Ensure skills is properly formatted as an array
        skills: Array.isArray(formData.skills) ? formData.skills : [],
        // Ensure preferred_industries is properly formatted as an array
        preferred_industries: Array.isArray(formData.preferred_industries) ? formData.preferred_industries : []
      };

      // Update the main profile data
      await api.updateUserProfile(user.id, dataToSubmit);
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
      setError(validation.message);
    } else {
      setError('');
    }
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      contact_number: formattedValue
    }));
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
                <div className="relative">
                  <input
                    type="date"
                    id="user-birthdate"
                    name="birthdate"
                    value={formData.birthdate ?? ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                    autoComplete="bday"
                  />
                  {formData.birthdate && (
                    <span className="text-sm text-gray-600 mt-1 block">
                      {formatDisplayDate(formData.birthdate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="user-location" className="block text-sm font-medium text-black mb-1">Address</label>
                <PhilippinesLocationSelector
                  value={formData.location}
                  onChange={value => handleLocationChange('location', value)}
                  disabled={false}
                />
              </div>
              <div>
                <label htmlFor="user-contact_number" className="block text-sm font-medium text-black mb-1">Contact Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    id="user-contact_number"
                    name="contact_number"
                    value={formData.contact_number ?? ''}
                    onChange={handlePhoneInput}
                    placeholder="+63XXXXXXXXXX"
                    className="w-full p-2 bg-[#e7e7e7] text-black border border-slate-200 rounded-full focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none placeholder:text-black font-medium"
                    autoComplete="tel"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">Format: +63XXXXXXXXXX</span>
                  {error && error.includes('phone') && (
                    <span className="text-xs text-red-500 mt-1 block">{error}</span>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="user-is_founder" className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="user-is_founder"
                    name="is_founder"
                    checked={formData.is_founder ?? false}
                    onChange={handleChange}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-black font-medium">Are you a founder?</span>
                </label>
                <span className="text-xs text-gray-500 mt-1 block ml-8">Check this if you are a startup founder or co-founder</span>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col flex-1 justify-between h-full">
            <h3 className="text-2xl font-bold text-[#F04F06] mb-6">Professional Background</h3>
            <div className="flex flex-col gap-y-8 flex-1 justify-evenly">
              <div>
                <label htmlFor="user-employment" className="block text-lg font-medium text-black mb-3">Employment History</label>
                <div className="space-y-6">
                  {formData.employment?.map((emp, idx) => (
                    <div key={idx} className="bg-[#e7e7e7] p-6 rounded-xl">
                      <div className="grid grid-cols-3 gap-6 mb-4">
                        <input
                          type="text"
                          value={emp.company || ''}
                          onChange={e => handleEmploymentChange(idx, 'company', e.target.value)}
                          placeholder="Company Name"
                          className="w-full p-3 bg-white text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none text-base"
                        />
                        <input
                          type="text"
                          value={emp.title || ''}
                          onChange={e => handleEmploymentChange(idx, 'title', e.target.value)}
                          placeholder="Job Title"
                          className="w-full p-3 bg-white text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none text-base"
                        />
                        <input
                          type="text"
                          value={emp.industry || ''}
                          onChange={e => handleEmploymentChange(idx, 'industry', e.target.value)}
                          placeholder="Industry"
                          className="w-full p-3 bg-white text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none text-base"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          <div>
                            <label htmlFor={`employment-date-${idx}`} className="block text-sm font-medium text-black mb-1">Date Started</label>
                            <input
                              id={`employment-date-${idx}`}
                              type="date"
                              value={emp.hire_date || ''}
                              onChange={e => handleEmploymentChange(idx, 'hire_date', e.target.value)}
                              className="p-3 bg-white text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none text-base"
                            />
                          </div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={emp.is_current || false}
                              onChange={e => {
                                const newEmployment = [...formData.employment];
                                newEmployment[idx] = { ...newEmployment[idx], is_current: e.target.checked };
                                setFormData({ ...formData, employment: newEmployment });
                              }}
                              className="w-5 h-5 rounded text-[#FF7A1A] focus:ring-[#FF7A1A]"
                            />
                            <span className="text-base font-medium">Current Position</span>
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newEmployment = formData.employment.filter((_, i) => i !== idx);
                            setFormData({ ...formData, employment: newEmployment });
                          }}
                          className="text-red-500 text-base hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newEmployment = [...(formData.employment || []), {
                        company: '',
                        title: '',
                        industry: '',
                        hire_date: '',
                        is_current: false
                      }];
                      setFormData({ ...formData, employment: newEmployment });
                    }}
                    className="w-full p-3 bg-[#FF7A1A] text-white rounded-xl hover:bg-[#FFB26B] transition-colors text-base font-semibold"
                  >
                    Add Employment
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="user-education" className="block text-lg font-medium text-black mb-3">Education</label>
                <div className="space-y-6">
                  {formData.academic_profile?.map((edu, idx) => (
                    <div key={idx} className="bg-[#e7e7e7] p-6 rounded-xl">
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        <input
                          type="text"
                          value={edu.level || ''}
                          onChange={e => handleAcademicChange(idx, 'level', e.target.value)}
                          placeholder="Education Level"
                          className="w-full p-3 bg-white text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none text-base"
                        />
                        <input
                          type="text"
                          value={edu.course || ''}
                          onChange={e => handleAcademicChange(idx, 'course', e.target.value)}
                          placeholder="Course/Program"
                          className="w-full p-3 bg-white text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none text-base"
                        />
                      </div>
                      <div className="mb-4">
                        <input
                          type="text"
                          value={edu.institution || ''}
                          onChange={e => handleAcademicChange(idx, 'institution', e.target.value)}
                          placeholder="Institution Name"
                          className="w-full p-3 bg-white text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none text-base"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label htmlFor={`education-date-${idx}`} className="block text-sm font-medium text-black mb-1">Graduation Date</label>
                          <input
                            id={`education-date-${idx}`}
                            type="date"
                            value={edu.graduation_date || ''}
                            onChange={e => handleAcademicChange(idx, 'graduation_date', e.target.value)}
                            className="p-3 bg-white text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none text-base"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newEducation = formData.academic_profile.filter((_, i) => i !== idx);
                            setFormData({ ...formData, academic_profile: newEducation });
                          }}
                          className="text-red-500 text-base hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newEducation = [...(formData.academic_profile || []), {
                        level: '',
                        course: '',
                        institution: '',
                        graduation_date: ''
                      }];
                      setFormData({ ...formData, academic_profile: newEducation });
                    }}
                    className="w-full p-3 bg-[#FF7A1A] text-white rounded-xl hover:bg-[#FFB26B] transition-colors text-base font-semibold"
                  >
                    Add Education
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="user-accomplishments" className="block text-lg font-medium text-black mb-3">Accomplishments</label>
                <div className="space-y-6">
                  {formData.accomplishments?.map((acc, idx) => (
                    <div key={idx} className="bg-[#e7e7e7] p-6 rounded-xl">
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        <input
                          type="text"
                          value={acc.title || ''}
                          onChange={e => {
                            const newAccomplishments = [...formData.accomplishments];
                            newAccomplishments[idx] = { ...newAccomplishments[idx], title: e.target.value };
                            setFormData({ ...formData, accomplishments: newAccomplishments });
                          }}
                          placeholder="Accomplishment Title"
                          className="w-full p-3 bg-white text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none text-base"
                        />
                        <input
                          type="date"
                          value={acc.date || ''}
                          onChange={e => {
                            const newAccomplishments = [...formData.accomplishments];
                            newAccomplishments[idx] = { ...newAccomplishments[idx], date: e.target.value };
                            setFormData({ ...formData, accomplishments: newAccomplishments });
                          }}
                          className="w-full p-3 bg-white text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none text-base"
                        />
                      </div>
                      <div className="mb-4">
                        <textarea
                          value={acc.description || ''}
                          onChange={e => {
                            const newAccomplishments = [...formData.accomplishments];
                            newAccomplishments[idx] = { ...newAccomplishments[idx], description: e.target.value };
                            setFormData({ ...formData, accomplishments: newAccomplishments });
                          }}
                          placeholder="Description"
                          className="w-full p-3 bg-white text-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A1A] focus:outline-none text-base"
                          rows="3"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const newAccomplishments = formData.accomplishments.filter((_, i) => i !== idx);
                            setFormData({ ...formData, accomplishments: newAccomplishments });
                          }}
                          className="text-red-500 text-base hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newAccomplishments = [...(formData.accomplishments || []), {
                        title: '',
                        date: '',
                        description: ''
                      }];
                      setFormData({ ...formData, accomplishments: newAccomplishments });
                    }}
                    className="w-full p-3 bg-[#FF7A1A] text-white rounded-xl hover:bg-[#FFB26B] transition-colors text-base font-semibold"
                  >
                    Add Accomplishment
                  </button>
                </div>
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
            {!formData.is_founder ? (
              <div className="flex flex-col flex-1 justify-center items-center text-center">
                <div className="text-gray-500 text-lg mb-4">
                  <i className="fas fa-info-circle text-orange-500 text-2xl mb-2"></i>
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Matchmaking Preferences Skipped</h4>
                <p className="text-gray-600">
                  Since you're not a founder, we've skipped the matchmaking preferences section. You can always update your preferences later in your profile settings.
                </p>
              </div>
            ) : (
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
                <PhilippinesLocationSelector
                  value={formData.preferred_location}
                  onChange={value => handleLocationChange('preferred_location', value)}
                  disabled={false}
                />
              </div>
            </div>
            )}
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
      <div className="bg-white rounded-none md:rounded-3xl shadow-xl w-full h-full md:w-full md:max-w-[1200px] md:h-[700px] animate-fadeIn flex flex-col md:flex-row border-0 md:border-2 border-slate-200 overflow-hidden">
        {/* Stepper Sidebar */}
        <div className="w-full md:w-72 bg-slate-100 md:rounded-l-3xl py-4 px-4 flex flex-col items-center md:items-start h-auto md:h-full shadow-lg border-b md:border-r md:border-b-0 border-slate-200">
          <h2 className="text-2xl font-extrabold mb-6 text-[#F04F06] tracking-wide px-2 hidden md:block">Let us know you better</h2>
          <ul className="w-full flex flex-row items-center justify-center md:flex-col md:items-start md:space-y-8">
            {steps.map((s, idx) => (
              <li key={s.label} className="flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-4 px-1 md:px-2 text-center md:text-left">
                <span className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 text-sm md:text-base font-bold transition-all duration-200 
                  ${step === idx ? 'bg-[#FF7A1A] border-[#FF7A1A] text-white shadow-lg' : step > idx ? 'bg-[#FFB26B] border-[#FFB26B] text-[#FF7A1A]' : 'bg-slate-200 border-slate-200 text-slate-400'}`}>{idx + 1}</span>
                <span className={`text-xs md:text-base transition-all duration-200 ${step === idx ? 'font-bold text-[#FF7A1A]' : step > idx ? 'text-[#FF7A1A]' : 'text-slate-400'}`}>{s.label}</span>
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
            <div className="bg-slate-50 rounded-2xl shadow p-6 md:p-8 mb-6 border border-slate-200">
              {renderStep()}
            </div>
          </div>
          <div className="sticky bottom-0 left-0 right-0 bg-white pt-5 border-t border-slate-200 z-10 flex justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF7A1A] text-base
                ${step === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white text-[#FF7A1A] border border-[#FF7A1A] hover:bg-[#FFB26B] hover:text-[#FF7A1A]'}`}
              disabled={step === 0}
            >
              Previous
            </button>
            <div className="flex gap-3">
              {step === steps.length - 1 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-6 py-2.5 rounded-full text-[#FF7A1A] bg-white border border-[#FF7A1A] hover:bg-[#FFB26B] hover:text-[#FF7A1A] font-semibold transition-all duration-200 shadow-md text-base"
                >
                  Skip for now
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#FF7A1A] text-white rounded-full font-bold shadow-lg hover:bg-[#FFB26B] hover:text-[#FF7A1A] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A1A] disabled:opacity-50 text-base"
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