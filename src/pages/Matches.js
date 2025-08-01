import React, { useState, useEffect } from 'react';
import { FaHandshake, FaEye, FaBuilding, FaUser, FaCalendarAlt, FaStar, FaMapMarkerAlt, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Dynamic API URL that works for both localhost and network access
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api'; // Server-side rendering fallback
  }
  
  const hostname = window.location.hostname;
  
  // Always point to the backend server on port 5000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // If accessing from network (e.g., 192.168.0.24:3000)
  // Point to the backend server on the same host but port 5000
  return `http://${hostname}:5000/api`;
};

const API_URL = getApiUrl();

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      let response;
      if (user.role === 'investor') {
        response = await axios.get(`${API_URL}/investor/matches`, { headers });
      } else if (user.role === 'entrepreneur') {
        response = await axios.get(`${API_URL}/matches?user_id=${user.id}&type=entrepreneur`, { headers });
      }
      
      const matchesData = response?.data || [];
      

      
      setMatches(matchesData);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClick = (match) => {
    if (user.role === 'investor') {
      // Navigate to startup details
      navigate(`/startup/${match.startup_id}`);
    } else {
      // Navigate to investor profile
      navigate(`/profile/${match.investor_id}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  const formatStartupStage = (stage) => {
    if (!stage) return 'Not specified';
    
    const stageMap = {
      'mvp': 'MVP',
      'idea': 'Ideation',
      'ideation': 'Ideation',
      'validation': 'Validation',
      'growth': 'Growth',
      'scaling': 'Scaling',
      'maturity': 'Maturity',
      'established': 'Established'
    };
    
    // Check if it's in our map first
    const normalized = stage.toLowerCase();
    if (stageMap[normalized]) {
      return stageMap[normalized];
    }
    
    // Otherwise, convert to title case
    return stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FaHandshake className="mr-3 text-orange-500" />
                My Matches
              </h1>
              <p className="mt-2 text-gray-600">
                {user?.role === 'investor' 
                  ? 'Discover promising startups that match your investment criteria'
                  : 'Connect with investors interested in your startup'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-500">{matches.length}</p>
              <p className="text-sm text-gray-500">Total Matches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {matches.length === 0 ? (
          <div className="text-center py-16">
            <FaHandshake className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-500 mb-6">
              {user?.role === 'investor' 
                ? "We'll notify you when we find startups that match your investment preferences."
                : "We'll notify you when investors show interest in your startup."
              }
            </p>
            <button
              onClick={() => navigate(user?.role === 'investor' ? '/investor-dashboard' : '/entrepreneur-dashboard')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <div
                key={match.match_id}
                onClick={() => handleMatchClick(match)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-orange-200"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {user?.role === 'investor' ? (
                        <FaBuilding className="text-blue-500 mr-2" />
                      ) : (
                        <FaUser className="text-green-500 mr-2" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {user?.role === 'investor' ? match.startup_name || match.name : match.investor_name || match.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {user?.role === 'investor' ? match.industry : 'Investor'}
                        </p>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </div>



                  {/* Details */}
                  <div className="space-y-2">
                    {user?.role === 'investor' ? (
                      <>
                        {match.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaMapMarkerAlt className="mr-2 text-gray-400" />
                            <span>{match.location}</span>
                          </div>
                        )}
                        {match.startup_stage && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaStar className="mr-2 text-gray-400" />
                            <span>{formatStartupStage(match.startup_stage)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {match.investment_range && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaDollarSign className="mr-2 text-gray-400" />
                            <span>Investment Range: {match.investment_range}</span>
                          </div>
                        )}
                        {match.preferred_industries && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaStar className="mr-2 text-gray-400" />
                            <span>Industries: {match.preferred_industries}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500 mt-3">
                      <FaCalendarAlt className="mr-2" />
                      <span>Matched on {formatDate(match.created_at)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {match.description && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {match.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 rounded-b-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Click to view {user?.role === 'investor' ? 'startup' : 'investor'} details
                    </span>
                    <div className="flex items-center text-orange-500">
                      <FaEye className="mr-1" />
                      <span className="text-xs font-medium">View Profile</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Matches; 