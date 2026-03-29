import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import axios from "../lib/axios";

import Navbar from "../components/Navbar";
import InterviewerDashboard from "./InterviewerDashboard";
import CandidateDashboard from "./CandidateDashboard";

function DashboardPage() {
  const { user } = useUser();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`/users/${user?.id}/onboarding-status`);
        if (response.data.success && response.data.data.user) {
          setUserRole(response.data.data.user.role);
          console.log('👤 User role:', response.data.data.user.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserRole();
    }
  }, [user?.id]);

  // Show loading state while fetching role
  if (loading) {
    return (
      <div className="min-h-screen bg-base-300 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Interviewer Dashboard
  if (userRole === 'interviewer') {
    return <InterviewerDashboard />;
  }

  // Admin Dashboard
  if (userRole === 'admin') {
    return (
      <>
        <div className="min-h-screen bg-base-300">
          <Navbar />
          <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-base-content/60 mb-8">Manage platform and users</p>
            
            {/* Admin specific content */}
            <div className="bg-base-100 rounded-lg p-6 shadow">
              <h2 className="text-xl font-bold mb-4">System Management</h2>
              <p className="text-base-content/60">Coming soon...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Candidate Dashboard (default)
  return <CandidateDashboard />;
}

export default DashboardPage;