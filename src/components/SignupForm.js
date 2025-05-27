import React, { useState } from "react";

export default function SignupForm({ authTab, setAuthTab }) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className={`flex-1 flex flex-col justify-between px-8 py-8 md:py-10 bg-white dark:bg-[#232323] ${authTab === 'signup' ? 'md:bg-gray-50 dark:md:bg-[#232323] md:shadow-lg' : ''}`}>
      <div>
        <h2 className="text-xl font-bold mb-4 text-center">Sign up</h2>
        <form className="space-y-4">
          <input className="w-full p-2 border rounded dark:bg-[#232323] dark:text-white" type="text" placeholder="Full Name" required />
          <input className="w-full p-2 border rounded dark:bg-[#232323] dark:text-white" type="email" placeholder="Email" required />
          <input className="w-full p-2 border rounded dark:bg-[#232323] dark:text-white" type="password" placeholder="Password" required />
          <div className="flex items-start mt-2">
            <input type="checkbox" required className="mt-1 mr-2" id="terms" />
            <label htmlFor="terms" className="text-xs text-gray-700 dark:text-gray-300">
              I agree to the
              <button type="button" className="text-blue-600 hover:underline ml-1" onClick={() => setShowTerms(true)}>
                Terms and Conditions
              </button>
            </label>
          </div>
          <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition mt-2">Sign up</button>
        </form>
        {/* Social login buttons */}
        <div className="flex items-center justify-center gap-4 mt-6 mb-2">
          <button className="flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-full p-2 bg-white dark:bg-[#232323] hover:bg-gray-100 dark:hover:bg-[#232323] transition" aria-label="Sign up with Google">
            {/* Google SVG */}
            <svg width="28" height="28" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><g><path d="M44.5 20H24v8.5h11.7C34.9 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.9 0 5.6 1 7.7 2.7l6.3-6.3C34.6 5.5 29.6 3 24 3 12.9 3 4 11.9 4 24s8.9 21 20 21c11 0 20-8.9 20-21 0-1.3-.1-2.7-.4-4z" fill="#4285F4"/><path d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c2.9 0 5.6 1 7.7 2.7l6.3-6.3C34.6 5.5 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 10.7z" fill="#34A853"/><path d="M24 43c5.4 0 10.2-1.8 13.9-4.9l-6.7-5.5C29.4 36 24 36 24 36c-5.4 0-9.9-3.5-11.3-8.1l-6.6 5.1C9.6 38.6 16.3 43 24 43z" fill="#FBBC05"/><path d="M43.6 20.1H42V20H24v8h11.3C34.5 32.5 29.4 36 24 36c-5.4 0-9.9-3.5-11.3-8.1l-6.6 5.1C9.6 38.6 16.3 43 24 43c5.4 0 10.2-1.8 13.9-4.9l-6.7-5.5C29.4 36 24 36 24 36c-5.4 0-9.9-3.5-11.3-8.1l-6.6 5.1C9.6 38.6 16.3 43 24 43z" fill="#EA4335"/><path d="M44.5 20H24v8.5h11.7C34.9 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.9 0 5.6 1 7.7 2.7l6.3-6.3C34.6 5.5 29.6 3 24 3 12.9 3 4 11.9 4 24s8.9 21 20 21c11 0 20-8.9 20-21 0-1.3-.1-2.7-.4-4z" fill="none"/></g></svg>
          </button>
          <button className="flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-full p-2 bg-[#1877F3] hover:bg-[#145db2] text-white transition" aria-label="Sign up with Facebook">
            {/* Facebook SVG */}
            <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M29 0H3C1.343 0 0 1.343 0 3v26c0 1.657 1.343 3 3 3h13V20h-4v-5h4v-3.5C16 8.57 18.239 7 21.021 7c1.312 0 2.438.097 2.765.141v3.204h-1.898c-1.49 0-1.788.708-1.788 1.75V15h4.5l-.5 5h-4v12h7c1.657 0 3-1.343 3-3V3c0-1.657-1.343-3-3-3z"/></svg>
          </button>
          <button className="flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-full p-2 bg-[#2F2F2F] hover:bg-[#1a1a1a] text-white transition" aria-label="Sign up with Microsoft">
            {/* Microsoft SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g><rect x="2" y="2" width="9" height="9" fill="#F35325"/><rect x="13" y="2" width="9" height="9" fill="#81BC06"/><rect x="2" y="13" width="9" height="9" fill="#05A6F0"/><rect x="13" y="13" width="9" height="9" fill="#FFBA08"/></g></svg>
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
              {/* Replace with your actual terms content */}
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
  );
}
