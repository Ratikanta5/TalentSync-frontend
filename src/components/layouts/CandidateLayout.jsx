import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { AlertCircle, BookOpen, CheckCircle, ChevronDown } from 'lucide-react';
import CodeEditorPanel from '../CodeEditorPanel';
import VideoCallUI from '../VideoCallUI';
import InterviewTimer from '../InterviewTimer';
import OutputPanel from '../OutputPanel';
import '../../styles/interview-layout.css';

/**
 * CandidateLayout Component
 * Displays the interview interface for candidates with:
 * - Problem description (left)
 * - Code editor (center-top)
 * - Output console (center-bottom)
 * - Video call area (right)
 * - Timer indicator
 */
function CandidateLayout({
  interview,
  selectedQuestion,
  selectedLanguage,
  code,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  isRunning,
  output,
  testResults,
  timeRemaining,
  isTimerRunning,
  onSubmitCode,
  call,
  channel,
  chatClient,
  isInitializingCall,
  streamClient
}) {
  const [expandedDescription, setExpandedDescription] = useState(true);

  return (
    <div className="interview-container-candidate h-screen flex flex-col bg-base-200">
      {/* ============ HEADER: Problem & Status Bar ============ */}
      <div className="interview-header bg-gradient-to-r from-base-100 to-base-200 border-b border-base-300 px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-base-content">
                {selectedQuestion?.title || 'Interview Problem'}
              </h1>
              <p className="text-sm text-base-content/60 mt-1">Candidate Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Difficulty Badge */}
            {selectedQuestion && (
              <div className={`badge badge-lg gap-2 ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                {selectedQuestion.difficulty || 'Medium'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT: Responsive Panels ============ */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* ============ LEFT PANEL: Problem Description ============ */}
        <Panel
          defaultSize={20}
          minSize={15}
          maxSize={35}
          className="candidate-description-panel"
        >
          <div className="h-full flex flex-col bg-base-100 border-r border-base-300 overflow-hidden">
            {/* Description Header */}
            <div className="px-4 py-4 border-b border-base-300 flex items-center justify-between bg-base-100">
              <h2 className="font-bold text-lg text-base-content flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Problem Details
              </h2>
              <button
                onClick={() => setExpandedDescription(!expandedDescription)}
                className="btn btn-ghost btn-sm"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedDescription ? '' : 'rotate-180'}`} />
              </button>
            </div>

            {/* Description Content */}
            <div className="flex-1 overflow-y-auto candidate-description-content p-4">
              {selectedQuestion ? (
                <div className="space-y-4">
                  {/* Problem Statement */}
                  <div>
                    <h3 className="font-semibold text-base-content mb-2">Problem Statement</h3>
                    <p className="text-sm text-base-content/80 leading-relaxed">
                      {selectedQuestion.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Constraints */}
                  {selectedQuestion.constraints && (
                    <div>
                      <h3 className="font-semibold text-base-content mb-2">Constraints</h3>
                      <ul className="text-sm text-base-content/80 space-y-1">
                        {Array.isArray(selectedQuestion.constraints) ? (
                          selectedQuestion.constraints.map((constraint, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-primary">•</span>
                              {constraint}
                            </li>
                          ))
                        ) : (
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            {selectedQuestion.constraints}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Examples */}
                  {selectedQuestion.examples && (
                    <div>
                      <h3 className="font-semibold text-base-content mb-2">Examples</h3>
                      <div className="bg-base-200 rounded p-3 font-mono text-xs text-base-content/80 space-y-2">
                        {Array.isArray(selectedQuestion.examples) ? (
                          selectedQuestion.examples.map((example, idx) => (
                            <div key={idx}>
                              <div className="text-base-content/60">Example {idx + 1}:</div>
                              <div>{example}</div>
                            </div>
                          ))
                        ) : (
                          <div>{selectedQuestion.examples}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Time Limit */}
                  <div className="alert alert-info">
                    <AlertCircle className="w-5 h-5" />
                    <span>Time Limit: {selectedQuestion.timeLimit || 30} minutes</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-base-content/50">
                  <p className="text-center">No problem selected</p>
                </div>
              )}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="interview-resize-handle" />

        {/* ============ CENTER PANEL: Code Editor & Output ============ */}
        <Panel
          defaultSize={40}
          minSize={30}
          className="candidate-editor-panel"
        >
          <div className="h-full flex flex-col">
            {/* Editor Header with Submit Button */}
            <div className="bg-base-100 border-b border-base-300 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-base-content">Solution Code</h3>
              <button
                onClick={onSubmitCode}
                className="btn btn-success btn-sm gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Submit Solution
              </button>
            </div>

            {/* Code Editor */}
            <PanelGroup direction="vertical" className="flex-1">
              <Panel defaultSize={60} minSize={40}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={onLanguageChange}
                  onCodeChange={onCodeChange}
                  onRunCode={onRunCode}
                />
              </Panel>

              <PanelResizeHandle />

              {/* Output Console */}
              <Panel defaultSize={40} minSize={20}>
                <div className="h-full flex flex-col bg-base-300">
                  {/* Test Results */}
                  {testResults && (
                    <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base-content">Test Results</span>
                        <span className={`badge ${testResults.passed ? 'badge-success' : 'badge-error'}`}>
                          {testResults.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  )}
                  <OutputPanel output={output} isRunning={isRunning} />
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>

        <PanelResizeHandle className="interview-resize-handle" />

        {/* ============ RIGHT PANEL: Video Call & Timer ============ */}
        <Panel
          defaultSize={40}
          minSize={25}
          className="candidate-video-panel"
        >
          <div className="h-full flex flex-col bg-base-100 border-l border-base-300">
            {/* Video Call Header with Timer */}
            <div className="px-4 py-3 border-b border-base-300 bg-gradient-to-r from-primary/20 to-transparent">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base-content">Interviewer</h2>
                <div className="flex items-center gap-2">
                  {selectedQuestion && timeRemaining !== undefined && (
                    <div className={`text-sm font-semibold p-2 rounded-lg ${
                      timeRemaining < 120 ? 'bg-error text-white' : 'bg-primary text-white'
                    }`}>
                      {formatTime(timeRemaining)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Call Area */}
            <div className="flex-1 overflow-hidden">
              {call && (
                <VideoCallUI
                  key="candidate-video-call"
                  chatClient={chatClient}
                  channel={channel}
                  userRole="candidate"
                />
              )}
              {!call && !isInitializingCall && (
                <div className="h-full flex items-center justify-center bg-base-200">
                  <p className="text-base-content/50">Waiting for call to initialize...</p>
                </div>
              )}
              {isInitializingCall && (
                <div className="h-full flex items-center justify-center bg-base-200">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-base-content/70">Initializing video call...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

/**
 * Helper function to get difficulty badge color
 */
function getDifficultyColor(difficulty) {
  const colors = {
    'Easy': 'badge-success',
    'Medium': 'badge-warning',
    'Hard': 'badge-error',
    'Expert': 'badge-error'
  };
  return colors[difficulty] || 'badge-info';
}

/**
 * Helper function to format time in MM:SS format
 */
function formatTime(seconds) {
  if (!seconds) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default CandidateLayout;
