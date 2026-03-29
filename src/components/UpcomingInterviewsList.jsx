import { Calendar, Users, Clock, Play, Settings, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function UpcomingInterviewsList({ interviews, onViewDetails }) {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'draft':
        return 'badge badge-neutral';
      case 'scheduled':
        return 'badge badge-info';
      case 'active':
        return 'badge badge-warning';
      case 'completed':
        return 'badge badge-success';
      case 'cancelled':
        return 'badge badge-error';
      default:
        return 'badge';
    }
  };

  const getStatusDisplay = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-base-content/60">No interviews to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interviews.map((interview) => (
        <div key={interview._id} className="bg-base-100 border border-base-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start gap-4">
            {/* Left Content */}
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{interview.title}</h3>
                  <p className="text-sm text-base-content/60 line-clamp-2">{interview.description}</p>
                </div>
                <div className={getStatusBadgeColor(interview.status)}>
                  {getStatusDisplay(interview.status)}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Questions */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-primary/10 p-2 rounded">
                    <Settings className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-base-content/60">Questions</p>
                    <p className="font-semibold">{interview.questions?.length || 0} questions</p>
                  </div>
                </div>

                {/* Candidates */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-info/10 p-2 rounded">
                    <Users className="w-4 h-4 text-info" />
                  </div>
                  <div>
                    <p className="text-base-content/60">Candidates</p>
                    <p className="font-semibold">{interview.candidates?.length || 0} candidates</p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-warning/10 p-2 rounded">
                    <Clock className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-base-content/60">Duration</p>
                    <p className="font-semibold">Until host ends</p>
                  </div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-3 mb-4 text-sm">
                {/* Scheduled Date/Time - PROMINENT */}
                {interview.scheduledFor && interview.status === 'scheduled' && (
                  <div className="bg-info/10 border border-info/30 rounded px-3 py-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-info" />
                    <div>
                      <p className="font-semibold text-info">
                        📅 {new Date(interview.scheduledFor).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {' '}
                        <span className="text-base-content/70">
                          {new Date(interview.scheduledFor).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </p>
                      <p className="text-xs text-info/70">
                        {formatDistanceToNow(new Date(interview.scheduledFor), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Draft - Not scheduled yet */}
                {interview.status === 'draft' && (
                  <div className="bg-warning/10 border border-warning/30 rounded px-3 py-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <div>
                      <p className="font-semibold text-warning text-xs">Not Scheduled Yet</p>
                      <p className="text-xs text-warning/70">Click Edit to set schedule</p>
                    </div>
                  </div>
                )}

                {/* Other Statuses */}
                {interview.status !== 'scheduled' && interview.status !== 'draft' && interview.startedAt && (
                  <div className="bg-base-200 rounded px-3 py-2 flex items-center gap-2 text-xs">
                    <Clock className="w-4 h-4" />
                    <span>Started: {new Date(interview.startedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}</span>
                  </div>
                )}
              </div>

              {/* Features Row */}
              <div className="flex flex-wrap gap-2 text-xs text-base-content/60">
                {interview.settings?.videoEnabled && (
                  <span className="badge badge-sm">🎥 Video</span>
                )}
                {interview.settings?.chatEnabled && (
                  <span className="badge badge-sm">💬 Chat</span>
                )}
                {interview.settings?.collaborativeCodeEnabled && (
                  <span className="badge badge-sm">💻 Code Editor</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onViewDetails(interview)}
                className="btn btn-sm btn-primary gap-2"
              >
                <Settings className="w-4 h-4" />
                Manage
              </button>

              {interview.status === 'scheduled' && (
                <button
                  className="btn btn-sm btn-success gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              )}

              {interview.status === 'draft' && (
                <button className="btn btn-sm btn-outline">
                  Schedule
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UpcomingInterviewsList;
