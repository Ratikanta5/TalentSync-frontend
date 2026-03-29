import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useUser } from '@clerk/clerk-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
  FilePlus2,
  FileText,
  Loader2,
  Loader2Icon,
  PhoneOffIcon,
  Play,
  Plus,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import CodeEditorPanel from '../components/CodeEditorPanel';
import OutputPanel from '../components/OutputPanel';
import { executeCode } from '../lib/piston';
import { StreamCall, StreamVideo } from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';
import { io } from 'socket.io-client';
import VideoCallUI from '../components/VideoCallUI';
import { initializeStreamClient, disconnectStreamClient } from '../lib/stream';

import '@stream-io/video-react-sdk/dist/css/styles.css';

const emptyDraft = {
  title: '',
  summary: '',
  level: 'medium',
  problemStatement: '',
  timer: 30,
};

const LANGUAGE_DEFAULT_SNIPPETS = {
  javascript: 'console.log("Hello from JavaScript");',
  python: 'print("Hello from Python")',
  java: `class Main {
  public static void main(String[] args) {
    System.out.println("Hello from Java");
  }
}`,
};

const normalizeQuestion = (question = {}) => ({
  ...question,
  summary: question.summary ?? question.description ?? '',
  level: question.level ?? question.difficulty ?? 'medium',
  timer: question.timer ?? question.timeLimit ?? 30,
});

const getApiErrorMessage = (error, fallbackMessage) => {
  const details = error?.response?.data?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details[0];
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

const getSocketServerUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;

  try {
    const parsedUrl = new URL(apiUrl);
    parsedUrl.pathname = '';
    parsedUrl.search = '';
    parsedUrl.hash = '';
    return parsedUrl.toString().replace(/\/$/, '');
  } catch {
    return apiUrl.replace(/\/api\/?$/, '');
  }
};

function QuestionSurface({ question }) {
  if (!question) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-base-content/50">
        Select a question to view its details.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="badge badge-primary badge-outline px-4 py-3 capitalize">
          {question.level || 'medium'}
        </div>
        <div className="badge badge-outline px-4 py-3">
          {question.timer || 30} min
        </div>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50">
          Short Summary
        </h3>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-base-content/85">
          {question.summary || 'No short summary was added for this question.'}
        </p>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50">
          Full Problem Statement
        </h3>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-base-content/85">
          {question.problemStatement || 'No detailed problem statement was added for this question.'}
        </p>
      </div>
    </div>
  );
}

