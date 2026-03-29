import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUser } from '@clerk/clerk-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import Navbar from './Navbar';
import InterviewerLayout from './layouts/InterviewerLayout';
import CandidateLayout from './layouts/CandidateLayout';
import AdminLayout from './layouts/AdminLayout';
import { executeCode } from '../lib/piston';
import { StreamCall, StreamVideo } from '@stream-io/video-react-sdk';
import useStreamClient from '../hooks/useStreamClient';
import '../styles/interview-layout.css';

/**
 * InterviewDashboard Component
 * 
 * Main wrapper component that handles:
 * - Role-based rendering (Interviewer, Candidate, Admin)
 * - Interview session management
 * - Code execution
 * - Video call integration
 * - Timer management
 */
function InterviewDashboard() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  // ============ STATE: Interview & Session ============
  const [interview, setInterview] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'interviewer', 'candidate', 'admin'

  // ============ STATE: Questions & Code ============
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // ============ STATE: Timer ============
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // ============ STATE: Stream.io ============
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const [isChatInitialized, setIsChatInitialized] = useState(false);

  // Stream client hook
  const {
    call,
    channel,
    chatClient,
    streamClient,
    error: streamError
  } = useStreamClient(session, loading, userRole === 'interviewer', userRole === 'candidate');

  // ============ FETCH: Interview Data ============
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch interview
        const interviewRes = await axios.get(`/interviews/${identifier}`);
        if (!interviewRes.data.success) throw new Error('Failed to load interview');

        const interviewData = interviewRes.data.data;
        setInterview(interviewData);
        setQuestions(interviewData.questions || []);

        if (interviewData.questions?.length > 0) {
          const firstQuestion = interviewData.questions[0];
          setCode(firstQuestion.starterCode || '');
          setTimeRemaining(firstQuestion.timeLimit * 60 || 1800);
        }

        // Determine user role
        if (!user) return;

        let role = null;
        if (interviewData.createdBy?._id === user.id || interviewData.createdBy === user.id) {
          role = 'interviewer';
        } else if (user.id === 'admin-user-id') {
          role = 'admin';
        } else {
          role = 'candidate';
        }

        setUserRole(role);

        // Try to fetch or create session
        try {
          const sessionRes = await axios.get(`/sessions?interviewId=${interviewData._id}`);
          if (sessionRes.data.success && sessionRes.data.data.length > 0) {
            setSession(sessionRes.data.data[0]);
          } else {
            // Create new session for candidate
            if (role === 'candidate') {
              const newSessionRes = await axios.post('/sessions', {
                interview: interviewData._id
              });
              if (newSessionRes.data.success) {
                setSession(newSessionRes.data.data);
              }
            }
          }
        } catch (sessionErr) {
          console.log('Session fetch/create handled:', sessionErr.message);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load interview';
        setError(errorMsg);
        toast.error(errorMsg);
        console.error('Error fetching interview:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchData();
    }
  }, [identifier, isLoaded, user]);

  // ============ HANDLER: Question Selection ============
  const handleSelectQuestion = (index) => {
    setSelectedQuestionIndex(index);
    const question = questions[index];
    setCode(question.starterCode || '');
    setTimeRemaining(question.timeLimit * 60 || 1800);
    setIsTimerRunning(false);
    setOutput(null);
    setTestResults(null);
  };

  // ============ HANDLER: Language Change ============
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    const question = questions[selectedQuestionIndex];
    if (question?.starterCode?.[newLang]) {
      setCode(question.starterCode[newLang]);
    }
  };

  // ============ HANDLER: Code Execution ============
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const result = await executeCode(selectedLanguage, code);
      setOutput(result);

      // Check if tests pass (if available)
      const question = questions[selectedQuestionIndex];
      if (question?.testCases) {
        // TODO: Implement test case validation
        setTestResults({ passed: result.includes('success'), output: result });
      }
    } catch (err) {
      setOutput({ error: err.message || 'Code execution failed' });
    } finally {
      setIsRunning(false);
    }
  };

  // ============ HANDLER: Submit Code ============
  const handleSubmitCode = async () => {
    try {
      const question = questions[selectedQuestionIndex];
      const submitRes = await axios.post(`/sessions/${session._id}/submit`, {
        questionId: question._id,
        code,
        language: selectedLanguage
      });

      if (submitRes.data.success) {
        toast.success('Solution submitted!');
        // Move to next question or complete interview
        if (selectedQuestionIndex < questions.length - 1) {
          handleSelectQuestion(selectedQuestionIndex + 1);
        } else {
          toast.success('Interview completed!');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit solution');
    }
  };

  // ============ HANDLER: Timer ============
  const handleStartTimer = (duration) => {
    if (isTimerRunning) return;
    setTimeRemaining(duration);
    setIsTimerRunning(true);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
  };

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning) {
      clearInterval(timerInterval);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          toast.error('Time is up!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // ============ HANDLER: Add Question (Interviewer Only) ============
  const handleAddQuestion = async () => {
    // TODO: Open modal to add new question
    toast.info('Add question feature coming soon');
  };

  const handleEditQuestion = async (index) => {
    // TODO: Open modal to edit question
    toast.info('Edit question feature coming soon');
  };

  const handleDeleteQuestion = async (index) => {
    // TODO: Confirm and delete question
    toast.info('Delete question feature coming soon');
  };

  // ============ RENDER: Loading State ============
  if (loading || !userRole || isInitializingCall) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-base-content">Loading interview dashboard...</p>
          <p className="text-sm text-base-content/60 mt-2">Role: {userRole || 'detecting...'}</p>
        </div>
      </div>
    );
  }

  // ============ RENDER: Error State ============
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="alert alert-error max-w-md">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // ============ RENDER: Role-Based Layouts ============
  const selectedQuestion = questions[selectedQuestionIndex];

  return (
    <div className="interview-dashboard">
      {userRole === 'interviewer' && (
        <StreamVideo client={streamClient}>
          <StreamCall call={call}>
            <InterviewerLayout
              interview={interview}
              questions={questions}
              selectedQuestionIndex={selectedQuestionIndex}
              onSelectQuestion={handleSelectQuestion}
              onAddQuestion={handleAddQuestion}
              onEditQuestion={handleEditQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              selectedLanguage={selectedLanguage}
              code={code}
              onLanguageChange={handleLanguageChange}
              onCodeChange={setCode}
              onRunCode={handleRunCode}
              isRunning={isRunning}
              output={output}
              timeRemaining={timeRemaining}
              isTimerRunning={isTimerRunning}
              onStartTimer={handleStartTimer}
              onStopTimer={handleStopTimer}
              call={call}
              channel={channel}
              chatClient={chatClient}
              isInitializingCall={isInitializingCall}
              streamClient={streamClient}
            />
          </StreamCall>
        </StreamVideo>
      )}

      {userRole === 'candidate' && (
        <StreamVideo client={streamClient}>
          <StreamCall call={call}>
            <CandidateLayout
              interview={interview}
              selectedQuestion={selectedQuestion}
              selectedLanguage={selectedLanguage}
              code={code}
              onLanguageChange={handleLanguageChange}
              onCodeChange={setCode}
              onRunCode={handleRunCode}
              isRunning={isRunning}
              output={output}
              testResults={testResults}
              timeRemaining={timeRemaining}
              isTimerRunning={isTimerRunning}
              onSubmitCode={handleSubmitCode}
              call={call}
              channel={channel}
              chatClient={chatClient}
              isInitializingCall={isInitializingCall}
              streamClient={streamClient}
            />
          </StreamCall>
        </StreamVideo>
      )}

      {userRole === 'admin' && (
        <AdminLayout
          activeSessions={[]}
          selectedSession={null}
          onSelectSession={() => {}}
          analytics={{ totalCompleted: 0 }}
          onEndSession={() => {}}
          onPauseSession={() => {}}
          onResumeSession={() => {}}
        />
      )}
    </div>
  );
}

export default InterviewDashboard;
