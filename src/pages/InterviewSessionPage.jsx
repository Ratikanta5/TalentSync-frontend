import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUser } from '@clerk/clerk-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Loader2, Play, Check, X, PhoneOffIcon, Loader2Icon } from 'lucide-react';
import CodeEditorPanel from '../components/CodeEditorPanel';
import { executeCode } from '../lib/piston';

// Stream.io imports - SAME pattern as working SessionPage
import { StreamCall, StreamVideo } from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';
import VideoCallUI from '../components/VideoCallUI';
import { initializeStreamClient, disconnectStreamClient } from '../lib/stream';

import '@stream-io/video-react-sdk/dist/css/styles.css';

function InterviewSessionPage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  // Interview and session state
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Code editor state
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionTimer, setNewQuestionTimer] = useState(0);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Timer state for current question
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Stream.io integration - SAME pattern as useStreamClient hook
  const [streamClient, setStreamClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [call, setCall] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  // Fetch interview details
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/interviews/${identifier}`);

        if (response.data.success) {
          const interviewData = response.data.data;
          console.log('📋 Fetched interview:', {
            id: interviewData._id,
            status: interviewData.status,
            streamCallId: interviewData.streamCallId,
            streamChannelId: interviewData.streamChannelId
          });
          setInterview(interviewData);
          setQuestions(interviewData.questions || []);

          if (interviewData.questions && interviewData.questions.length > 0) {
            setCode(interviewData.questions[0].starterCode || '');
          }
        } else {
          setError('Failed to load interview data');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load interview';
        setError(errorMsg);
        console.error('Error fetching interview:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchInterview();
    }
  }, [identifier, isLoaded, user]);

  // Initialize Stream.io clients - SAME PATTERN AS useStreamClient hook
  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      // Must have streamCallId to initialize
      if (!interview?.streamCallId) {
        console.log('⏳ No streamCallId yet, waiting...');
        setIsInitializingCall(false);
        return;
      }

      // Interview must be active
      if (interview.status !== 'active') {
        console.log('⏳ Interview not active yet, status:', interview.status);
        setIsInitializingCall(false);
        return;
      }

      try {
        console.log('🚀 Initializing Stream.io with callId:', interview.streamCallId);

        // Get tokens from backend with extended timeout
        console.log('📡 Calling /chat/token endpoint...');
        let tokenResponse;
        try {
          tokenResponse = await axios.get('/chat/token', { timeout: 15000 }); // Increased from default to 15s
          console.log('📡 Token response received');
          console.log('   Status:', tokenResponse.status);
          console.log('   Data keys:', Object.keys(tokenResponse.data));
          console.log('   Has token:', !!tokenResponse.data.token);
          console.log('   Has videoToken:', !!tokenResponse.data.videoToken);
          console.log('   Has userId:', !!tokenResponse.data.userId);
        } catch (tokenError) {
          console.error('❌ Failed to fetch token from API:', {
            message: tokenError.message,
            status: tokenError.response?.status,
            data: tokenError.response?.data,
            timeout: tokenError.code === 'ECONNABORTED',
            fullResponse: tokenError.response
          });
          throw new Error(`Token API error (${tokenError.response?.status}): ${tokenError.response?.data?.message || tokenError.message}`);
        }
        
        const tokenData = tokenResponse.data || tokenResponse;
        console.log('📋 Parsing token data:', {
          keys: Object.keys(tokenData),
          hasToken: !!tokenData.token,
          hasVideoToken: !!tokenData.videoToken,
          hasUserId: !!tokenData.userId
        });
        
        const { token, videoToken, userId, userName, userImage } = tokenData;
        
        if (!token || !videoToken || !userId) {
          console.error('❌ Missing token data:', {
            token: token ? 'present' : 'MISSING',
            videoToken: videoToken ? 'present' : 'MISSING',
            userId: userId ? 'present' : 'MISSING',
            fullData: tokenData
          });
          throw new Error(`Missing token data: token=${!!token}, videoToken=${!!videoToken}, userId=${!!userId}`);
        }
        
        console.log('✅ Got Stream tokens for user:', userId);
        console.log('🔍 Token validation:', {
          tokenPresent: !!token,
          tokenLength: token?.length,
          videoTokenPresent: !!videoToken,
          videoTokenLength: videoToken?.length,
          userId,
          userName
        });

        // Validate tokens before proceeding
        if (!token || typeof token !== 'string') {
          throw new Error(`Invalid chat token: ${typeof token}, length: ${token?.length}`);
        }
        if (!videoToken || typeof videoToken !== 'string') {
          throw new Error(`Invalid video token: ${typeof videoToken}, length: ${videoToken?.length}`);
        }

        // Decode and validate token contents for debugging (tokens are JWTs)
        const validateJWT = (token, name) => {
          const parts = token.split('.');
          if (parts.length !== 3) {
            throw new Error(`${name} has invalid JWT structure: ${parts.length} parts instead of 3`);
          }
          try {
            const payload = JSON.parse(atob(parts[1]));
            return payload;
          } catch (e) {
            throw new Error(`${name} payload cannot be decoded: ${e.message}`);
          }
        };
        
        let videoTokenPayload;
        try {
          videoTokenPayload = validateJWT(videoToken, 'Video token');
          console.log('✅ Video token decoded successfully:', {
            user_id: videoTokenPayload?.user_id,
            sub: videoTokenPayload?.sub,
            call_cids: videoTokenPayload?.call_cids,
            role: videoTokenPayload?.role || 'default',
            iat: videoTokenPayload?.iat ? new Date(videoTokenPayload.iat * 1000).toISOString() : 'N/A',
            exp: videoTokenPayload?.exp ? new Date(videoTokenPayload.exp * 1000).toISOString() : 'N/A'
          });
        } catch (decodeError) {
          console.error('❌ Failed to decode video token:', decodeError.message);
          throw decodeError;
        }

        // Check for token expiration or mismatch
        if (!videoTokenPayload.user_id && !videoTokenPayload.sub) {
          throw new Error('Video token has no user_id or sub claim - cannot identify user');
        }
        if (!videoTokenPayload.call_cids) {
          console.warn('⚠️ Video token missing call_cids - may not work');
        }

        // Initialize Stream Video client with VIDEO token (using same lib/stream.js pattern)
        console.log('📹 Initializing Stream video client...');
        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          videoToken
        );
        console.log('✅ StreamVideoClient initialized');
        console.log('   Client exists:', !!client);
        console.log('   Client.user:', client?.user);
        console.log('   Client.userId:', client?.userId);

        setStreamClient(client);
        
        // Give client extra time to fully settle
        console.log('⏳ Waiting 500ms for client to settle...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Initialize Stream Chat client with CHAT token BEFORE joining call
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        console.log('🔗 Connecting chat client with token...');
        try {
          await chatClientInstance.connectUser(
            {
              id: userId,
              name: userName,
              image: userImage,
            },
            token
          );
          setChatClient(chatClientInstance);
          console.log('✅ Chat client connected successfully and token verified');
        } catch (chatError) {
          console.error('❌ Failed to connect chat client:', {
            message: chatError.message,
            code: chatError.code,
            token: token ? `${token.substring(0, 20)}...` : 'MISSING'
          });
          throw new Error(`Chat connection failed: ${chatError.message}`);
        }

        // Add a small delay to ensure chat client is fully connected
        await new Promise(resolve => setTimeout(resolve, 500));

        // Now join the video call AFTER chat is fully connected
        console.log('📞 Preparing to join video call:', interview.streamCallId);
        console.log('🔐 Pre-join validation:', {
          hasClient: !!client,
          clientUserId: client?.user?.id,
          requestedUserId: userId,
          userIdMatch: client?.user?.id === userId,
          tokenLength: videoToken?.length
        });
        
        // Ensure client exists
        if (!client) {
          throw new Error('StreamVideoClient is not initialized');
        }
        
        // Don't check user.id here - let the SDK initialize it during join
        console.log('📊 Ready to join - client state:', {
          clientExists: !!client,
          userId: client?.user?.id,
          callId: interview.streamCallId,
        });
        
        videoCall = client.call('default', interview.streamCallId);
        console.log('📞 Call object created, attempting to join...');
        
        try {
          console.log('📞 Joining call with 30s timeout...');
          
          // Wrap join with timeout to catch hanging connections
          const joinPromise = videoCall.join({ create: true });
          
          const joinWithTimeout = Promise.race([
            joinPromise,
            new Promise((_, reject) => {
              const timeoutId = setTimeout(() => {
                reject(new Error('Video call join timed out after 30s - possible WebSocket connection issue'));
              }, 30000);
              
              // Clear timeout if join completes
              joinPromise.finally(() => clearTimeout(timeoutId));
            })
          ]);
          
          await joinWithTimeout;
          setCall(videoCall);
          console.log('✅ Successfully joined video call:', interview.streamCallId);
          
        } catch (joinError) {
          console.error('❌ FAILED TO JOIN VIDEO CALL');
          
          // Detailed error logging for different failure types
          const isWebSocketError = joinError.message?.includes('SFU WS connection') || 
                                   joinError.message?.includes('WebSocket') ||
                                   joinError.message?.includes('connection failed');
          
          console.error('Error Details:', {
            message: joinError.message,
            code: joinError.code,
            stack: joinError.stack,
            type: isWebSocketError ? 'WebSocket Connection' : 'Other',
            timestamp: new Date().toISOString()
          });
          
          console.error('Context:', {
            callId: interview.streamCallId,
            userId: userId,
            clientUserId: client?.user?.id,
            clientInitialized: !!client,
            clientAuthenticated: client?.state?.isAuthenticated,
            clientType: client?.constructor?.name,
          });
          
          // Provide actionable suggestions for WebSocket errors
          if (isWebSocketError) {
            console.error('🔍 WebSocket Connection Issue Detected:');
            console.error('   - Check your internet connection');
            console.error('   - Verify Stream.io API key is correct');
            console.error('   - Check if firewall blocks WebSocket (WSS) connections');
            console.error('   - Try refreshing the page and joining again');
          }
          
          throw joinError;
        }

        // Watch chat channel - user should be a member from join endpoint
        console.log('💬 Watching chat channel:', interview.streamChannelId);
        const chatChannel = chatClientInstance.channel('messaging', interview.streamChannelId);
        
        try {
          await chatChannel.watch();
          setChannel(chatChannel);
          console.log('✅ Watching chat channel:', interview.streamChannelId);
        } catch (watchError) {
          // If permission denied, log detailed info for debugging
          console.error('❌ Failed to watch channel:', {
            message: watchError.message,
            code: watchError.code,
            channelId: interview.streamChannelId,
            userId: userId
          });
          // Still set the channel even if watch failed - messages might still work
          setChannel(chatChannel);
          // Don't necessarily fail - continue anyway
        }

        toast.success('Connected to video call!');
      } catch (error) {
        const errorMsg = error?.message || String(error);
        const isWSError = errorMsg.includes('WS') || 
                          errorMsg.includes('WebSocket') || 
                          errorMsg.includes('connection could not');
        
        console.error('❌ Error initializing Stream:', error);
        console.error('   Message:', errorMsg);
        console.error('   WebSocket Issue:', isWSError);
        
        // Show detailed error to user
        const displayMsg = isWSError 
          ? 'WebSocket connection failed - check your internet and firewall settings'
          : 'Failed to join video call';
        
        toast.error(displayMsg);
        
        // Log diagnostic suggestions
        if (errorMsg.includes('initial WS connection')) {
          console.error('\n⚠️ WebSocket Connection Could Not Be Established');
          console.error('   This usually means:');
          console.error('   1. Firewall or proxy is blocking WebSocket connections');
          console.error('   2. Network is unreliable or offline');
          console.error('   3. Stream.io service is unavailable');
          console.error('   4. Invalid or expired token');
          console.error('\n   Try: Refresh page, check internet, disable VPN/proxy');
        }
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (interview && !loading) {
      initCall();
    }

    // Cleanup
    return () => {
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      })();
    };
  }, [interview, loading]);

  // Timer effect for current question
  useEffect(() => {
    const currentQuestion = questions[selectedQuestionIndex];
    if (currentQuestion?.timeLimit) {
      setTimeRemaining(currentQuestion.timeLimit * 60);
      setIsTimerRunning(true);
    } else {
      setTimeRemaining(0);
      setIsTimerRunning(false);
    }
  }, [selectedQuestionIndex, questions]);

  // Countdown timer
  useEffect(() => {
    if (!isTimerRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          toast.error('Time is up for this question!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setTestResults(null);

    try {
      const result = await executeCode(selectedLanguage, code);
      setOutput(result);

      if (questions[selectedQuestionIndex]?.testCases) {
        runTestCases(result);
      }
    } catch (err) {
      setOutput({ error: 'Execution failed' });
    } finally {
      setIsRunning(false);
    }
  };

  const runTestCases = async (executionResult) => {
    const question = questions[selectedQuestionIndex];
    if (!question?.testCases) return;

    try {
      const results = [];
      for (const testCase of question.testCases) {
        const passed = executionResult.output?.includes(testCase.expectedOutput);
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          passed,
          status: passed ? 'PASSED' : 'FAILED'
        });
      }
      setTestResults(results);
    } catch (err) {
      console.error('Error running tests:', err);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestionTitle.trim()) {
      toast.error('Question title is required');
      return;
    }

    try {
      setIsAddingQuestion(true);
      const response = await axios.post(`/interviews/${interview._id}/questions`, {
        title: newQuestionTitle,
        description: '',
        difficulty: 'medium',
        timeLimit: newQuestionTimer || 0,
        language: 'javascript'
      });

      if (response.data.success) {
        setQuestions(response.data.data.questions || []);
        setNewQuestionTitle('');
        setNewQuestionTimer(0);
        toast.success('Question added successfully!');
      }
    } catch (err) {
      toast.error('Failed to add question');
      console.error('Error adding question:', err);
    } finally {
      setIsAddingQuestion(false);
    }
  };

  const handleStartInterview = async () => {
    try {
      setIsStartingInterview(true);
      const response = await axios.post(`/interviews/${interview._id}/start`);

      if (response.data.success) {
        setInterview(response.data.data);
        toast.success('Interview started successfully!');
      }
    } catch (err) {
      toast.error('Failed to start interview');
      console.error('Error starting interview:', err);
    } finally {
      setIsStartingInterview(false);
    }
  };

  const handleEndInterview = async () => {
    try {
      const response = await axios.post(`/interviews/${interview._id}/end`);

      if (response.data.success) {
        toast.success('Interview ended successfully!');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      toast.error('Failed to end interview');
      console.error('Error ending interview:', err);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <div className="container mx-auto px-6 py-12 flex items-center justify-center">
          <div className="card bg-base-200 shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-base-content/70 mb-6">Please sign in to access interview sessions.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <div className="container mx-auto px-6 py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-base-content/70">Loading interview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <div className="container mx-auto px-6 py-12 flex items-center justify-center">
          <div className="card bg-base-200 shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-error">Error</h2>
            <p className="text-base-content/70 mb-6">{error || 'Interview not found'}</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary w-full">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[selectedQuestionIndex];

  // Show start interview screen if interview hasn't started
  if (interview && interview.status !== 'active') {
    return (
      <div className="h-screen bg-base-100 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="card bg-base-200 shadow-xl p-12 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl">🎥</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">{interview.title}</h2>
            <p className="text-base-content/70 mb-2">{interview.description}</p>
            <p className="text-sm text-base-content/50 mb-8">Status: <span className="font-semibold capitalize">{interview.status}</span></p>
            
            {interview.status === 'draft' && (
              <button
                onClick={handleStartInterview}
                disabled={isStartingInterview}
                className="btn btn-primary btn-lg w-full gap-2"
              >
                {isStartingInterview ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Interview
                  </>
                )}
              </button>
            )}
            
            {interview.status !== 'draft' && (
              <p className="text-sm text-base-content/60">This interview cannot be started in its current state.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - Questions List */}
          <Panel defaultSize={30} minSize={25}>
            <div className="h-full overflow-y-auto bg-base-200">
            <div className="p-4 bg-base-100 border-b border-base-300">
              <h3 className="font-bold text-lg">📚 Problems ({questions.length})</h3>
            </div>
            <div className="p-3 space-y-2">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedQuestionIndex(idx);
                    setCode(q.starterCode || '');
                    setOutput(null);
                    setTestResults(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                    selectedQuestionIndex === idx
                      ? 'bg-primary text-primary-content'
                      : 'bg-base-100 hover:bg-base-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1">{q.title}</span>
                    {q.timeLimit > 0 && (
                      <span className={`badge badge-sm ml-2 ${
                        selectedQuestionIndex === idx ? 'badge-primary-content' : 'badge-warning'
                      }`}>
                        ⏱ {q.timeLimit}m
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Add Question Form */}
            <div className="p-3 bg-base-100 border-t border-base-300 space-y-2">
              <input
                type="text"
                value={newQuestionTitle}
                onChange={(e) => setNewQuestionTitle(e.target.value)}
                placeholder="Add new problem..."
                className="input input-bordered input-sm w-full"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={newQuestionTimer}
                  onChange={(e) => setNewQuestionTimer(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Timer (min)"
                  className="input input-bordered input-sm flex-1"
                />
                <button
                  onClick={handleAddQuestion}
                  disabled={isAddingQuestion}
                  className="btn btn-success btn-sm"
                >
                  {isAddingQuestion ? '...' : '+ Add'}
                </button>
              </div>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

        {/* MIDDLE PANEL - Code Editor */}
        <Panel defaultSize={45} minSize={30}>
          <div className="h-full flex flex-col bg-base-200">
                  {currentQuestion ? (
                    <>
                      {/* Question Header */}
                      <div className="p-4 bg-base-100 border-b border-base-300">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="font-bold text-xl">{currentQuestion.title}</h2>
                          <div className="flex gap-2 items-center">
                            {currentQuestion.timeLimit > 0 && (
                              <span className={`badge ${
                                timeRemaining > 60 ? 'badge-info' :
                                timeRemaining > 0 ? 'badge-warning' : 'badge-error'
                              }`}>
                                ⏱ {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                              </span>
                            )}
                            <span className={`badge ${
                              currentQuestion.difficulty === 'easy' ? 'badge-success' :
                              currentQuestion.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                            }`}>
                              {currentQuestion.difficulty}
                            </span>
                          </div>
                        </div>
                        {currentQuestion.description && (
                          <p className="text-base-content/70 text-sm">{currentQuestion.description}</p>
                        )}
                      </div>

                      {/* Language & Run */}
                      <div className="p-3 bg-base-100 border-b border-base-300 flex items-center justify-between">
                        <select
                          value={selectedLanguage}
                          onChange={(e) => {
                            setSelectedLanguage(e.target.value);
                            setOutput(null);
                          }}
                          className="select select-bordered select-sm"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                        </select>
                        <button
                          onClick={handleRunCode}
                          disabled={isRunning}
                          className="btn btn-success btn-sm gap-2"
                        >
                          <Play className="w-4 h-4" />
                          {isRunning ? 'Running...' : 'Run Code'}
                        </button>
                      </div>

                      {/* Code Editor */}
                      <div className="flex-1 overflow-hidden">
                        <CodeEditorPanel
                          code={code}
                          setCode={setCode}
                          language={selectedLanguage}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-base-content/60">Select a problem to start coding</p>
                    </div>
                  )}
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

        {/* RIGHT PANEL - Video Call & Chat */}
        <Panel defaultSize={25} minSize={20}>
          <div className="h-full bg-base-100 border-l border-base-300 flex flex-col">
            {/* Video Call Header */}
            <div className="px-4 py-3 border-b border-base-300 bg-gradient-to-r from-primary/20 to-transparent flex items-center justify-between">
              <h2 className="font-bold text-base-content">🎥 Video Call</h2>
              <button
                onClick={handleEndInterview}
                className="btn btn-error btn-xs gap-1"
                title="End the interview session"
              >
                End Interview
              </button>
            </div>

            {/* Video Call Area */}
            <div className="flex-1 overflow-hidden">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center bg-base-200">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="h-full flex items-center justify-center bg-base-200">
                  <div className="card bg-base-100 shadow-xl max-w-sm mx-4">
                    <div className="card-body items-center text-center">
                      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <PhoneOffIcon className="w-8 h-8 text-error" />
                      </div>
                      <h2 className="card-title text-lg">Connection Failed</h2>
                      <p className="text-sm text-base-content/70">Unable to connect to video call</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI key="session-video-call" chatClient={chatClient} channel={channel} userRole="interviewer" />
                    </StreamCall>
                  </StreamVideo>
                </div>
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
