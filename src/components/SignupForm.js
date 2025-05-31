import React, { useState } from "react";
import { FaGoogle, FaFacebookF, FaMicrosoft } from "react-icons/fa";

export default function SignupForm({ authTab, setAuthTab, onAuthSuccess }) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const saveSignupInfo = (name, email, password) => {
    // For demo: hash password with btoa (not secure for real use)
    const userInfo = {
      name,
      email,
      password: btoa(password),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('taraki-signup-user', JSON.stringify(userInfo));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    saveSignupInfo(name, email, password);
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
        maxWidth: '400px', // Match login modal size
        minWidth: '320px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div>
        {/* Auth Tab Switcher */}
        <div className={`transition-opacity duration-500 ${authTab === 'signup' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'} w-full`}> 
          <h2 className="text-xl font-bold mb-4 text-center animate-slideInFromTop">Sign up</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                document.documentElement.classList.contains('dark')
                  ? 'bg-[#232323] text-white border-gray-600'
                  : 'bg-white text-orange-600 border-orange-400'
              }`}
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
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
            {/* Remove confirm password field */}
            {passwordError && (
              <div className="text-red-500 text-xs text-center animate-pulse mt-1">{passwordError}</div>
            )}
            <div className="flex items-start mt-2">
              <input type="checkbox" required className="mt-1 mr-2" id="terms" />
              <label htmlFor="terms" className="text-xs text-gray-700 dark:text-black">
                I agree to the
                <button type="button" className="text-blue-600 hover:underline ml-1" onClick={() => setShowTerms(true)}>
                  Terms and Conditions
                </button>
              </label>
            </div>
            <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition mt-2">Sign up</button>
          </form>
          {/* Social signup icons only */}
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
        </div>
        <div className="text-center text-sm mt-4">
          Have an account?{' '}
          <button className="text-blue-600 hover:underline font-semibold" onClick={() => setAuthTab('login')}>Log in</button>
        </div>
        {/* Terms Modal */}
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white dark:bg-[#232323] rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-slideInFromTop">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-orange-600 text-2xl" onClick={() => setShowTerms(false)}>&times;</button>
              <h3 className="text-lg font-bold mb-2 text-center">Terms and Conditions</h3>
              <div className="h-64 overflow-y-auto text-sm text-gray-700 dark:text-gray-200 p-2 border rounded bg-gray-50 dark:bg-[#232323]">
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