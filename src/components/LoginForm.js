import React, { useState } from "react";
import { FaGoogle, FaFacebookF, FaMicrosoft } from 'react-icons/fa';

export default function LoginForm({ authTab, setAuthTab, onAuthSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    // Get user from localStorage (demo only)
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('taraki-signup-user'));
    } catch (e) {
      setLoginError("Unable to access storage. Please check your browser settings.");
      return;
    }
    if (!user || user.email !== email) {
      setLoginError("Account does not exist. Please sign up first.");
      return;
    }
    if (user.password !== btoa(password)) {
      setLoginError("Incorrect password. Please try again.");
      return;
    }
    setLoginError("");
    if (onAuthSuccess) onAuthSuccess();
  };

  return (
    <div
      className={
        'w-full max-w-md mx-auto rounded-lg shadow-lg p-8 transition-colors duration-300 animate-fadeIn ' +
        (document.documentElement.classList.contains('dark')
          ? 'bg-black text-white'
          : 'bg-white text-orange-600')
      }
      style={{
        backgroundColor: document.documentElement.classList.contains('dark') ? '#000' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#ff6600',
        maxWidth: '400px', // Set modal to medium size
        minWidth: '320px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div>
        <h2 className="text-xl font-bold mb-4 text-center animate-slideInFromTop">Log in</h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <input
            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              document.documentElement.classList.contains('dark')
                ? 'bg-[#232323] text-white border-gray-600'
                : 'bg-white text-orange-600 border-orange-400'
            }`}
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 rounded border border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-transparent text-inherit"
              placeholder="Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <span
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-orange-500 transition-transform duration-200 ${showPassword ? 'scale-110' : ''}`}
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // Eye open SVG
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                // Eye closed SVG
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 002.25 12s3.75 7.5 9.75 7.5c1.956 0 3.693-.377 5.18-1.01M6.228 6.228A10.45 10.45 0 0112 4.5c6 0 9.75 7.5 9.75 7.5a10.46 10.46 0 01-4.293 4.774M6.228 6.228l11.544 11.544M6.228 6.228L3 3m15 15l-3-3" />
                </svg>
              )}
            </span>
          </div>
          {loginError && (
            <div className="text-red-500 text-xs text-center animate-pulse mt-1">{loginError}</div>
          )}
          <a href="#" className="block text-xs text-blue-600 mt-1 mb-2 hover:underline text-left">Forgot your password?</a>
          <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition">Log in</button>
        </form>
        {/* Social Login Icons Only */}
        <div className="flex flex-row gap-4 justify-center mt-4">
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
        <div className="text-center text-sm mt-4">
          No account?{' '}
          <button className="text-blue-600 hover:underline font-semibold" onClick={() => setAuthTab('signup')}>Sign up</button>
        </div>
      </div>
    </div>
  );
}
