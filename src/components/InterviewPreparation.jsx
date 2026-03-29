import {
  BookOpen,
  Target,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

function InterviewPreparation({ onExpandGuide }) {
  const tips = [
    {
      icon: BookOpen,
      title: 'Study Guide',
      description: 'Review common data structures and algorithms',
      color: 'primary',
    },
    {
      icon: Target,
      title: 'Practice Problems',
      description: 'Solve similar coding challenges',
      color: 'secondary',
    },
    {
      icon: Users,
      title: 'Mock Interviews',
      description: 'Practice with peers and mentors',
      color: 'accent',
    },
    {
      icon: Clock,
      title: 'Time Management',
      description: 'Practice solving within time limits',
      color: 'warning',
    },
  ];

  const checklist = [
    'Test internet connection',
    'Check microphone and camera',
    'Prepare workspace',
    'Review problem statement',
    'Have notepad ready',
  ];

  return (
    <div className="space-y-4">
      {/* Preparation Card */}
      <div className="card bg-base-100 border-2 border-secondary/20 hover:border-secondary/40 transition-all">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-secondary to-accent rounded-xl">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold">Get Prepared</h3>
          </div>

          <div className="space-y-2 mb-4">
            {tips.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <button
                  key={idx}
                  className="w-full text-left p-3 bg-base-200 hover:bg-base-300 rounded-lg transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 text-${tip.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {tip.title}
                      </p>
                      <p className="text-xs text-base-content/60 truncate">
                        {tip.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 flex-shrink-0 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={onExpandGuide}
            className="btn btn-sm btn-outline w-full gap-2"
          >
            <BookOpen className="w-4 h-4" />
            View Full Guide
          </button>
        </div>
      </div>

      {/* Pre-Interview Checklist */}
      <div className="card bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <h3 className="font-bold">Before Interview</h3>
          </div>

          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <label key={idx} className="checkbox-label flex items-center gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-success"
                  readOnly
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="card bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning/20">
        <div className="card-body">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold mb-2">Pro Tips</h3>
              <ul className="space-y-1 text-xs text-base-content/70">
                <li>
                  • Think aloud and explain your approach during coding
                </li>
                <li>
                  • Ask clarifying questions about the problem
                </li>
                <li>
                  • Write clean, maintainable code
                </li>
                <li>
                  • Test your solution with examples
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="card bg-base-100 border-2 border-accent/20">
        <div className="card-body">
          <h3 className="font-bold mb-3">Resources</h3>
          <div className="space-y-2">
            <a
              href="#"
              className="block p-2 text-sm text-primary hover:bg-base-200 rounded transition-colors"
            >
              → Interview Preparation Guide
            </a>
            <a
              href="#"
              className="block p-2 text-sm text-primary hover:bg-base-200 rounded transition-colors"
            >
              → Common Interview Questions
            </a>
            <a
              href="#"
              className="block p-2 text-sm text-primary hover:bg-base-200 rounded transition-colors"
            >
              → System Design Basics
            </a>
            <a
              href="#"
              className="block p-2 text-sm text-primary hover:bg-base-200 rounded transition-colors"
            >
              → Behavioral Tips
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewPreparation;
