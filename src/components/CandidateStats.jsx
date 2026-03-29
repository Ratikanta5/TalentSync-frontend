import { TrendingUp, Calendar, CheckCircle, Star, Zap } from 'lucide-react';

function CandidateStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Interviews */}
      <div className="card bg-base-100 border-2 border-primary/20 hover:border-primary/40 transition-all">
        <div className="card-body p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-base-content/60 mb-1">
                Total Interviews
              </p>
              <h3 className="text-3xl font-bold">{stats.totalInterviews}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="text-xs text-base-content/50">
            Across all companies
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="card bg-base-100 border-2 border-warning/20 hover:border-warning/40 transition-all">
        <div className="card-body p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-base-content/60 mb-1">
                Upcoming
              </p>
              <h3 className="text-3xl font-bold text-warning">
                {stats.upcomingCount}
              </h3>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <Zap className="w-6 h-6 text-warning" />
            </div>
          </div>
          <div className="text-xs text-base-content/50">
            Scheduled interviews
          </div>
        </div>
      </div>

      {/* Completed */}
      <div className="card bg-base-100 border-2 border-success/20 hover:border-success/40 transition-all">
        <div className="card-body p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-base-content/60 mb-1">
                Completed
              </p>
              <h3 className="text-3xl font-bold text-success">
                {stats.completedCount}
              </h3>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="text-xs text-base-content/50">
            Finished interviews
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateStats;
