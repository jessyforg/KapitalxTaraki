import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, requireVerification = true }) => {
  const [showBanner, setShowBanner] = useState(true);
  
  let user = null;
  try {
    const stored = localStorage.getItem('user');
    user = stored ? JSON.parse(stored) : null;
  } catch (e) {
    user = null;
  }

  // If no user is logged in, redirect to home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If allowedRoles is specified, check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'entrepreneur':
        return <Navigate to="/entrepreneur-dashboard" replace />;
      case 'investor':
        return <Navigate to="/investor-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Check if user is verified (if verification is required)
  const isVerified = user.is_verified === true || user.is_verified === 1 || user.verification_status === 'verified';
  
  return (
    <>
      {requireVerification && !isVerified && showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-black px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="font-semibold">Account Not Verified</p>
                <p className="text-sm">Please verify your account to access all features. Check your email for verification instructions.</p>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-black hover:text-gray-700 text-2xl font-bold"
              aria-label="Close banner"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <div className={requireVerification && !isVerified && showBanner ? "pt-20" : ""}>
        {children}
      </div>
    </>
  );
};

export default ProtectedRoute; 