import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RoleSelectionModal from '../components/RoleSelectionModal';
import UserDetailsModal from '../components/UserDetailsModal';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');
    const newUser = searchParams.get('newUser') === 'true';
    
    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=oauth_failed');
      return;
    }
    
    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Fetch full user profile
        const fetchUserProfile = async () => {
          try {
            const API_BASE_URL = process.env.NODE_ENV === 'production' 
              ? 'https://taraki-production.up.railway.app/api'
              : 'http://localhost:5000/api';
            
            const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const fullUser = await response.json();
              localStorage.setItem('user', JSON.stringify(fullUser));
              setUser(fullUser);
              
              // Check if user needs role selection
              if (newUser || !fullUser.role) {
                setShowRoleSelection(true);
              } else {
                // User has role, redirect based on role
                redirectBasedOnRole(fullUser);
              }
            } else {
              setUser(userData);
              if (newUser || !userData.role) {
                setShowRoleSelection(true);
              } else {
                redirectBasedOnRole(userData);
              }
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
            setUser(userData);
            if (newUser || !userData.role) {
              setShowRoleSelection(true);
            } else {
              redirectBasedOnRole(userData);
            }
          }
        };
        
        fetchUserProfile();
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=callback_failed');
      }
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate]);

  const redirectBasedOnRole = (userData) => {
    if (userData.role === 'entrepreneur') {
      navigate('/entrepreneur-dashboard');
    } else if (userData.role === 'investor') {
      navigate('/investor-dashboard');
    } else if (userData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleRoleSelected = (updatedUser) => {
    setUser(updatedUser);
    setShowRoleSelection(false);
    setShowUserDetails(true);
  };

  const handleUserDetailsComplete = () => {
    setShowUserDetails(false);
    if (user) {
      redirectBasedOnRole(user);
    }
  };

  if (showRoleSelection && user) {
    return <RoleSelectionModal user={user} onRoleSelected={handleRoleSelected} />;
  }

  if (showUserDetails && user) {
    return <UserDetailsModal user={user} onClose={() => setShowUserDetails(false)} onComplete={handleUserDetailsComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}

export default AuthCallback;

