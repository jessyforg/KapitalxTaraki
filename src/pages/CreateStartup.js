import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

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
  'National Capital Region (NCR)': [
    'Manila', 'Quezon City', 'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 'Pateros', 'San Juan', 'Taguig', 'Valenzuela'
  ],
  'Cordillera Administrative Region (CAR)': [
    'Baguio City', 'Tabuk City', 'La Trinidad', 'Bangued', 'Lagawe', 'Bontoc'
  ],
  'Ilocos Region (Region I)': [
    'San Fernando City', 'Laoag City', 'Vigan City', 'Dagupan City', 'San Carlos City', 'Urdaneta City'
  ],
  'Cagayan Valley (Region II)': [
    'Tuguegarao City', 'Cauayan City', 'Santiago City', 'Ilagan City'
  ],
  'Central Luzon (Region III)': [
    'San Fernando City', 'Angeles City', 'Olongapo City', 'Malolos City', 'Cabanatuan City', 'San Jose City', 'Science City of Muñoz', 'Palayan City'
  ],
  'CALABARZON (Region IV-A)': [
    'Calamba City', 'San Pablo City', 'Antipolo City', 'Batangas City', 'Cavite City', 'Lipa City', 'San Pedro', 'Santa Rosa', 'Tagaytay City', 'Trece Martires City'
  ],
  'MIMAROPA (Region IV-B)': [
    'Calapan City', 'Puerto Princesa City', 'San Jose', 'Romblon'
  ],
  'Bicol Region (Region V)': [
    'Legazpi City', 'Naga City', 'Iriga City', 'Tabaco City', 'Sorsogon City', 'Ligao City'
  ],
  'Western Visayas (Region VI)': [
    'Iloilo City', 'Bacolod City', 'Roxas City', 'San Carlos City', 'Silay City', 'Talisay City'
  ],
  'Central Visayas (Region VII)': [
    'Cebu City', 'Mandaue City', 'Lapu-Lapu City', 'Talisay City', 'Danao City', 'Bogo City'
  ],
  'Eastern Visayas (Region VIII)': [
    'Tacloban City', 'Ormoc City', 'Calbayog City', 'Baybay City', 'Maasin City', 'Catbalogan City'
  ],
  'Zamboanga Peninsula (Region IX)': [
    'Zamboanga City', 'Dipolog City', 'Pagadian City', 'Isabela City'
  ],
  'Northern Mindanao (Region X)': [
    'Cagayan de Oro City', 'Iligan City', 'Oroquieta City', 'Ozamiz City', 'Tangub City', 'Gingoog City'
  ],
  'Davao Region (Region XI)': [
    'Davao City', 'Digos City', 'Tagum City', 'Panabo City', 'Samal City', 'Mati City'
  ],
  'SOCCSKSARGEN (Region XII)': [
    'General Santos City', 'Koronadal City', 'Tacurong City', 'Kidapawan City'
  ],
  'Caraga (Region XIII)': [
    'Butuan City', 'Surigao City', 'Bislig City', 'Tandag City', 'Bayugan City', 'Cabadbaran City'
  ],
  'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)': [
    'Cotabato City', 'Marawi City', 'Lamitan City'
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
};

const CreateStartup = () => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
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

  const handleSubmit = async e => {
    e.preventDefault();
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