import {
  CheckCircle,
  Trophy,
  Star,
  XCircle,
  Download,
  BarChart3,
  Eye,
  Loader,
  TrendingUp,
} from 'lucide-react';

function CompletedInterviews({ interviews, isLoading }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return {
          class: 'badge-success',
          icon: CheckCircle,
          label: 'Completed',
        };
      case 'cancelled':
        return {
          class: 'badge-error',
          icon: XCircle,
          label: 'Cancelled',
        };
      default:
        return {
          class: 'badge-gray',
          icon: CheckCircle,
          label: status,
        };
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'text-base-content/50';
    if (score >= 4) return 'text-success';
    if (score >= 3) return 'text-warning';
    return 'text-error';
  };

  if (interviews.length === 0) {
    return null;
  }

  return (
    <div className="card bg-base-100 border-2 border-success/20 hover:border-success/30 transition-all">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-success to-primary rounded-xl">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Completed Interviews</h2>
              <p className="text-xs text-base-content/50 mt-1">
                {interviews.length} finished
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="border-b-2 border-base-300 opacity-70">
                <th className="text-xs font-bold uppercase">Company</th>
                <th className="text-xs font-bold uppercase">Role</th>
                <th className="text-xs font-bold uppercase">Date</th>
                <th className="text-xs font-bold uppercase">Score</th>
                <th className="text-xs font-bold uppercase">Status</th>
                <th className="text-xs font-bold uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <Loader className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : (
                interviews.map((interview) => {
                  const statusBadge = getStatusBadge(interview.status);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr
                      key={interview._id}
                      className="hover:bg-base-200 transition-colors border-b border-base-300"
                    >
                      {/* Company */}
                      <td className="font-semibold">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {interview.company
                                ?.charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <span className="truncate">
                            {interview.company || 'Unknown'}
                          </span>
                        </div>
                      </td>

                      {/* Role/Title */}
                      <td>
                        <span className="truncate text-sm">
                          {interview.title}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="text-sm whitespace-nowrap">
                        {interview.endedAt
                          ? new Date(interview.endedAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: '2-digit',
                              }
                            )
                          : '-'}
                      </td>

                      {/* Score */}
                      <td className="font-bold">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-1 ${getScoreColor(
                              interview.performanceScore
                            )}`}
                          >
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i <
                                  (interview.performanceScore || 0)
                                    ? 'fill-current'
                                    : ''
                                }`}
                              />
                            ))}
                          </div>
                          {interview.performanceScore && (
                            <span className="text-xs">
                              {interview.performanceScore.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge badge-sm gap-1 ${
                            statusBadge.class
                          }`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex gap-2">
                          {interview.status === 'completed' && (
                            <>
                              <button
                                className="btn btn-ghost btn-xs gap-1"
                                title="View feedback"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs gap-1"
                                title="Download transcript"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Stats */}
        {!isLoading && interviews.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-base-300 mt-6">
            <div className="text-center">
              <p className="text-sm text-base-content/60 mb-1">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-success">
                {Math.round(
                  (interviews.filter((i) => i.status === 'completed').length /
                    interviews.length) *
                    100
                )}
                %
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-base-content/60 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-primary">
                {interviews.length > 0
                  ? (
                      interviews.reduce((sum, i) => sum + (i.score || 0), 0) /
                      interviews.length
                    ).toFixed(1)
                  : '0'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-base-content/60 mb-1">Total Time</p>
              <p className="text-2xl font-bold text-warning">
                {interviews.length * 0.5}h
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompletedInterviews;
