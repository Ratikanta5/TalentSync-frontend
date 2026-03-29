import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ChevronDown, Clock, Target, Zap, MoreVertical } from 'lucide-react';
import CodeEditorPanel from '../CodeEditorPanel';
import VideoCallUI from '../VideoCallUI';
import InterviewTimer from '../InterviewTimer';
import OutputPanel from '../OutputPanel';
import '../../styles/interview-layout.css';

/**
 * InterviewerLayout Component
 * Displays the complete interview interface for interviewers with:
 * - Questions panel (left)
 * - Code editor (center-top)
 * - Video call area (right)
 * - Output console (center-bottom)
 * - Chat panel (right-bottom)
 */
function InterviewerLayout({
  interview,
  questions,
  selectedQuestionIndex,
  onSelectQuestion,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  selectedLanguage,
  code,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  isRunning,
  output,
  timeRemaining,
  isTimerRunning,
  onStartTimer,
  onStopTimer,
  call,
  channel,
  chatClient,
  isInitializingCall,
  streamClient
}) {
  const [expandedQuestionsPanel, setExpandedQuestionsPanel] = useState(true);
  const selectedQuestion = questions[selectedQuestionIndex];

  return (
    <div className="interview-container-interviewer h-screen flex flex-col bg-base-200">
      {/* ============ HEADER: Interview Status Bar ============ */}
      <div className="interview-header bg-gradient-to-r from-base-100 to-base-200 border-b border-base-300 px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-base-content">{interview?.title || 'Interview'}</h1>
              <p className="text-sm text-base-content/60 mt-1">Interviewer Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="badge badge-lg badge-primary gap-2">
              <Zap className="w-4 h-4" />
              Status: Active
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT: Responsive Panels ============ */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* ============ LEFT PANEL: Questions List ============ */}
        <Panel 
          defaultSize={20} 
          minSize={15}
          maxSize={35}
          className="interview-questions-panel"
        >
          <div className="h-full flex flex-col bg-base-100 border-r border-base-300 overflow-hidden">
            {/* Questions Header */}
            <div className="px-4 py-4 border-b border-base-300 flex items-center justify-between bg-base-100">
              <h2 className="font-bold text-lg text-base-content">Interview Questions</h2>
              <button
                onClick={() => setExpandedQuestionsPanel(!expandedQuestionsPanel)}
                className="btn btn-ghost btn-sm"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedQuestionsPanel ? '' : 'rotate-180'}`} />
              </button>
            </div>

            {/* Questions Scroll Area */}
            <div className="flex-1 overflow-y-auto interviewer-questions-list">
              {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-base-content/50 p-4">
                  <Target className="w-8 h-8" />
                  <p className="text-sm text-center">No questions added yet</p>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectQuestion(idx)}
                    className={`question-item cursor-pointer transition-all px-4 py-3 border-l-4 ${
                      selectedQuestionIndex === idx
                        ? 'border-primary bg-primary/10 bg-base-100'
                        : 'border-transparent hover:bg-base-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-base-content truncate">
                          {idx + 1}. {q.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`badge badge-xs ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty || 'Medium'}
                          </span>
                          <span className="text-xs text-base-content/70 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {q.timeLimit || 30}m
                          </span>
                        </div>
                      </div>
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-ghost btn-xs">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border border-base-300">
                          <li><a onClick={() => onEditQuestion(idx)}>Edit</a></li>
                          <li><a onClick={() => onDeleteQuestion(idx)}>Delete</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Question Button */}
            <div className="px-4 py-3 border-t border-base-300 bg-base-100">
              <button
                onClick={onAddQuestion}
                className="btn btn-primary btn-block btn-sm"
              >
                + Add Question
              </button>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="interview-resize-handle" />

        {/* ============ CENTER PANEL: Code Editor & Output ============ */}
        <Panel
          defaultSize={40}
          minSize={30}
          className="interview-editor-panel"
        >
          <div className="h-full flex flex-col">
            {/* Question Details Header */}
            {selectedQuestion && (
              <div className="bg-base-100 border-b border-base-300 px-4 py-3">
                <h3 className="font-semibold text-base-content">{selectedQuestion.title}</h3>
                {selectedQuestion.description && (
                  <p className="text-sm text-base-content/70 mt-1">{selectedQuestion.description}</p>
                )}
              </div>
            )}

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
                <OutputPanel output={output} isRunning={isRunning} />
              </Panel>
            </PanelGroup>
          </div>
        </Panel>

        <PanelResizeHandle className="interview-resize-handle" />

        {/* ============ RIGHT PANEL: Video Call & Chat ============ */}
        <Panel
          defaultSize={40}
          minSize={25}
          className="interview-video-panel"
        >
          <div className="h-full flex flex-col bg-base-100 border-l border-base-300">
            {/* Video Call Header */}
            <div className="px-4 py-3 border-b border-base-300 bg-gradient-to-r from-primary/20 to-transparent">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base-content">Video Call</h2>
                <div className="flex items-center gap-2">
                  {selectedQuestion && (
                    <InterviewTimer
                      initialTime={selectedQuestion.timeLimit * 60}
                      isRunning={isTimerRunning}
                      onStart={() => onStartTimer?.(selectedQuestion.timeLimit * 60)}
                      onStop={onStopTimer}
                      timeRemaining={timeRemaining}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Video Call Area */}
            <div className="flex-1 overflow-hidden">
              {call && (
                <VideoCallUI
                  key="interviewer-video-call"
                  chatClient={chatClient}
                  channel={channel}
                  userRole="interviewer"
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

export default InterviewerLayout;
