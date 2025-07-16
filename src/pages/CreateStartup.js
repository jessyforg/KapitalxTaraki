import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { validatePhoneNumber } from '../utils/validation';

const industries = {
  Technology: [
    'Software Development', 'E-commerce', 'FinTech', 'EdTech', 'HealthTech', 'AI/ML', 'Cybersecurity', 'Cloud Computing', 'Digital Marketing', 'Mobile Apps'
  ],
  Healthcare: [
    'Medical Services', 'Healthcare Technology', 'Wellness & Fitness', 'Mental Health', 'Telemedicine', 'Medical Devices', 'Healthcare Analytics'
  ],
  Finance: [
    'Banking', 'Insurance', 'Investment', 'Financial Services', 'Payment Solutions', 'Cryptocurrency', 'Financial Planning'
  ],
  Education: [
    'Online Learning', 'Educational Technology', 'Skills Training', 'Language Learning', 'Professional Development', 'Educational Content'
  ],
  Retail: [
    'E-commerce', 'Fashion', 'Food & Beverage', 'Consumer Goods', 'Marketplace', 'Retail Technology'
  ],
  Manufacturing: [
    'Industrial Manufacturing', 'Clean Technology', '3D Printing', 'Supply Chain', 'Smart Manufacturing'
  ],
  Agriculture: [
    'AgTech', 'Organic Farming', 'Food Processing', 'Agricultural Services', 'Sustainable Agriculture'
  ],
  Transportation: [
    'Logistics', 'Ride-sharing', 'Delivery Services', 'Transportation Technology', 'Smart Mobility'
  ],
  'Real Estate': [
    'Property Technology', 'Real Estate Services', 'Property Management', 'Real Estate Investment', 'Smart Homes'
  ],
  Other: [
    'Social Impact', 'Environmental', 'Creative Industries', 'Sports & Entertainment', 'Other Services'
  ]
};

const locations = {
  'Cordillera Administrative Region (CAR)': [
    'Baguio City', 'Tabuk City', 'La Trinidad', 'Bangued', 'Lagawe', 'Bontoc'
  ]
};