function InterviewSessionPage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerRole, setViewerRole] = useState(null);

  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [codeByQuestion, setCodeByQuestion] = useState({});
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [questionDraft, setQuestionDraft] = useState(emptyDraft);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);
  const [isDeletingQuestionId, setIsDeletingQuestionId] = useState(null);
  const [isRefreshingQuestions, setIsRefreshingQuestions] = useState(false);

  const [streamClient, setStreamClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [call, setCall] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const initRunIdRef = useRef(0);
  const codeSyncTimeoutRef = useRef(null);
  const applyingRemoteCodeRef = useRef(false);
  const socketRef = useRef(null);
  const currentQuestionKeyRef = useRef('');
  const selectedLanguageRef = useRef('javascript');

  const getQuestionKey = (question, fallbackIndex = selectedQuestionIndex) => {
    if (question?._id) {
      return question._id;
    }

    return `question-${fallbackIndex}`;
  };

  const applyInterviewState = (interviewData) => {
    const nextQuestions = (interviewData.questions || []).map(normalizeQuestion);

    setViewerRole(interviewData.viewerRole || null);
    setInterview(interviewData);
    setQuestions(nextQuestions);
    setSelectedQuestionIndex((current) => {
      if (nextQuestions.length === 0) {
        return 0;
      }

      return Math.min(current, nextQuestions.length - 1);
    });
  };

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/interviews/${identifier}`);
        if (!response.data.success) {
          throw new Error('Failed to load interview data');
        }

        applyInterviewState(response.data.data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load interview'));
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchInterview();
    }
  }, [identifier, isLoaded, user]);

  const isInterviewer = viewerRole === 'interviewer';
  const currentQuestion = questions[selectedQuestionIndex] || null;
  const currentQuestionKey = getQuestionKey(currentQuestion);

  useEffect(() => {
    currentQuestionKeyRef.current = currentQuestionKey;
  }, [currentQuestionKey]);

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    const nextCode =
      codeByQuestion[currentQuestionKey]?.[selectedLanguage] ??
      LANGUAGE_DEFAULT_SNIPPETS[selectedLanguage] ??
      '';
    setCode(nextCode);
  }, [codeByQuestion, currentQuestionKey, selectedLanguage]);

  useEffect(() => {
    return () => {
      if (codeSyncTimeoutRef.current) {
        window.clearTimeout(codeSyncTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;
    let isCancelled = false;
    const currentRunId = ++initRunIdRef.current;

    const initCall = async () => {
      if (!interview?.streamCallId || interview.status !== 'active') {
        setIsInitializingCall(false);
        return;
      }

      try {
        const tokenResponse = await axios.get('/chat/token', { timeout: 15000 });
        const { token, videoToken, userId, userName, userImage } = tokenResponse.data || {};

        if (!token || !videoToken || !userId) {
          throw new Error('Missing Stream credentials');
        }

        const client = await initializeStreamClient(
          { id: userId, name: userName, image: userImage },
          videoToken
        );
        if (isCancelled || initRunIdRef.current !== currentRunId) return;
        setStreamClient(client);

        chatClientInstance = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
        await chatClientInstance.connectUser(
          { id: userId, name: userName, image: userImage },
          token
        );
        if (isCancelled || initRunIdRef.current !== currentRunId) {
          await chatClientInstance.disconnectUser().catch(() => {});
          return;
        }
        setChatClient(chatClientInstance);

        videoCall = client.call('default', interview.streamCallId);
        await videoCall.join({ create: true });
        if (isCancelled || initRunIdRef.current !== currentRunId) {
          await videoCall.leave().catch(() => {});
          return;
        }
        setCall(videoCall);

        const chatChannel = chatClientInstance.channel('messaging', interview.streamChannelId);
        try {
          await chatChannel.watch();
          if (!isCancelled && initRunIdRef.current === currentRunId) {
            setChannel(chatChannel);
          }
        } catch (watchError) {
          console.error('Chat watch failed:', watchError);
          setChannel(null);
          toast.error('Chat is unavailable for this interview');
        }
      } catch (streamError) {
        console.error('Stream init error:', streamError);
        toast.error(streamError?.message || 'Failed to join video call');
        setStreamClient(null);
        setChatClient(null);
        setChannel(null);
        setCall(null);
      } finally {
        if (!isCancelled && initRunIdRef.current === currentRunId) {
          setIsInitializingCall(false);
        }
      }
    };

    if (interview && !loading) {
      initCall();
    }

    return () => {
      isCancelled = true;
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      })();
    };
  }, [interview, loading]);

  const refreshInterview = async (nextInterview = null) => {
    if (nextInterview) {
      applyInterviewState(nextInterview);
      return;
    }

    const response = await axios.get(`/interviews/${identifier}`);
    if (response.data.success) {
      applyInterviewState(response.data.data);
    }
  };

  const broadcastCodeChange = (nextCode, nextLanguage = selectedLanguage) => {
    if (!socketRef.current || !interview?._id || !currentQuestionKey || !nextLanguage) {
      return;
    }

    if (applyingRemoteCodeRef.current) {
      return;
    }

    if (codeSyncTimeoutRef.current) {
      window.clearTimeout(codeSyncTimeoutRef.current);
    }

    codeSyncTimeoutRef.current = window.setTimeout(async () => {
      try {
        socketRef.current.emit('code:sync', {
          interviewId: interview._id,
          questionKey: currentQuestionKey,
          language: nextLanguage,
          code: nextCode,
        });
      } catch (syncError) {
        console.error('Code sync failed:', syncError);
      }
    }, 180);
  };

  const handleCodeChange = (value) => {
    const nextCode = value || '';

    setCode(nextCode);
    setCodeByQuestion((current) => ({
      ...current,
      [currentQuestionKey]: {
        ...(current[currentQuestionKey] || {}),
        [selectedLanguage]: nextCode,
      },
    }));

    broadcastCodeChange(nextCode, selectedLanguage);
  };

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    setSelectedLanguage(nextLanguage);
    setOutput(null);

    const nextCode =
      codeByQuestion[currentQuestionKey]?.[nextLanguage] ??
      LANGUAGE_DEFAULT_SNIPPETS[nextLanguage] ??
      '';
    broadcastCodeChange(nextCode, nextLanguage);
  };

  useEffect(() => {
    if (!interview?._id || !user?.id) {
      return undefined;
    }

    const socket = io(getSocketServerUrl(), {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('interview:join', {
        interviewId: interview._id,
        userId: user.id,
        userName: user.fullName || user.username || user.primaryEmailAddress?.emailAddress || 'User',
        role: isInterviewer ? 'interviewer' : 'candidate',
      });
    });

    socket.on('code:state', (payload) => {
      if (!payload || payload.interviewId !== interview._id || !payload.codes) {
        return;
      }

      applyingRemoteCodeRef.current = true;
      setCodeByQuestion(payload.codes);
      window.setTimeout(() => {
        applyingRemoteCodeRef.current = false;
      }, 0);
    });

    socket.on('code:update', (payload) => {
      if (!payload || payload.interviewId !== interview._id || payload.userId === user.id) {
        return;
      }

      const remoteQuestionKey = payload.questionKey;
      const nextLanguage = payload.language || 'javascript';
      const nextCode = payload.code || '';

      applyingRemoteCodeRef.current = true;
      setCodeByQuestion((current) => ({
        ...current,
        [remoteQuestionKey]: {
          ...(current[remoteQuestionKey] || {}),
          [nextLanguage]: nextCode,
        },
      }));

      if (remoteQuestionKey === currentQuestionKeyRef.current && nextLanguage === selectedLanguageRef.current) {
        setCode(nextCode);
      }

      window.setTimeout(() => {
        applyingRemoteCodeRef.current = false;
      }, 0);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [interview?._id, isInterviewer, user]);

  const handleReloadQuestions = async () => {
    try {
      setIsRefreshingQuestions(true);
      await refreshInterview();
      toast.success('Questions refreshed');
    } catch (refreshError) {
      toast.error(getApiErrorMessage(refreshError, 'Failed to refresh questions'));
    } finally {
      setIsRefreshingQuestions(false);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const result = await executeCode(selectedLanguage, code);
      setOutput(result);
    } catch (runError) {
      setOutput({ success: false, error: runError.message || 'Execution failed' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!questionDraft.title.trim()) {
      toast.error('Question title is required');
      return;
    }

    if (!questionDraft.summary.trim()) {
      toast.error('Short question summary is required');
      return;
    }

    if (!questionDraft.problemStatement.trim()) {
      toast.error('Full problem statement is required');
      return;
    }

    try {
      setIsAddingQuestion(true);
      const payload = {
        title: questionDraft.title.trim(),
        summary: questionDraft.summary.trim(),
        level: questionDraft.level,
        problemStatement: questionDraft.problemStatement.trim(),
        timer: questionDraft.timer,
      };

      const response = await axios.post(`/interviews/${interview._id}/questions`, payload);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add question');
      }

      const updatedInterview = response.data.data;
      await refreshInterview(updatedInterview);
      setQuestionDraft(emptyDraft);
      setSelectedQuestionIndex((updatedInterview.questions || []).length - 1);
      toast.success('Question added successfully');
    } catch (addError) {
      toast.error(getApiErrorMessage(addError, 'Failed to add question'));
    } finally {
      setIsAddingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      setIsDeletingQuestionId(questionId);
      const response = await axios.delete(`/interviews/${interview._id}/questions/${questionId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete question');
      }
      await refreshInterview(response.data.data);
      toast.success('Question deleted');
    } catch (deleteError) {
      toast.error(getApiErrorMessage(deleteError, 'Failed to delete question'));
    } finally {
      setIsDeletingQuestionId(null);
    }
  };

  const handleStartInterview = async () => {
    try {
      setIsStartingInterview(true);
      const response = await axios.post(`/interviews/${interview._id}/start`);
      if (!response.data.success) {
        throw new Error('Failed to start interview');
      }
      await refreshInterview(response.data.data);
      toast.success('Interview started successfully');
    } catch (startError) {
      toast.error(getApiErrorMessage(startError, 'Failed to start interview'));
    } finally {
      setIsStartingInterview(false);
    }
  };

  const handleEndInterview = async () => {
    try {
      const response = await axios.post(`/interviews/${interview._id}/end`);
      if (!response.data.success) {
        throw new Error('Failed to end interview');
      }
      toast.success('Interview ended successfully');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (endError) {
      toast.error(getApiErrorMessage(endError, 'Failed to end interview'));
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-base-content/70">Loading interview room...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-base-300 bg-base-100 p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-error">Error</h2>
            <p className="mt-3 text-base-content/70">{error || 'Interview not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (interview.status !== 'active') {
    return (
      <div className="h-screen bg-base-100 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-[2rem] border border-base-300 bg-gradient-to-br from-base-100 to-base-200 p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <FilePlus2 className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-3xl font-black">{interview.title}</h2>
            <p className="mt-3 text-base-content/70">{interview.description}</p>
            <p className="mt-4 text-sm text-base-content/50">
              Status: <span className="font-semibold capitalize">{interview.status}</span>
            </p>
            {isInterviewer ? (
              <button
                onClick={handleStartInterview}
                disabled={isStartingInterview}
                className="btn btn-primary btn-lg mt-8 w-full gap-2"
              >
                {isStartingInterview ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                {isStartingInterview ? 'Starting...' : 'Start Interview'}
              </button>
            ) : (
              <p className="mt-8 text-sm text-base-content/60">
                Waiting for the interviewer to start the session.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={34} minSize={24}>
            <div className="flex h-full min-h-0 flex-col border-r border-base-300 bg-gradient-to-b from-base-100 to-base-200">
              <div className="border-b border-base-300 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-base-content/45">
                      Question Workspace
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-base-content">
                      {currentQuestion?.title || 'Interview Questions'}
                    </h2>
                  </div>
                  <div className="badge badge-outline badge-lg">
                    {isInterviewer ? 'Interviewer' : 'Candidate'}
                  </div>
                </div>

                {!isInterviewer && (
                  <div className="mt-4">
                    <button
                      onClick={handleReloadQuestions}
                      disabled={isRefreshingQuestions}
                      className="btn btn-outline btn-sm gap-2"
                    >
                      {isRefreshingQuestions ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCcw className="h-4 w-4" />
                      )}
                      Reload New Questions
                    </button>
                  </div>
                )}

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {questions.map((question, index) => (
                    <button
                      key={question._id || index}
                      onClick={() => setSelectedQuestionIndex(index)}
                      className={`flex min-w-[92px] shrink-0 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                        selectedQuestionIndex === index
                          ? 'border-primary bg-primary text-primary-content'
                          : 'border-base-300 bg-base-100 text-base-content hover:border-primary/40 hover:bg-base-200'
                      }`}
                    >
                      <span>{index + 1}</span>
                      <FileText className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto bg-base-200">
                {currentQuestion ? (
                  <QuestionSurface question={currentQuestion} />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-center text-base-content/55">
                    No question added yet.
                  </div>
                )}
              </div>

              {isInterviewer && (
                <div className="border-t border-base-300 bg-base-100 p-4">
                  <div className="rounded-3xl border border-base-300 bg-base-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-base-content">Add Question</h3>
                        <p className="text-xs text-base-content/55">
                          Keep it simple: title, level, timer, summary, and full statement.
                        </p>
                      </div>
                      <button
                        onClick={handleAddQuestion}
                        disabled={isAddingQuestion}
                        className="btn btn-primary btn-sm gap-2"
                      >
                        {isAddingQuestion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Add
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <input
                        value={questionDraft.title}
                        onChange={(event) => setQuestionDraft((current) => ({ ...current, title: event.target.value }))}
                        className="input input-bordered w-full"
                        placeholder="Question title"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={questionDraft.level}
                          onChange={(event) => setQuestionDraft((current) => ({ ...current, level: event.target.value }))}
                          className="select select-bordered w-full"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                        <input
                          type="number"
                          min="1"
                          max="180"
                          value={questionDraft.timer}
                          onChange={(event) =>
                            setQuestionDraft((current) => ({
                              ...current,
                              timer: Math.max(1, Number(event.target.value) || 30),
                            }))
                          }
                          className="input input-bordered w-full"
                          placeholder="Timer (min)"
                        />
                      </div>

                      <textarea
                        value={questionDraft.summary}
                        onChange={(event) => setQuestionDraft((current) => ({ ...current, summary: event.target.value }))}
                        className="textarea textarea-bordered min-h-24 w-full"
                        placeholder="Short question summary"
                      />

                      <textarea
                        value={questionDraft.problemStatement}
                        onChange={(event) => setQuestionDraft((current) => ({ ...current, problemStatement: event.target.value }))}
                        className="textarea textarea-bordered min-h-36 w-full"
                        placeholder="Full problem statement"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          <Panel defaultSize={41} minSize={28}>
            <div className="flex h-full min-h-0 flex-col bg-base-200">
              <div className="border-b border-base-300 bg-base-100 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-base-content">
                      {currentQuestion?.title || 'Code Workspace'}
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Use the prompt on the left and code your solution here.
                    </p>
                  </div>
                  {isInterviewer && currentQuestion?._id && (
                    <button
                      onClick={() => handleDeleteQuestion(currentQuestion._id)}
                      disabled={isDeletingQuestionId === currentQuestion._id}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      {isDeletingQuestionId === currentQuestion._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <PanelGroup direction="vertical" className="flex-1 min-h-0">
                <Panel defaultSize={68} minSize={35}>
                  <CodeEditorPanel
                    selectedLanguage={selectedLanguage}
                    code={code}
                    isRunning={isRunning}
                    onLanguageChange={handleLanguageChange}
                    onCodeChange={handleCodeChange}
                    onRunCode={handleRunCode}
                    availableLanguages={['javascript', 'python', 'java']}
                  />
                </Panel>

                <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                <Panel defaultSize={32} minSize={18}>
                  <OutputPanel output={output} />
                </Panel>
              </PanelGroup>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          <Panel defaultSize={25} minSize={20}>
            <div className="flex h-full min-h-0 flex-col border-l border-base-300 bg-base-100">
              <div className="flex items-center justify-between border-b border-base-300 bg-gradient-to-r from-primary/20 to-transparent px-4 py-3">
                <h2 className="font-bold text-base-content">Live Interview</h2>
                {isInterviewer && (
                  <button onClick={handleEndInterview} className="btn btn-error btn-xs">
                    End Interview
                  </button>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                {isInitializingCall ? (
                  <div className="flex h-full items-center justify-center bg-base-200">
                    <div className="text-center">
                      <Loader2Icon className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
                      <p className="text-base-content/70">Connecting to video call...</p>
                    </div>
                  </div>
                ) : !streamClient || !call ? (
                  <div className="flex h-full items-center justify-center bg-base-200 p-4">
                    <div className="w-full max-w-sm rounded-3xl border border-base-300 bg-base-100 p-6 text-center shadow-xl">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
                        <PhoneOffIcon className="h-7 w-7 text-error" />
                      </div>
                      <h3 className="text-lg font-bold">Connection Failed</h3>
                      <p className="mt-2 text-sm text-base-content/65">Unable to connect to the video call.</p>
                    </div>
                  </div>
                ) : (
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI
                        key="interview-session-video-call"
                        chatClient={chatClient}
                        channel={channel}
                        userRole={isInterviewer ? 'interviewer' : 'candidate'}
                      />
                    </StreamCall>
                  </StreamVideo>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default InterviewSessionPage;
