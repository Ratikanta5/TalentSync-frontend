import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from '../lib/axios';
import Navbar from '../components/Navbar';
import CandidateStats from '../components/CandidateStats';
import JoinByMeetingId from '../components/JoinByMeetingId';

function CandidateDashboard() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch candidate data on mount
  useEffect(() => {
    fetchCandidateInterviews();
  }, [user?.id]);

  const fetchCandidateInterviews = async () => {
    try {
      setLoading(true);
      // Fetch interviews where the current user is a candidate
      const response = await axios.get('/interviews/candidate/invitations');

      if (response.data.success) {
        setInterviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      // For now, just continue with empty interviews
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const upcomingInterviews = interviews.filter(
    (interview) =>
      interview.status === 'scheduled' || interview.status === 'draft'
  );

  const completedInterviews = interviews.filter(
    (interview) =>
      interview.status === 'completed' || interview.status === 'cancelled'
  );

  // Calculate statistics
  const stats = {
    totalInterviews: interviews.length,
    upcomingCount: upcomingInterviews.length,
    completedCount: completedInterviews.length,
    acceptanceRate: interviews.length > 0 ? 85 : 0, // Placeholder
    avgScore: interviews.length > 0 ? 4.5 : 0, // Placeholder
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-300">
        <Navbar />

        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Candidate Dashboard</h1>
              <p className="text-base-content/60">
                Join your interview or view your stats
              </p>
            </div>

            {/* Top Cards Row - Join Meeting & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Join Meeting by ID Card */}
              <div className="lg:col-span-1">
                <JoinByMeetingId />
              </div>

              {/* Stats Cards */}
              <div className="lg:col-span-2">
                <CandidateStats stats={stats} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CandidateDashboard;
