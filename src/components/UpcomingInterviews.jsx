import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  MessageCircle,
  Code2,
  ChevronRight,
  Loader,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router';
import { formatDistanceToNow } from 'date-fns';

function UpcomingInterviews({ interviews, isLoading, onSelectInterview }) {
  const formatDate = (date) => {
    if (!date) return 'Not scheduled';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'badge-success';
      case 'medium':
        return 'badge-warning';
      case 'hard':
        return 'badge-error';
      default:
        return 'badge-primary';
    }
  };

  return (
    <div className="card bg-base-100 border-2 border-primary/20 hover:border-primary/30 transition-all">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Upcoming Interviews</h2>
              <p className="text-xs text-base-content/50 mt-1">
                {interviews.length > 0
                  ? `${interviews.length} scheduled`
                  : 'No interviews scheduled'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : interviews.length > 0 ? (
            interviews.map((interview) => (
              <div
                key={interview._id}
                className="group p-4 bg-gradient-to-br from-base-200 to-base-200 border-2 border-base-300 hover:border-primary/40 rounded-xl transition-all cursor-pointer"
                onClick={() => onSelectInterview(interview)}
              >
                {/* Top Section */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {interview.title}
                    </h3>
                    {interview.company && (
                      <p className="text-sm text-base-content/60">
                        {interview.company}
                      </p>
                    )}
                  </div>
                  {interview.status === 'scheduled' && (
                    <span className="badge badge-sm badge-success gap-1">
                      <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      Active
                    </span>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary/60" />
                    <span>
                      {interview.scheduledFor
                        ? formatDate(interview.scheduledFor)
                        : 'TBD'}
                    </span>
                  </div>

                  {/* Duration */}
                  {interview.timeLimit && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-warning/60" />
                      <span>{interview.timeLimit} min</span>
                    </div>
                  )}

                  {/* Interviewer */}
                  {interview.interviewer && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-secondary/60" />
                      <span>{interview.interviewer.name}</span>
                    </div>
                  )}

                  {/* Questions Count */}
                  {interview.questions && (
                    <div className="flex items-center gap-2 text-sm">
                      <Code2 className="w-4 h-4 text-accent/60" />
                      <span>{interview.questions.length} problems</span>
                    </div>
                  )}
                </div>

                {/* Features Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {interview.settings?.videoEnabled && (
                    <span className="badge badge-sm badge-outline gap-1">
                      <Video className="w-3 h-3" />
                      Video
                    </span>
                  )}
                  {interview.settings?.chatEnabled && (
                    <span className="badge badge-sm badge-outline gap-1">
                      <MessageCircle className="w-3 h-3" />
                      Chat
                    </span>
                  )}
                  {interview.settings?.collaborativeCodeEnabled && (
                    <span className="badge badge-sm badge-outline gap-1">
                      <Code2 className="w-3 h-3" />
                      Collaborative
                    </span>
                  )}
                </div>

                {/* Description */}
                {interview.description && (
                  <p className="text-sm text-base-content/60 mb-4 line-clamp-2">
                    {interview.description}
                  </p>
                )}

                {/* Action Button */}
                <div className="flex gap-2 pt-4 border-t border-base-300">
                  <Link
                    to={`/interview/join/${interview.sessionId}`}
                    className="flex-1 btn btn-sm btn-primary gap-2 group/btn"
                  >
                    <Video className="w-4 h-4" />
                    Join Interview
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectInterview(interview);
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="font-bold text-lg mb-1">No Upcoming Interviews</h3>
              <p className="text-sm text-base-content/60 mb-4">
                Keep an eye on invitations from companies
              </p>
              <button className="btn btn-sm btn-outline">
                Check Notifications
              </button>
            </div>
          )}
        </div>

        {interviews.length > 4 && (
          <div className="pt-4 border-t border-base-300 mt-4">
            <button className="btn btn-sm btn-ghost w-full gap-2">
              View All Interviews
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpcomingInterviews;
