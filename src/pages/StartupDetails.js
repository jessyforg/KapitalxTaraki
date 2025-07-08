import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function StartupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to convert string to title case with special handling for MVP
  const toTitleCase = (str) => {
    if (!str) return 'Not Provided';
    return str.split(' ')
      .map(word => {
        if (word.toLowerCase() === 'mvp') return 'MVP';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/startups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setStartup(res.data);
      } catch (err) {
        setError('Failed to fetch startup.');
      } finally {
        setLoading(false);
      }
    };
    fetchStartup();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!startup) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-24 pb-12">
        {/* Main Card: Two-column layout with description */}
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row items-stretch gap-8 border border-gray-200 mb-8 relative">
          {/* Logo */}
          <div className="flex flex-1 justify-center items-center min-w-[260px] min-h-[320px]">
            <div className="w-72 h-72 rounded-full border-4 border-orange-500 flex items-center justify-center overflow-hidden bg-white">
              {startup.logo_url ? (
                <img src={startup.logo_url} alt="Logo" className="object-contain w-full h-full" />
              ) : (
                <i className="fas fa-building text-7xl text-orange-500"></i>
              )}
            </div>
          </div>
          {/* Info and Description */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-col md:flex-row md:items-start md:gap-8">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-orange-600 mb-2">{startup.name || 'Not Provided'}</h1>
                <div className="text-gray-700 font-semibold mb-1">Industry: <span className="font-normal">{startup.industry || 'Not Provided'}</span></div>
                <div className="text-gray-700 font-semibold mb-1">Location: <span className="font-normal">{startup.location || 'Not Provided'}</span></div>
                <div className="text-gray-700 font-semibold mb-1">Funding Stage: <span className="font-normal">{startup.funding_stage || 'Not Provided'}</span></div>
                <div className="text-gray-700 font-semibold mb-4">Business Plan: <span className="font-normal">
                  {startup.business_plan_url ? (
                    <a href={startup.business_plan_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
                  ) : (
                    'Not Provided'
                  )}
                </span></div>
                {startup.website ? (
                  <a href={startup.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors">Visit Website</a>
                ) : (
                  <span className="mt-2 inline-block bg-gray-200 text-gray-500 font-semibold px-5 py-2 rounded-lg shadow">Website Not Provided</span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-gray-800 font-semibold mb-1">Description</div>
              <div className="text-gray-700 whitespace-pre-line text-lg">{startup.description || 'Not Provided'}</div>
            </div>
          </div>
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 right-8 bg-orange-100 text-orange-600 hover:bg-orange-200 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left text-sm"></i>
            Back
          </button>
        </div>
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow p-6 flex flex-col items-center">
            <div className="text-gray-500 text-sm mb-1">Funding Needed</div>
            <div className="text-2xl font-bold text-orange-600">{typeof startup.funding_needed === 'number' ? `₱${startup.funding_needed.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'Not Provided'}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow p-6 flex flex-col items-center">
            <div className="text-gray-500 text-sm mb-1">Startup Stage</div>
            <div className="text-xl font-semibold text-orange-600">{toTitleCase(startup.startup_stage)}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow p-6 flex flex-col items-center">
            <div className="text-gray-500 text-sm mb-1">Pitch Deck</div>
            {startup.pitch_deck_url ? (
              <a href={startup.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">View</a>
            ) : (
              <span className="text-gray-400">Not Provided</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 