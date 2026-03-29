import { useState, useEffect } from 'react';
import { X, Share2, Users, Clock, Edit2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import ScheduledCountdownTimer from './ScheduledCountdownTimer';
import EditInterviewModal from './EditInterviewModal';

function InterviewDetailsModal({ isOpen, onClose, interview, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [sessionLink, setSessionLink] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [displayedInterview, setDisplayedInterview] = useState(interview);

  // Generate session link
  useEffect(() => {
    if (interview?.sessionId) {
      setSessionLink(`${window.location.origin}/interview/${interview.sessionId}`);
    }
    // Sync displayedInterview with the passed interview prop
    setDisplayedInterview(interview);
  }, [interview]);

  const handleShareLink = () => {
    if (sessionLink) {
      navigator.clipboard.writeText(sessionLink);
      toast.success('Session link copied to clipboard!');
    }
  };

  const handleStartInterview = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`/interviews/${displayedInterview._id}/start`);
      
      if (response.data.success) {
        toast.success('Interview started!');
        onRefresh();
      }
    } catch (error) {
      toast.error('Failed to start interview');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinInterview = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`/interviews/${displayedInterview.sessionId}/join`);
      
      if (response.data.success) {
        toast.success('You joined the interview!');
        // Redirect to interview session page or wherever interviews are conducted
        window.location.href = `/interview/${displayedInterview.sessionId}`;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join interview');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/interviews/${interview._id}`, formData);
      
      if (response.data.success) {
        // Update displayed interview immediately with response data
        const updatedInterview = response.data.data;
        setDisplayedInterview(updatedInterview);
        
        toast.success('Interview updated successfully!');
        setShowEditModal(false);
        
        // Also refetch all interviews in background to sync parent state
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating interview:', error);
      toast.error(error.response?.data?.message || 'Failed to update interview');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = displayedInterview && (displayedInterview.status === 'draft' || displayedInterview.status === 'scheduled' || displayedInterview.status === 'pending' || displayedInterview.status === 'rejected');

  if (!isOpen || !displayedInterview) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-6 flex justify-between items-center sticky top-0 bg-base-100 z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{displayedInterview.title}</h2>
            <div className="flex gap-2 mt-2">
              <span className="badge badge-primary">{displayedInterview.status}</span>
              <span className="badge badge-outline">{displayedInterview.candidates?.length || 0} candidates</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Scheduled Countdown Timer */}
          {displayedInterview.scheduledFor && displayedInterview.status === 'scheduled' && (
            <ScheduledCountdownTimer scheduledFor={displayedInterview.scheduledFor} />
          )}

          {/* Description */}
          {displayedInterview.description && (
            <div>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                📝 Description
              </h3>
              <p className="text-base-content/70 bg-base-200 p-4 rounded">{displayedInterview.description}</p>
            </div>
          )}

          {/* Interview Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-base-200 p-4 rounded">
              <p className="text-sm text-base-content/60 mb-1">Candidates</p>
              <p className="font-bold flex items-center gap-2">
                <Users className="w-4 h-4" />
                {displayedInterview.candidates?.length || 0} invited
              </p>
            </div>

            {displayedInterview.scheduledFor && (
              <div className="bg-base-200 p-4 rounded col-span-2">
                <p className="text-sm text-base-content/60 mb-1">Scheduled For</p>
                <p className="font-bold">
                  {new Date(displayedInterview.scheduledFor).toLocaleString('en-US', {
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

          {/* Settings */}
          <div>
            <h3 className="font-bold mb-3">Interview Features</h3>
            <div className="space-y-2">
              {displayedInterview.settings?.videoEnabled && (
                <div className="flex items-center gap-2 text-sm bg-base-200 p-3 rounded">
                  <span>✅ Video Call</span>
                </div>
              )}
              {displayedInterview.settings?.chatEnabled && (
                <div className="flex items-center gap-2 text-sm bg-base-200 p-3 rounded">
                  <span>✅ Chat Messages</span>
                </div>
              )}
              {displayedInterview.settings?.collaborativeCodeEnabled && (
                <div className="flex items-center gap-2 text-sm bg-base-200 p-3 rounded">
                  <span>✅ Code Editor</span>
                </div>
              )}
              {displayedInterview.settings?.autoTimerEnabled && (
                <div className="flex items-center gap-2 text-sm bg-base-200 p-3 rounded">
                  <span>✅ Auto Timer</span>
                </div>
              )}
            </div>
          </div>

          {/* Session Link */}
          {displayedInterview.status !== 'draft' && (
            <div className="space-y-4">
              <h3 className="font-bold mb-3">Share with Candidates</h3>
              
              {/* Method 1: Session Link (Meeting Link) */}
              <div>
                <p className="text-sm font-semibold mb-2">📌 Method 1: Meeting Link (Recommended)</p>
                <div className="bg-base-200 p-4 rounded flex items-center gap-2">
                  <input
                    type="text"
                    value={sessionLink || ''}
                    readOnly
                    className="input input-bordered input-sm flex-1"
                  />
                  <button
                    onClick={handleShareLink}
                    className="btn btn-sm btn-primary gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <p className="text-xs text-base-content/60 mt-1">
                  Share this URL link with candidates to join the interview
                </p>
              </div>

              {/* Method 2: Interview ID */}
              <div>
                <p className="text-sm font-semibold mb-2">🆔 Method 2: Interview ID</p>
                <div className="bg-base-200 p-4 rounded flex items-center gap-2">
                  <input
                    type="text"
                    value={displayedInterview._id || ''}
                    readOnly
                    className="input input-bordered input-sm flex-1 font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(displayedInterview._id);
                      toast.success('Interview ID copied!');
                    }}
                    className="btn btn-sm btn-primary gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <p className="text-xs text-base-content/60 mt-1">
                  Candidates can use this ID to join via the join page
                </p>
              </div>
            </div>
          )}

          {/* Candidates List */}
          {displayedInterview.candidates && displayedInterview.candidates.length > 0 && (
            <div>
              <h3 className="font-bold mb-3">Invited Candidates</h3>
              <div className="space-y-2">
                {displayedInterview.candidates.map((candidate, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-base-200 p-3 rounded">
                    <div>
                      <p className="font-semibold text-sm">{candidate.name || 'Candidate ' + (idx + 1)}</p>
                      <p className="text-xs text-base-content/60">{candidate.email}</p>
                    </div>
                    <span className={`badge ${
                      candidate.status === 'joined' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {candidate.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="alert alert-info">
            <span>ℹ️ Questions will be added during the interview. When both of you join, you can add and modify questions in real-time.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6 flex justify-between gap-3 sticky bottom-0 bg-base-100 flex-wrap">
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>

          <div className="flex gap-2 ml-auto">
            {canEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                className="btn btn-outline gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}

            {displayedInterview.status === 'scheduled' && (
              <button
                onClick={handleStartInterview}
                disabled={loading}
                className="btn btn-success gap-2"
              >
                {loading ? 'Starting...' : '▶️ Start Interview'}
              </button>
            )}

            {(displayedInterview.status === 'scheduled' || displayedInterview.status === 'active') && (
              <button
                onClick={handleJoinInterview}
                disabled={loading}
                className="btn btn-primary gap-2"
              >
                {loading ? 'Joining...' : '📞 Join Interview'}
              </button>
            )}

            {displayedInterview.status === 'draft' && (
              <button
                onClick={handleJoinInterview}
                disabled={loading}
                className="btn btn-info gap-2"
              >
                {loading ? 'Joining...' : '👁️ Preview Interview'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Interview Modal */}
      <EditInterviewModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        interview={displayedInterview}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}

export default InterviewDetailsModal;
