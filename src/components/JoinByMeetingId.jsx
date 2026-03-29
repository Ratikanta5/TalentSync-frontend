import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Video, Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

function JoinByMeetingId() {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputError, setInputError] = useState('');

  const validateMeetingId = () => {
    if (!meetingId.trim()) {
      setInputError('Meeting ID is required');
      return false;
    }

    if (meetingId.trim().length < 8) {
      setInputError('Meeting ID must be at least 8 characters');
      return false;
    }

    setInputError('');
    return true;
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();

    if (!validateMeetingId()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // First, validate that the meeting exists and you can access it
      const response = await axios.get(`/interviews/${meetingId.trim()}`);

      if (response.data.success) {
        const interview = response.data.data;

        // Navigate to the interview join page
        navigate(`/interview/join/${interview.sessionId}`);
        toast.success('Joining meeting...');
      }
    } catch (err) {
      console.error('Error joining meeting:', err);

      if (err.response?.status === 404) {
        setError('Meeting not found. Please check the Meeting ID and try again.');
        toast.error('Meeting ID not found');
      } else if (err.response?.status === 403) {
        setError(
          'You are not authorized to join this meeting. Please ensure you have an invitation.'
        );
        toast.error('Not authorized to join this meeting');
      } else {
        setError(
          'Unable to connect to the meeting. Please try again in a moment.'
        );
        toast.error('Connection failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setMeetingId(e.target.value);
    setInputError('');
    setError('');
  };

  return (
    <div className="card bg-gradient-to-br from-base-100 to-base-100 border-2 border-primary/20 hover:border-primary/30 transition-all shadow-lg h-full">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Join Meeting</h2>
            <p className="text-xs text-base-content/50 mt-1">
              Enter your meeting ID to join
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleJoinMeeting} className="space-y-4 flex-1">
          {/* Meeting ID Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Meeting ID</span>
              <span className="label-text-alt text-xs text-base-content/50">
                Required
              </span>
            </label>
            <input
              type="text"
              placeholder="Enter meeting ID (e.g., 507f1f77bcf86cd799439011)"
              value={meetingId}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`input input-bordered w-full transition-all ${
                inputError || error
                  ? 'input-error border-2 focus:border-error'
                  : 'focus:input-primary'
              } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
            {inputError && (
              <label className="label">
                <span className="label-text-alt text-error text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {inputError}
                </span>
              </label>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error gap-3 py-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-base-200/50 rounded-lg p-4 border border-base-300">
            <p className="text-xs text-base-content/70 leading-relaxed">
              Don't have a meeting ID? Check your email for an invitation link,
              or ask your interviewer to share the meeting ID.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !meetingId.trim()}
            className={`btn btn-primary w-full gap-2 font-semibold transition-all ${
              isLoading ? 'loading' : ''
            } ${!meetingId.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Join Meeting
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="pt-4 border-t border-base-300">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
              Requirements
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-base-content/70">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-success" />
                <span>Valid meeting ID</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-base-content/70">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-success" />
                <span>Stable internet connection</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-base-content/70">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-success" />
                <span>Camera & microphone access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinByMeetingId;
