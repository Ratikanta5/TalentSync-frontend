import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLocation } from 'react-router';
import axios from '../lib/axios';

/**
 * Hook to check if user has completed onboarding
 * Returns loading state, onboarding status, and user data
 */
export const useOnboarding = () => {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      console.log('⏳ useOnboarding: waiting for Clerk to load...');
      setLoading(false);
      return;
    }

    console.log('🔍 useOnboarding: Checking status for user:', user.id);

    const checkOnboarding = async () => {
      try {
        setLoading(true);
        console.log(`📡 Fetching: /users/${user.id}/onboarding-status`);
        
        const response = await axios.get(`/users/${user.id}/onboarding-status`);
        
        console.log('✅ Onboarding status response:', response.data);
        
        if (response.data.success) {
          setOnboardingComplete(response.data.data.isComplete);
          setUserData(response.data.data.user);
          console.log('✅ Onboarding complete:', response.data.data.isComplete);
          console.log('👤 User role:', response.data.data.user?.role);
        } else {
          console.log('❌ Response success is false');
          setOnboardingComplete(false);
        }
      } catch (err) {
        console.error('❌ Error checking onboarding status:', err);
        console.error('❌ Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(err.message);
        setOnboardingComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [user, isLoaded, location]);

  return {
    onboardingComplete,
    loading,
    userData,
    error,
    isLoaded
  };
};

export default useOnboarding;
