import { BookOpen, AlertCircle, Code } from 'lucide-react';

/**
 * CandidateQuestionPanel Component
 * Displays read-only question details for candidates
 */
function CandidateQuestionPanel({ question }) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700/50">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen size={20} className="text-blue-400" />
          Interview Question
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {question ? (
          <>
            {/* Question Title & Difficulty */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{question.title}</h3>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  question.difficulty === 'Easy'
                    ? 'bg-green-500/20 text-green-400'
                    : question.difficulty === 'Medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {question.difficulty}
                </span>
                <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                  Time Limit: {question.timeLimit} minutes
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                Description
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">{question.description}</p>
            </div>

            {/* Constraints */}
            {question.constraints && question.constraints.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} className="text-yellow-400" />
                  Constraints
                </h4>
                <ul className="space-y-1">
                  {question.constraints.map((constraint, idx) => (
                    <li key={idx} className="text-sm text-gray-400 ml-2 flex gap-2">
                      <span className="text-gray-600">•</span>
                      {constraint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples */}
            {question.examples && question.examples.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Code size={16} className="text-purple-400" />
                  Examples
                </h4>
                <div className="space-y-3">
                  {question.examples.map((example, idx) => (
                    <div key={idx} className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-2">Example {idx + 1}</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-400 font-semibold">Input:</p>
                          <p className="text-xs bg-gray-800/70 text-gray-300 p-2 rounded font-mono">
                            {example.input}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold">Output:</p>
                          <p className="text-xs bg-gray-800/70 text-gray-300 p-2 rounded font-mono">
                            {example.output}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Test Cases */}
            {question.testCases && question.testCases.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Test Cases ({question.testCases.length})
                </h4>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-blue-300">
                    Interviewer has provided {question.testCases.length} test case(s) for validation
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-center text-sm">No question selected</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateQuestionPanel;
