import React, { useState } from "react";

export default function LoginForm({ authTab, setAuthTab }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex-1 flex flex-col justify-between px-8 py-8 md:py-10 bg-white dark:bg-[#232323]">
      <div>
        <h2 className="text-xl font-bold mb-4 text-center">Log in</h2>
        <form className="space-y-4">
          <input className="w-full p-2 border rounded dark:bg-[#232323] dark:text-white" type="email" placeholder="Email" required />
          <div className="relative">
            <input
              className="w-full p-2 border rounded dark:bg-[#232323] dark:text-white pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 text-sm focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M6.343 6.343A7.963 7.963 0 004 9c0 4.418 3.582 8 8 8 1.657 0 3.22-.403 4.575-1.125M17.657 17.657A7.963 7.963 0 0020 15c0-4.418-3.582-8-8-8-1.657 0-3.22.403-4.575 1.125M3 3l18 18" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          <a href="#" className="block text-xs text-blue-600 mt-1 mb-2 hover:underline text-left">Forgot your password?</a>
          <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition">Log in</button>
        </form>
        <div className="flex items-center justify-center gap-4 mt-6 mb-2">
          <button className="flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-full p-2 bg-white dark:bg-[#232323] hover:bg-gray-100 dark:hover:bg-[#232323] transition" aria-label="Log in with Google">
            {/* Official Google G logo SVG */}
            <svg width="28" height="28" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><g><path d="M44.5 20H24v8.5h11.7C34.9 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.9 0 5.6 1 7.7 2.7l6.3-6.3C34.6 5.5 29.6 3 24 3 12.9 3 4 11.9 4 24s8.9 21 20 21c11 0 20-8.9 20-21 0-1.3-.1-2.7-.4-4z" fill="#4285F4"/><path d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c2.9 0 5.6 1 7.7 2.7l6.3-6.3C34.6 5.5 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 10.7z" fill="#34A853"/><path d="M24 43c5.4 0 10.2-1.8 13.9-4.9l-6.7-5.5C29.4 36 24 36 24 36c-5.4 0-9.9-3.5-11.3-8.1l-6.6 5.1C9.6 38.6 16.3 43 24 43z" fill="#FBBC05"/><path d="M43.6 20.1H42V20H24v8h11.3C34.5 32.5 29.4 36 24 36c-5.4 0-9.9-3.5-11.3-8.1l-6.6 5.1C9.6 38.6 16.3 43 24 43c5.4 0 10.2-1.8 13.9-4.9l-6.7-5.5C29.4 36 24 36 24 36c-5.4 0-9.9-3.5-11.3-8.1l-6.6 5.1C9.6 38.6 16.3 43 24 43z" fill="#EA4335"/><path d="M44.5 20H24v8.5h11.7C34.9 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.9 0 5.6 1 7.7 2.7l6.3-6.3C34.6 5.5 29.6 3 24 3 12.9 3 4 11.9 4 24s8.9 21 20 21c11 0 20-8.9 20-21 0-1.3-.1-2.7-.4-4z" fill="none"/></g></svg>
          </button>
          <button className="flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-full p-2 bg-[#1877F3] hover:bg-[#145db2] text-white transition" aria-label="Log in with Facebook">
            {/* Facebook SVG */}
            <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M29 0H3C1.343 0 0 1.343 0 3v26c0 1.657 1.343 3 3 3h13V20h-4v-5h4v-3.5C16 8.57 18.239 7 21.021 7c1.312 0 2.438.097 2.765.141v3.204h-1.898c-1.49 0-1.788.708-1.788 1.75V15h4.5l-.5 5h-4v12h7c1.657 0 3-1.343 3-3V3c0-1.657-1.343-3-3-3z"/></svg>
          </button>
          <button className="flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-full p-2 bg-[#2F2F2F] hover:bg-[#1a1a1a] text-white transition" aria-label="Log in with Microsoft">
            {/* Microsoft SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g><rect x="2" y="2" width="9" height="9" fill="#F35325"/><rect x="13" y="2" width="9" height="9" fill="#81BC06"/><rect x="2" y="13" width="9" height="9" fill="#05A6F0"/><rect x="13" y="13" width="9" height="9" fill="#FFBA08"/></g></svg>
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
