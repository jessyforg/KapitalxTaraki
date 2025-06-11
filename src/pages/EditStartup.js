import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const fundingStages = [
  { value: 'pre_seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'series_c', label: 'Series C' },
  { value: 'late_stage', label: 'Late Stage' },
  { value: 'exit', label: 'Exit' },
];
const startupStages = [
  { value: 'ideation', label: 'Ideation Stage' },
  { value: 'validation', label: 'Validation Stage' },
  { value: 'mvp', label: 'MVP Stage' },
  { value: 'growth', label: 'Growth Stage' },
  { value: 'maturity', label: 'Maturity Stage' },
];

export default function EditStartup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', industry: '', description: '', location: '', website: '', pitch_deck_url: '', business_plan_url: '', funding_stage: '', startup_stage: '', logo_url: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/startups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setForm(res.data);
      } catch (err) {
        setError('Failed to fetch startup or not authorized.');
      } finally {
        setLoading(false);
      }
    };
    fetchStartup();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleLogoChange = e => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setForm(f => ({ ...f, logo_url: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'logo_url') formData.append(k, v || '');
      });
      if (logoFile) formData.append('logo', logoFile);
      await axios.put(`/api/startups/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Startup updated successfully!');
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update startup.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[95%] mx-auto pt-24 pb-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Edit Startup</h2>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="text-orange-500 hover:text-orange-600 font-semibold px-4 py-2 rounded transition flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i> Back
            </button>
          </div>
          <div className="flex flex-col items-center mb-8">
            <div className="mb-2">
              {form.logo_url ? (
                <img 
                  src={logoFile ? form.logo_url : form.logo_url} 
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
            >
              <i className="fas fa-upload"></i>
              Upload Logo
            </button>
          </div>
          {error && <div className="mb-4 text-red-500 font-semibold bg-red-50 p-3 rounded-lg">{error}</div>}
          {success && <div className="mb-4 text-green-600 font-semibold bg-green-50 p-3 rounded-lg">{success}</div>}
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
              <input 
                name="industry" 
                value={form.industry} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                required
              />
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
                {fundingStages.map(opt => (
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
                {startupStages.map(opt => (
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
              <input 
                name="location" 
                value={form.location} 
                onChange={handleChange} 
                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
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
          </div>
          <button 
            type="submit" 
            className="mt-10 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-lg shadow transition-colors" 
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
} 