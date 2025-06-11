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
      <div className="max-w-[95%] mx-auto pt-24 pb-12">
        <button onClick={() => navigate(-1)} className="mb-6 text-orange-600 hover:underline flex items-center gap-2"><i className="fas fa-arrow-left"></i> Back</button>
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full border-4 border-orange-500 flex items-center justify-center overflow-hidden bg-white mb-4">
            {startup.logo_url ? (
              <img src={startup.logo_url} alt="Logo" className="object-contain w-full h-full" />
            ) : (
              <i className="fas fa-building text-4xl text-orange-500"></i>
            )}
          </div>
          <h1 className="text-3xl font-bold text-orange-600 mb-2">{startup.name}</h1>
          <div className="text-gray-700 font-semibold mb-1">Industry: <span className="font-normal">{startup.industry}</span></div>
          <div className="text-gray-700 font-semibold mb-1">Funding Stage: <span className="font-normal">{startup.funding_stage}</span></div>
          <div className="text-gray-700 font-semibold mb-1">Startup Stage: <span className="font-normal">{startup.startup_stage}</span></div>
        </div>
        <div className="mb-6">
          <div className="text-gray-800 font-semibold mb-1">Description:</div>
          <div className="text-gray-700 whitespace-pre-line text-lg">{startup.description}</div>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-800">Location:</span> <span className="text-gray-700">{startup.location}</span>
        </div>
        {startup.website && (
          <div className="mb-2">
            <span className="font-semibold text-gray-800">Website:</span> <a href={startup.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{startup.website}</a>
          </div>
        )}
        {startup.pitch_deck_url && (
          <div className="mb-2">
            <span className="font-semibold text-gray-800">Pitch Deck:</span> <a href={startup.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{startup.pitch_deck_url}</a>
          </div>
        )}
        {startup.business_plan_url && (
          <div className="mb-2">
            <span className="font-semibold text-gray-800">Business Plan:</span> <a href={startup.business_plan_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{startup.business_plan_url}</a>
          </div>
        )}
      </div>
    </div>
  );
} 