const fundingStageOptions = [
  { value: 'pre_seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'series_c', label: 'Series C' },
  { value: 'late_stage', label: 'Late Stage' },
  { value: 'exit', label: 'Exit' }
];
const startupStageOptions = [
  { value: 'ideation', label: 'Ideation Stage' },
  { value: 'validation', label: 'Validation Stage' },
  { value: 'mvp', label: 'MVP Stage' },
  { value: 'growth', label: 'Growth Stage' },
  { value: 'maturity', label: 'Maturity Stage' }
];

const initialState = {
  name: '',
  industry: '',
  description: '',
  location: '',
  funding_needed: '',
  pitch_deck_url: '',
  business_plan_url: '',
  logo_url: '',
  video_url: '',
  funding_stage: '',
  website: '',
  startup_stage: '',
  // Add new fields
  full_address: '',
  telephone_number: '',
  facebook_url: '',
  twitter_url: '',
  linkedin_url: '',
  instagram_url: '',
  business_permit_url: '',
  sec_registration_url: '',
  // Add upload status fields
  uploading_business_permit: false,
  uploading_sec_doc: false,
};

const CreateStartup = () => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef();
  const businessPermitRef = useRef();
  const secDocRef = useRef();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate phone number during typing
    if (name === 'telephone_number') {
      const validation = validatePhoneNumber(value, true);
      if (!validation.isValid) {
        setError(validation.message);
        return;
      }
      setError('');
    }

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = async (e) => {
    setLogoError('');
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('logo', file);
      const res = await axios.post('/api/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      setForm(f => ({ ...f, logo_url: res.data.url }));
      setLogoPreview(URL.createObjectURL(file));
    } catch (err) {
      setLogoError('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF and image files (JPEG, PNG) are allowed');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB');
      return;
    }

    try {
      const uploadingField = docType === 'business_permit' ? 'uploading_business_permit' : 'uploading_sec_doc';
      const urlField = docType === 'business_permit' ? 'business_permit_url' : 'sec_registration_url';

      setForm(prev => ({ ...prev, [uploadingField]: true }));
      setError('');

      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', docType);

      const res = await axios.post('/api/upload-document', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setForm(prev => ({
        ...prev,
        [uploadingField]: false,
        [urlField]: res.data.url
      }));
    } catch (err) {
      setError(`Failed to upload ${docType.replace('_', ' ')}`);
      setForm(prev => ({ ...prev, [uploadingField]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number on submit
    if (form.telephone_number) {
      const validation = validatePhoneNumber(form.telephone_number, false);
      if (!validation.isValid) {
        setError(validation.message);
        return;
      }
    }

    setError('');
    if (!form.name || !form.industry) {
      setError('Name and industry are required.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/startups', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/entrepreneur-dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create startup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[95%] mx-auto pt-24 pb-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Startup</h2>
            <button 
              type="button" 
              onClick={() => navigate('/entrepreneur-dashboard')} 
              className="text-orange-500 hover:text-orange-600 font-semibold px-4 py-2 rounded transition flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i> Back
            </button>
          </div>

          {/* Logo Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-2">
              {logoPreview || form.logo_url ? (
                <img 
                  src={logoPreview || form.logo_url} 
                  alt="Logo Preview" 
                  className="w-24 h-24 object-contain rounded-full border-4 border-orange-500 bg-white" 
                />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center rounded-full bg-orange-50 text-orange-500 text-4xl font-bold border-4 border-orange-200">
                  <i className="fas fa-image"></i>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleLogoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold shadow flex items-center gap-2 transition-colors"
              disabled={uploadingLogo}
            >
              <i className="fas fa-upload"></i>
              {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
            </button>
            {logoError && <div className="text-red-500 mt-2">{logoError}</div>}
          </div>

          {error && <div className="mb-4 text-red-500 font-semibold bg-red-50 p-3 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-building mr-2 text-orange-500"></i>Startup Name <span className="text-orange-500">*</span>
              </label>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                required 
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-industry mr-2 text-orange-500"></i>Industry <span className="text-orange-500">*</span>
              </label>
              <select 
                name="industry" 
                value={form.industry} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                required
              >
                <option value="">Select Industry</option>
                {Object.entries(industries).map(([category, subs]) => (
                  <optgroup key={category} label={category}>
                    {subs.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-chart-line mr-2 text-orange-500"></i>Funding Stage
              </label>
              <select 
                name="funding_stage" 
                value={form.funding_stage} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select Funding Stage</option>
                {fundingStageOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-rocket mr-2 text-orange-500"></i>Startup Stage
              </label>
              <select 
                name="startup_stage" 
                value={form.startup_stage} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select Startup Stage</option>
                {startupStageOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-align-left mr-2 text-orange-500"></i>Description
              </label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                rows={3} 
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-map-marker-alt mr-2 text-orange-500"></i>Location
              </label>
              <select 
                name="location" 
                value={form.location} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select Location</option>
                {Object.entries(locations).map(([region, cities]) => (
                  <optgroup key={region} label={region}>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-globe mr-2 text-orange-500"></i>Website
              </label>
              <input 
                name="website" 
                value={form.website} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-file-powerpoint mr-2 text-orange-500"></i>Pitch Deck URL
              </label>
              <input 
                name="pitch_deck_url" 
                value={form.pitch_deck_url} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-file-pdf mr-2 text-orange-500"></i>Business Plan URL
              </label>
              <input 
                name="business_plan_url" 
                value={form.business_plan_url} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-video mr-2 text-orange-500"></i>Video URL
              </label>
              <input 
                name="video_url" 
                value={form.video_url} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-map-marked-alt mr-2 text-orange-500"></i>Full Address
              </label>
              <textarea 
                name="full_address" 
                value={form.full_address} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={2}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fas fa-phone mr-2 text-orange-500"></i>Telephone Number
              </label>
              <input 
                name="telephone_number" 
                value={form.telephone_number} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
              />
            </div>

            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg text-gray-700 mb-4">
                <i className="fas fa-share-alt mr-2 text-orange-500"></i>Social Media Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">
                    <i className="fab fa-facebook mr-2 text-blue-600"></i>Facebook
                  </label>
                  <input 
                    name="facebook_url" 
                    value={form.facebook_url} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">
                    <i className="fab fa-twitter mr-2 text-blue-400"></i>Twitter
                  </label>
                  <input 
                    name="twitter_url" 
                    value={form.twitter_url} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">
                    <i className="fab fa-linkedin mr-2 text-blue-700"></i>LinkedIn
                  </label>
                  <input 
                    name="linkedin_url" 
                    value={form.linkedin_url} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">
                    <i className="fab fa-instagram mr-2 text-pink-600"></i>Instagram
                  </label>
                  <input 
                    name="instagram_url" 
                    value={form.instagram_url} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg text-gray-700 mb-4">
                <i className="fas fa-file-alt mr-2 text-orange-500"></i>Verification Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Business Permit Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block font-semibold mb-2 text-gray-700">
                    <i className="fas fa-certificate mr-2 text-green-600"></i>Business Permit
                  </label>
                  
                  {/* URL Input */}
                  <input 
                    name="business_permit_url" 
                    value={form.business_permit_url} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-3" 
                    placeholder="Enter document URL"
                  />
                  
                  {/* File Upload Section */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">OR</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      ref={businessPermitRef}
                      onChange={(e) => handleDocumentUpload(e, 'business_permit')}
                    />
                    <button
                      type="button"
                      onClick={() => businessPermitRef.current?.click()}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      disabled={form.uploading_business_permit}
                    >
                      <i className="fas fa-upload"></i>
                      {form.uploading_business_permit ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                </div>

                {/* SEC Registration Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block font-semibold mb-2 text-gray-700">
                    <i className="fas fa-building mr-2 text-blue-600"></i>SEC Registration
                  </label>
                  
                  {/* URL Input */}
                  <input 
                    name="sec_registration_url" 
                    value={form.sec_registration_url} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-3" 
                    placeholder="Enter document URL"
                  />
                  
                  {/* File Upload Section */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">OR</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      ref={secDocRef}
                      onChange={(e) => handleDocumentUpload(e, 'sec_registration')}
                    />
                    <button
                      type="button"
                      onClick={() => secDocRef.current?.click()}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      disabled={form.uploading_sec_doc}
                    >
                      <i className="fas fa-upload"></i>
                      {form.uploading_sec_doc ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Document Guidelines */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <h4 className="font-semibold mb-2">Document Guidelines:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Accepted formats: PDF, JPEG, PNG</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Documents must be clear and legible</li>
                  <li>You can either provide a URL to your document or upload the file directly</li>
                </ul>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="mt-10 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-lg shadow transition-colors" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Startup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStartup; 