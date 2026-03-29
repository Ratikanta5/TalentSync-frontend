import { Routes, Route, Navigate } from 'react-router';
import HomePage from './pages/HomePage';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import InterviewJoinPage from './pages/InterviewJoinPage';
import InterviewSessionPage from './pages/InterviewSessionPage';
import TechnicalInterviewPage from './pages/TechnicalInterviewPage';
import PracticeListPage from './pages/PracticeListPage';
import PracticeEditorPage from './pages/PracticeEditorPage';
import { useOnboarding } from './hooks/useOnboarding';
import { useEffect } from 'react';
import { setupAxiosInterceptor } from './lib/axios';

function App() {

  const { isSignedIn, isLoaded } = useUser(); //useUser() is a clerk hook use to find the details of current login user.
  const { getToken } = useAuth(); // Get token from Clerk
  const { onboardingComplete, loading: onboardingLoading } = useOnboarding();

  // Setup axios interceptor with Clerk token
  useEffect(() => {
    if (isLoaded && getToken) {
      setupAxiosInterceptor(getToken);
    }
  }, [isLoaded, getToken]);

  //this will get the rid of the flickering effect.
  if (!isLoaded || onboardingLoading) return null;

  return (
    <>
      <Routes>

        <Route path='/' element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/onboarding" element={isSignedIn && !onboardingComplete ? <OnboardingPage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn && onboardingComplete ? <DashboardPage /> : isSignedIn ? <Navigate to={"/onboarding"} /> : <Navigate to={"/"} />} />
        
        {/* Interview Demo Page (New Technical Interview UI) */}
        <Route path="/interview" element={isSignedIn ? <TechnicalInterviewPage /> : <Navigate to={isSignedIn ? "/onboarding" : "/"} />} />

        {/* Interview join by sessionId or interview ID */}
        <Route path="/interview/join/:identifier" element={isSignedIn ? <InterviewJoinPage /> : <Navigate to={isSignedIn ? "/onboarding" : "/"} />} />
        
        {/* Interview session page (meeting room) */}
        <Route path="/interview/:identifier" element={isSignedIn ? <InterviewSessionPage /> : <Navigate to={isSignedIn ? "/onboarding" : "/"} />} />

        {/* Practice Problems */}
        <Route path="/practice" element={isSignedIn && onboardingComplete ? <PracticeListPage /> : isSignedIn ? <Navigate to={"/onboarding"} /> : <Navigate to={"/"} />} />
        <Route path="/practice/:id" element={isSignedIn && onboardingComplete ? <PracticeEditorPage /> : isSignedIn ? <Navigate to={"/onboarding"} /> : <Navigate to={"/"} />} />
      </Routes>
      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  )
}

export default App;

//we successfully setup tailwind, react-router, daisyui, react-hot-toast, 
