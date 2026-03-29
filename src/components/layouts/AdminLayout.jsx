import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Users, BarChart3, Settings, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import '../../styles/interview-layout.css';

/**
 * AdminLayout Component
 * Displays the admin interface for managing interviews with:
 * - Active sessions overview (left)
 * - Session metrics & analytics (center)
 * - Detailed session controls (right)
 */
function AdminLayout({
  activeSessions,
  selectedSession,
  onSelectSession,
  analytics,
  onEndSession,
  onPauseSession,
  onResumeSession
}) {
  const [expandedMetrics, setExpandedMetrics] = useState(true);

  return (
    <div className="interview-container-admin h-screen flex flex-col bg-base-200">
      {/* ============ HEADER: Admin Dashboard ============ */}
      <div className="interview-header bg-gradient-to-r from-base-100 to-base-200 border-b border-base-300 px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-base-content/60 mt-1">Interview Session Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="stat-item">
              <div className="stat-value text-lg">{activeSessions?.length || 0}</div>
              <div className="stat-title text-xs">Active Sessions</div>
            </div>
            <div className="divider divider-horizontal my-0 px-2"></div>
            <div className="stat-item">
              <div className="stat-value text-lg">{analytics?.totalCompleted || 0}</div>
              <div className="stat-title text-xs">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT: Admin Dashboard Panels ============ */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* ============ LEFT PANEL: Active Sessions ============ */}
        <Panel
          defaultSize={25}
          minSize={15}
          maxSize={40}
          className="admin-sessions-panel"
        >
          <div className="h-full flex flex-col bg-base-100 border-r border-base-300 overflow-hidden">
            {/* Sessions Header */}
            <div className="px-4 py-4 border-b border-base-300 flex items-center justify-between bg-base-100">
              <h2 className="font-bold text-lg text-base-content flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Active Sessions
              </h2>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto admin-sessions-list">
              {!activeSessions || activeSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-base-content/50 p-4">
                  <Users className="w-8 h-8" />
                  <p className="text-sm text-center">No active sessions</p>
                </div>
              ) : (
                activeSessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => onSelectSession?.(session)}
                    className={`session-item cursor-pointer transition-all px-4 py-3 border-l-4 ${
                      selectedSession?._id === session._id
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent hover:bg-base-200'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Session Title */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-base-content">
                            {session.interview?.title || 'Interview'}
                          </h3>
                          <p className="text-xs text-base-content/60 mt-1">
                            ID: {session._id?.slice(-6)}
                          </p>
                        </div>
                        <div className={`badge badge-sm ${getStatusBadgeClass(session.status)}`}>
                          {session.status}
                        </div>
                      </div>

                      {/* Participants */}
                      <div className="flex items-center gap-2 text-xs text-base-content/70">
                        <Users className="w-3 h-3" />
                        <span>{session.interviewer?.name || 'Interviewer'}</span>
                      </div>

                      {/* Timer */}
                      <div className="flex items-center gap-2 text-xs text-base-content/70">
                        <Clock className="w-3 h-3" />
                        <span>{formatSessionTime(session.duration || 0)}</span>
                      </div>

                      {/* Progress */}
                      <div className="w-full bg-base-300 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${calculateProgress(session)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="interview-resize-handle" />

        {/* ============ CENTER PANEL: Metrics & Analytics ============ */}
        <Panel
          defaultSize={35}
          minSize={25}
          className="admin-metrics-panel"
        >
          <div className="h-full flex flex-col bg-base-100 border-r border-base-300 overflow-hidden">
            {/* Metrics Header */}
            <div className="px-4 py-4 border-b border-base-300 flex items-center justify-between bg-base-100">
              <h2 className="font-bold text-lg text-base-content flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Session Analytics
              </h2>
            </div>

            {/* Metrics Content */}
            <div className="flex-1 overflow-y-auto admin-metrics-content p-4">
              {selectedSession ? (
                <div className="space-y-4">
                  {/* Session Header */}
                  <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-lg p-4 border border-primary/20">
                    <h3 className="font-semibold text-base-content text-lg">
                      {selectedSession.interview?.title}
                    </h3>
                    <p className="text-sm text-base-content/60 mt-1">
                      Started: {new Date(selectedSession.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Status Card */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-base-200 rounded-lg p-3">
                      <div className="text-xs text-base-content/60 mb-1">Current Status</div>
                      <div className="font-semibold text-base-content capitalize flex items-center gap-2">
                        <span className={`badge ${getStatusBadgeClass(selectedSession.status)}`}>
                          {selectedSession.status}
                        </span>
                      </div>
                    </div>
                    <div className="bg-base-200 rounded-lg p-3">
                      <div className="text-xs text-base-content/60 mb-1">Questions</div>
                      <div className="font-semibold text-base-content">
                        {selectedSession.interview?.questions?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Participants Info */}
                  <div className="bg-base-200 rounded-lg p-4">
                    <h4 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Participants
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-base-content/70">Interviewer:</span>
                        <span className="font-semibold text-base-content">
                          {selectedSession.interviewer?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base-content/70">Candidate:</span>
                        <span className="font-semibold text-base-content">
                          {selectedSession.candidate?.name || 'Waiting...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="bg-base-200 rounded-lg p-3">
                    <div className="text-xs text-base-content/60 mb-1">Session Duration</div>
                    <div className="font-semibold text-base-content flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatSessionTime(selectedSession.duration || 0)}
                    </div>
                  </div>

                  {/* Questions Progress */}
                  {selectedSession.interview?.questions && (
                    <div className="bg-base-200 rounded-lg p-4">
                      <h4 className="font-semibold text-base-content mb-3">Question Progress</h4>
                      <div className="space-y-2">
                        {selectedSession.interview.questions.map((q, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-base-content/70">{idx + 1}. {q.title}</span>
                              <CheckCircle className="w-4 h-4 text-success" />
                            </div>
                            <div className="bg-base-300 rounded-full h-1.5">
                              <div className="bg-success h-1.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alerts */}
                  {selectedSession.status === 'idle' && (
                    <div className="alert alert-info">
                      <AlertCircle className="w-5 h-5" />
                      <span>Waiting for participants to connect...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-base-content/50">
                  <p className="text-center">Select a session to view details</p>
                </div>
              )}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="interview-resize-handle" />

        {/* ============ RIGHT PANEL: Session Controls ============ */}
        <Panel
          defaultSize={40}
          minSize={25}
          className="admin-controls-panel"
        >
          <div className="h-full flex flex-col bg-base-100 border-l border-base-300">
            {/* Controls Header */}
            <div className="px-4 py-4 border-b border-base-300 bg-gradient-to-r from-primary/20 to-transparent">
              <h2 className="font-bold text-base-content">Session Controls</h2>
            </div>

            {/* Controls Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedSession ? (
                <div className="space-y-4">
                  {/* Status Indicator */}
                  <div className="bg-base-200 rounded-lg p-4">
                    <h3 className="font-semibold text-base-content mb-3">Session Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-base-content/70">Status:</span>
                        <span className={`badge ${getStatusBadgeClass(selectedSession.status)}`}>
                          {selectedSession.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-base-content/70">Participants Connected:</span>
                        <span className="font-semibold">
                          {(selectedSession.interviewer ? 1 : 0) + (selectedSession.candidate ? 1 : 0)}/2
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-base-content text-sm">Actions</h3>

                    {selectedSession.status === 'active' && (
                      <>
                        <button
                          onClick={() => onPauseSession?.(selectedSession._id)}
                          className="btn btn-warning btn-block btn-sm gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          Pause Session
                        </button>
                      </>
                    )}

                    {selectedSession.status === 'paused' && (
                      <>
                        <button
                          onClick={() => onResumeSession?.(selectedSession._id)}
                          className="btn btn-info btn-block btn-sm gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resume Session
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onEndSession?.(selectedSession._id)}
                      className="btn btn-error btn-block btn-sm gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      End Session
                    </button>
                  </div>

                  {/* Session Info */}
                  <div className="bg-base-200 rounded-lg p-4">
                    <h3 className="font-semibold text-base-content mb-3 text-sm">Session Information</h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-base-content/60">Session ID:</span>
                        <p className="font-mono text-base-content/80 break-all">{selectedSession._id}</p>
                      </div>
                      <div className="pt-2 border-t border-base-300">
                        <span className="text-base-content/60">Created:</span>
                        <p className="text-base-content/80">
                          {new Date(selectedSession.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-base-content/50">
                  <p className="text-center">Select a session to manage</p>
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
 * Helper function to get status badge color
 */
function getStatusBadgeClass(status) {
  const classes = {
    'active': 'badge-success',
    'idle': 'badge-warning',
    'paused': 'badge-info',
    'completed': 'badge-primary',
    'cancelled': 'badge-error'
  };
  return classes[status] || 'badge-secondary';
}

/**
 * Helper function to format session duration
 */
function formatSessionTime(seconds) {
  if (!seconds) return '0m 0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${secs}s`;
}

/**
 * Helper function to calculate progress percentage
 */
function calculateProgress(session) {
  if (!session.interview?.questions) return 0;
  const total = session.interview.questions.length;
  const completed = session.completedQuestions || 0;
  return Math.round((completed / total) * 100);
}

export default AdminLayout;
