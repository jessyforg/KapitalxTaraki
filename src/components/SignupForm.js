import React, { useState } from "react";
import { FaGoogle, FaFacebookF, FaMicrosoft } from "react-icons/fa";
import api from '../services/api';
import UserDetailsModal from './UserDetailsModal';

export default function SignupForm({ authTab, setAuthTab, onAuthSuccess }) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordError("");

    // Validate password
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    if (password !== retypePassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (!role) {
      setError("Please select a role");
      return;
    }

    setLoading(true);

    try {
      const response = await api.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role
      });

      // Store token and user data
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        // Fetch full user profile
        const fullUser = await api.getUserProfile(response.user.id);
        localStorage.setItem('user', JSON.stringify(fullUser));
        setRegisteredUser(fullUser);
        setShowUserDetails(true);
        setVerificationSent(true);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserDetailsComplete = () => {
    setShowUserDetails(false);
    if (onAuthSuccess) onAuthSuccess();
  };

  if (showUserDetails && registeredUser) {
    return (
      <UserDetailsModal
        user={registeredUser}
        onClose={() => setShowUserDetails(false)}
        onComplete={handleUserDetailsComplete}
      />
    );
  }

  if (verificationSent) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md animate-fadeIn">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">Verify Your Email</h2>
          <p className="text-center text-gray-600 mb-4">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>
          <button
            onClick={() => setVerificationSent(false)}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold text-lg shadow mt-2"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md animate-fadeIn">
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
        <h2 className="text-2xl font-bold mb-4 text-center text-black">Sign up</h2>
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              className="w-1/2 p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black placeholder-gray-400"
              type="text"
              placeholder="First Name"
              required
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
            <input
              className="w-1/2 p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black placeholder-gray-400"
              type="text"
              placeholder="Last Name"
              required
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>
          <input
            className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black placeholder-gray-400"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black placeholder-gray-400"
              placeholder="Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
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
          <input
            className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black placeholder-gray-400"
            type="password"
            placeholder="Retype Password"
            required
            value={retypePassword}
            onChange={e => setRetypePassword(e.target.value)}
          />
          {passwordError && (
            <div className="text-red-500 text-xs text-center animate-pulse mt-1">{passwordError}</div>
          )}
          <select
            className="w-full p-3 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black placeholder-gray-400"
            required
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="entrepreneur">Entrepreneur</option>
            <option value="investor">Investor</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex items-start mt-2">
            <input type="checkbox" required className="mt-1 mr-2" id="terms" />
            <label htmlFor="terms" className="text-xs text-black select-none">
              I agree to the
              <button type="button" className="text-blue-600 hover:underline ml-1" onClick={() => setShowTerms(true)}>
                Terms and Conditions
              </button>
            </label>
          </div>
          <button 
            type="submit" 
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold text-lg shadow mt-2"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
        <div className="flex flex-row gap-4 justify-center mt-6 mb-2">
          <button className="rounded-full p-3 bg-orange-50 hover:bg-orange-100 transition shadow text-orange-500 border border-orange-200" aria-label="Sign up with Google">
            <FaGoogle size={28} className="text-orange-500" />
          </button>
          <button className="rounded-full p-3 bg-orange-50 hover:bg-orange-100 transition shadow text-orange-500 border border-orange-200" aria-label="Sign up with Facebook">
            <FaFacebookF size={28} className="text-orange-500" />
          </button>
          <button className="rounded-full p-3 bg-orange-50 hover:bg-orange-100 transition shadow text-orange-500 border border-orange-200" aria-label="Sign up with Microsoft">
            <FaMicrosoft size={28} className="text-orange-500" />
          </button>
        </div>
        <div className="text-center text-sm mt-6 text-black">
          Have an account?{' '}
          <button className="text-orange-600 hover:underline font-semibold" onClick={() => setAuthTab('login')}>Log in</button>
        </div>
        {/* Terms Modal */}
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-slideInFromTop">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-orange-600 text-2xl" onClick={() => setShowTerms(false)}>&times;</button>
              <h3 className="text-lg font-bold mb-2 text-center">Terms and Conditions</h3>
              <div className="h-64 overflow-y-auto text-sm text-gray-700 p-2 border rounded bg-gray-50">
                <p>Welcome to TARAKI! By creating an account, you agree to abide by our community guidelines and policies. Please review the following terms carefully:</p>
                <ul className="list-disc ml-5 mt-2">
                  <li>Respect all members and maintain a positive environment.</li>
                  <li>Do not share your account credentials with others.</li>
                  <li>Use the platform for its intended purposes only.</li>
                  <li>Violation of these terms may result in account suspension.</li>
                </ul>
                <p className="mt-2">For the full terms, visit our website or contact support.</p>
              </div>
              <div className="flex justify-center mt-4">
                <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition" onClick={() => setShowTerms(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}