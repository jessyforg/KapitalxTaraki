import React, { useState } from 'react';
import api from '../services/api';

const RoleSelectionModal = ({ user, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://taraki-production.up.railway.app/api'
        : 'http://localhost:5000/api';
      
      const token = localStorage.getItem('token');
      
      // Set user role (this will update role and insert into appropriate table)
      const roleResponse = await fetch(`${API_BASE_URL}/users/${user.id}/set-role`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: selectedRole })
      });

      if (!roleResponse.ok) {
        const errorData = await roleResponse.json();
        throw new Error(errorData.error || 'Failed to set role');
      }

      // Update local storage
      const updatedUser = { ...user, role: selectedRole };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Call callback with updated user
      onRoleSelected(updatedUser);
    } catch (err) {
      setError(err.message || 'Failed to set role. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md animate-fadeIn">
        <h2 className="text-2xl font-bold mb-4 text-center text-black">Select Your Role</h2>
        <p className="text-gray-600 text-center mb-6">
          Please select whether you are an entrepreneur or an investor
        </p>
        
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
              <input
                type="radio"
                name="role"
                value="entrepreneur"
                checked={selectedRole === 'entrepreneur'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mr-3 w-5 h-5 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <div className="font-semibold text-black">Entrepreneur</div>
                <div className="text-sm text-gray-600">I want to start or grow my business</div>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
              <input
                type="radio"
                name="role"
                value="investor"
                checked={selectedRole === 'investor'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mr-3 w-5 h-5 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <div className="font-semibold text-black">Investor</div>
                <div className="text-sm text-gray-600">I want to invest in startups</div>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedRole}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-semibold text-lg shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleSelectionModal;

