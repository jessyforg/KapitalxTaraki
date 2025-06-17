import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { FaGoogle, FaFacebookF, FaMicrosoft } from 'react-icons/fa';
import api from '../services/api';

const LoginForm = ({ authTab, setAuthTab, onAuthSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await api.login(formData);
      if (response.token) {
        localStorage.setItem('token', response.token);
        // Fetch full user profile
        const fullUser = await api.getUserProfile(response.user.id);
        localStorage.setItem('user', JSON.stringify(fullUser));
        setSuccess('Login successful!');
        if (onAuthSuccess) onAuthSuccess();
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md animate-fadeIn relative">
        {onClose && (
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-orange-600 text-2xl"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        )}
        <div className="flex justify-between mb-6">
          <button
            className={`flex-1 py-2 text-lg font-semibold transition-colors duration-200 ${authTab === 'login' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
            onClick={() => setAuthTab('login')}
          >
            Log in
          </button>
          <button
            className={`flex-1 py-2 text-lg font-semibold transition-colors duration-200 ${authTab === 'signup' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
            onClick={() => setAuthTab('signup')}
          >
            Sign up
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center text-black">Log in</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black placeholder-gray-400"
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <div className="relative">
            <input
              className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black placeholder-gray-400"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-orange-500"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 002.25 12s3.75 7.5 9.75 7.5c1.956 0 3.693-.377 5.18-1.01M6.228 6.228A10.45 10.45 0 0112 4.5c6 0 9.75 7.5 9.75 7.5a10.46 10.46 0 01-4.293 4.774M6.228 6.228l11.544 11.544M6.228 6.228L3 3m15 15l-3-3" />
                </svg>
              )}
            </span>
          </div>
          {error && (
            <div className="text-red-500 text-xs text-center animate-pulse mt-1">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-xs text-center animate-pulse mt-1">{success}</div>
          )}
          <div className="flex items-center mb-2">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-orange-300 rounded mr-2"
            />
            <label htmlFor="remember-me" className="text-xs text-black select-none">
              Remember me
            </label>
            <div className="ml-auto text-xs">
              <a href="#" className="text-orange-500 hover:underline">Forgot your password?</a>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold text-lg shadow"
          >
            Log in
          </button>
        </form>
        <div className="flex flex-row gap-4 justify-center mt-6">
          <button className="rounded-full p-3 bg-orange-50 hover:bg-orange-100 transition shadow text-orange-500 border border-orange-200">
            <FaGoogle size={28} className="text-orange-500" />
          </button>
          <button className="rounded-full p-3 bg-orange-50 hover:bg-orange-100 transition shadow text-orange-500 border border-orange-200">
            <FaFacebookF size={28} className="text-orange-500" />
          </button>
          <button className="rounded-full p-3 bg-orange-50 hover:bg-orange-100 transition shadow text-orange-500 border border-orange-200">
            <FaMicrosoft size={28} className="text-orange-500" />
          </button>
        </div>
        <div className="text-center text-sm mt-6 text-black">
          Don&apos;t have an account?{' '}
          <button className="text-orange-600 hover:underline font-semibold" onClick={() => setAuthTab('signup')}>Sign up</button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
