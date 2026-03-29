import { useState, useEffect } from 'react';
import InterviewTopBar from '../components/interview/InterviewTopBar';
import InterviewerQuestionsPanel from '../components/interview/InterviewerQuestionsPanel';
import CandidateQuestionPanel from '../components/interview/CandidateQuestionPanel';
import CodeEditor from '../components/interview/CodeEditor';
import CommunicationPanel from '../components/interview/CommunicationPanel';

/**
 * TechnicalInterviewPage
 * Main interview page supporting both Interviewer and Candidate views
 */
function TechnicalInterviewPage() {
  // State Management
  const [userRole, setUserRole] = useState('interviewer'); // 'interviewer' or 'candidate'
  const [timeRemaining, setTimeRemaining] = useState('30:00');
  const [candidateStatus, setCandidateStatus] = useState('IDLE');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  
  // Questions State
  const [questions, setQuestions] = useState([
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'Easy',
      timeLimit: 20,
      description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.',
      constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
      ],
      testCases: ['Test Case 1', 'Test Case 2']
    },
    {
      id: 2,
      title: 'Reverse String',
      difficulty: 'Medium',
      timeLimit: 25,
      description: 'Write a function that reverses a string.',
      constraints: ['1 <= s.length <= 10^5'],
      examples: [
        { input: 's = "hello"', output: '"olleh"' }
      ],
      testCases: ['Test Case 1']
    }
  ]);

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [outputConsole, setOutputConsole] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python3');

  // Timer effect
  useEffect(() => {
    if (!isInterviewActive) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const [minutes, seconds] = prev.split(':').map(Number);
        let totalSeconds = minutes * 60 + seconds - 1;

        if (totalSeconds <= 0) {
          setIsInterviewActive(false);
          return '00:00';
        }

        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;
        return `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isInterviewActive]);

  // Handlers
  const handleStartInterview = () => {
    setIsInterviewActive(true);
    setCandidateStatus('CODING');
  };

  const handlePauseInterview = () => {
    setIsInterviewActive(false);
  };

  const handleNextQuestion = () => {
    if (selectedQuestionIndex < questions.length - 1) {
      setSelectedQuestionIndex(selectedQuestionIndex + 1);
      setCode('');
      setOutputConsole('');
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      title: 'New Question',
      difficulty: 'Easy',
      timeLimit: 20,
      description: '',
      constraints: [],
      examples: [],
      testCases: []
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRunCode = () => {
    setOutputConsole('Running code...\n\nOutput:\nhello world');
    setCandidateStatus('SUBMITTED');
  };

  const handleUpdateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const currentQuestion = questions[selectedQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Top Bar */}
        <InterviewTopBar
          userRole={userRole}
          timeRemaining={timeRemaining}
          candidateStatus={candidateStatus}
          isInterviewActive={isInterviewActive}
          onStartInterview={handleStartInterview}
          onPauseInterview={handlePauseInterview}
          onNextQuestion={handleNextQuestion}
          onToggleRole={() => setUserRole(userRole === 'interviewer' ? 'candidate' : 'interviewer')}
        />

        {/* Main Layout: 3-Column Grid */}
        <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
          {/* Left Column */}
          <div className="col-span-3 flex flex-col gap-4 overflow-auto">
            {userRole === 'interviewer' ? (
              <InterviewerQuestionsPanel
                questions={questions}
                selectedIndex={selectedQuestionIndex}
                onSelectQuestion={setSelectedQuestionIndex}
                onAddQuestion={handleAddQuestion}
                onUpdateQuestion={handleUpdateQuestion}
                onDeleteQuestion={handleDeleteQuestion}
              />
            ) : (
              <CandidateQuestionPanel
                question={currentQuestion}
              />
            )}
          </div>

          {/* Center Column */}
          <div className="col-span-6 flex flex-col gap-4 overflow-hidden">
            <CodeEditor
              userRole={userRole}
              language={selectedLanguage}
              code={code}
              outputConsole={outputConsole}
              onLanguageChange={setSelectedLanguage}
              onCodeChange={setCode}
              onRunCode={handleRunCode}
            />
          </div>

          {/* Right Column */}
          <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
            <CommunicationPanel />
          </div>
        </div>
      </div>

      {/* Styles for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default TechnicalInterviewPage;
