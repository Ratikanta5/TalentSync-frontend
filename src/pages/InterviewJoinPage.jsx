import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUser } from '@clerk/clerk-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { Loader2, Copy, CheckCircle } from 'lucide-react';

function InterviewJoinPage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);

  // Fetch interview details
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/interviews/${identifier}`);
        
        if (response.data.success) {
          setInterview(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Interview not found');
        console.error('Error fetching interview:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchInterview();
    }
  }, [identifier, isLoaded, user]);

  const handleJoinInterview = async () => {
    if (!interview) return;

    try {
      setJoining(true);
      const response = await axios.post(`/interviews/${identifier}/join`);

      if (response.data.success) {
        toast.success('Successfully joined interview!');
        // Redirect to interview session (if you have a dedicated route)
        navigate(`/interview/${interview._id}`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to join interview';
      toast.error(errorMsg);
      console.error('Error joining interview:', err);
    } finally {
      setJoining(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="container mx-auto px-6 py-12 flex items-center justify-center">
          <div className="bg-base-100 rounded-lg shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
            <p className="text-base-content/70 mb-4">You need to be signed in to join an interview.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="container mx-auto px-6 py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-base-content/60">Loading interview details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="container mx-auto px-6 py-12 flex items-center justify-center">
          <div className="bg-base-100 rounded-lg shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-error">Error</h2>
            <p className="text-base-content/70 mb-4">{error || 'Interview not found'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary w-full"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-base-100 rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-base-100">
              <h1 className="text-3xl font-bold mb-2">{interview.title}</h1>
              <div className="flex gap-2 flex-wrap">
                <span className="badge badge-lg">{interview.status}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Interview Details */}
              <div>
                <h2 className="text-xl font-bold mb-4">Interview Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-base-200 p-4 rounded">
                    <p className="text-sm text-base-content/60">Duration</p>
                    <p className="text-lg font-bold">{interview.timeLimit} minutes</p>
                  </div>
                  <div className="bg-base-200 p-4 rounded">
                    <p className="text-sm text-base-content/60">Interviewer</p>
                    <p className="text-lg font-bold">{interview.interviewer?.name || 'Interviewer'}</p>
                  </div>
                  {interview.scheduledFor && (
                    <div className="bg-base-200 p-4 rounded col-span-2">
                      <p className="text-sm text-base-content/60">Scheduled For</p>
                      <p className="text-lg font-bold">
                        {new Date(interview.scheduledFor).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {interview.description && (
                <div>
                  <h3 className="font-bold mb-2">Description</h3>
                  <p className="text-base-content/70 bg-base-200 p-4 rounded">{interview.description}</p>
                </div>
              )}

              {/* Features */}
              <div>
                <h3 className="font-bold mb-3">Interview Features</h3>
                <div className="space-y-2">
                  {interview.settings?.videoEnabled && (
                    <div className="flex items-center gap-2 bg-base-200 p-3 rounded">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>📹 Video Call</span>
                    </div>
                  )}
                  {interview.settings?.chatEnabled && (
                    <div className="flex items-center gap-2 bg-base-200 p-3 rounded">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>💬 Chat Messages</span>
                    </div>
                  )}
                  {interview.settings?.collaborativeCodeEnabled && (
                    <div className="flex items-center gap-2 bg-base-200 p-3 rounded">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>💻 Code Editor</span>
                    </div>
                  )}
                  {interview.settings?.autoTimerEnabled && (
                    <div className="flex items-center gap-2 bg-base-200 p-3 rounded">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>⏱️ Auto Timer</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Interview Info */}
              <div className="alert alert-info">
                <span>ℹ️ You're about to join the interview. Click the button below to proceed.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-8 bg-base-50 flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinInterview}
                disabled={joining}
                className="btn btn-primary ml-auto gap-2"
              >
                {joining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  '✓ Join Interview'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewJoinPage;
