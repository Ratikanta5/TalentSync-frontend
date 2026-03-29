import { Play, Pause, ChevronRight, Clock, BarChart3 } from 'lucide-react';

/**
 * InterviewTopBar Component
 * Displays controls and status information
 */
function InterviewTopBar({
  userRole,
  timeRemaining,
  candidateStatus,
  isInterviewActive,
  onStartInterview,
  onPauseInterview,
  onNextQuestion,
  onToggleRole
}) {
  const getStatusColor = () => {
    switch (candidateStatus) {
      case 'CODING':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'SUBMITTED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'IDLE':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section: Controls (Interviewer Only) */}
        <div className="flex items-center gap-3">
          {userRole === 'interviewer' ? (
            <>
              <button
                onClick={onStartInterview}
                disabled={isInterviewActive}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isInterviewActive
                    ? 'bg-green-600/30 text-green-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                }`}
              >
                <Play size={18} />
                Start Interview
              </button>

              <button
                onClick={onPauseInterview}
                disabled={!isInterviewActive}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  !isInterviewActive
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 active:scale-95'
                }`}
              >
                <Pause size={18} />
                Pause
              </button>

              <button
                onClick={onNextQuestion}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 transition-all duration-200 active:scale-95"
              >
                <ChevronRight size={18} />
                Next Question
              </button>
            </>
          ) : (
            <div className="text-gray-400 text-sm font-medium">Candidate View</div>
          )}
        </div>

        {/* Center Section: Timer */}
        <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50">
          <Clock size={18} className="text-blue-400" />
          <span className="font-mono text-xl font-bold text-blue-400">
            Time Remaining: {timeRemaining}
          </span>
        </div>

        {/* Right Section: Status & Debug */}
        <div className="flex items-center gap-3">
          {/* Status Dropdown */}
          <div className="relative group">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all duration-200 ${getStatusColor()}`}>
              <BarChart3 size={18} />
              Candidate Status: {candidateStatus}
            </button>
          </div>

          {/* Role Toggle (Debug) */}
          <button
            onClick={onToggleRole}
            className="text-xs px-3 py-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-gray-200 border border-gray-700/50 hover:border-gray-600/50 transition-all"
          >
            Toggle: {userRole === 'interviewer' ? 'Candidate' : 'Interviewer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewTopBar;
