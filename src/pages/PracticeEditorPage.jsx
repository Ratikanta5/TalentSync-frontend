import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUser } from '@clerk/clerk-react';
import {
  ChevronDown,
  Play,
  Send,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Copy,
  RefreshCw,
  Code2,
  ChevronUp
} from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

function PracticeEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [problem, setProblem] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Code Editor State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [lastSubmission, setLastSubmission] = useState(null);

  // Test Results
  const [testResults, setTestResults] = useState(null);
  const [expandedTests, setExpandedTests] = useState({});

  // UI State
  const [showTestCases, setShowTestCases] = useState(true);
  const [testCasesExpanded, setTestCasesExpanded] = useState(true);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/practice/problem/${id}`);

      if (response.data.success) {
        const problemData = response.data.data;
        setProblem(problemData.problem);
        setUserStats(problemData.userStats);
        setLastSubmission(problemData.lastSubmission);

        // Set initial code
        if (problemData.lastSubmission) {
          setCode(problemData.lastSubmission.code);
          setLanguage(problemData.lastSubmission.language);
        } else {
          const starterCode =
            problemData.problem.starterCode[language] ||
            '// Write your solution here\n';
          setCode(starterCode);
        }
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      toast.error('Failed to load problem');
      navigate('/practice');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (!lastSubmission || lastSubmission.language !== newLanguage) {
      const starterCode =
        problem.starterCode[newLanguage] || '// Write your solution here\n';
      setCode(starterCode);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`/practice/problem/${id}/submit`, {
        code,
        language
      });

      if (response.data.success) {
        setTestResults(response.data.data);
        
        if (response.data.data.status === 'accepted') {
          toast.success('🎉 Problem solved successfully!');
        } else {
          toast.error('Some test cases failed');
        }

        // Update stats
        if (userStats) {
          setUserStats({
            ...userStats,
            totalAttempts: userStats.totalAttempts + 1,
            acceptedCount:
              response.data.data.status === 'accepted'
                ? userStats.acceptedCount + 1
                : userStats.acceptedCount
          });
        }
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      toast.error('Failed to submit code');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const resetCode = () => {
    const starterCode =
      problem.starterCode[language] || '// Write your solution here\n';
    setCode(starterCode);
    setTestResults(null);
    toast.success('Code reset to starter template');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-300 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-base-300 flex items-center justify-center">
        <p className="text-xl text-base-content/60">Problem not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-300">
        <Navbar />

        <div className="flex-1 h-[calc(100vh-80px)] overflow-hidden">
          <div className="flex h-full">
            {/* Left Panel - Problem Description */}
            <div className="w-1/2 border-r-2 border-base-300 overflow-y-auto bg-base-100">
              <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold">{problem.title}</h1>
                    <span
                      className={`badge badge-lg ${
                        problem.difficulty === 'easy'
                          ? 'badge-success'
                          : problem.difficulty === 'medium'
                          ? 'badge-warning'
                          : 'badge-error'
                      }`}
                    >
                      {problem.difficulty.charAt(0).toUpperCase() +
                        problem.difficulty.slice(1)}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-base-200 rounded-lg p-4">
                      <p className="text-sm text-base-content/60">Acceptance</p>
                      <p className="text-2xl font-bold">
                        {problem.stats.acceptanceRate}%
                      </p>
                    </div>
                    <div className="bg-base-200 rounded-lg p-4">
                      <p className="text-sm text-base-content/60">Attempts</p>
                      <p className="text-2xl font-bold">
                        {problem.stats.totalAttempts}
                      </p>
                    </div>
                    <div className="bg-base-200 rounded-lg p-4">
                      <p className="text-sm text-base-content/60">Submissions</p>
                      <p className="text-2xl font-bold">
                        {problem.stats.totalSubmissions}
                      </p>
                    </div>
                  </div>

                  {/* Your Stats */}
                  {userStats && (
                    <div className="alert alert-info mb-6">
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        You have {userStats.totalAttempts} attempts and{' '}
                        {userStats.acceptedCount} accepted submission
                        {userStats.acceptedCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Problem Statement */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="text-base-content/80 whitespace-pre-wrap mb-6">
                    {problem.problemStatement}
                  </p>

                  {problem.constraints.length > 0 && (
                    <>
                      <h3 className="font-bold mb-2">Constraints:</h3>
                      <ul className="list-disc list-inside space-y-1 text-base-content/80 mb-6">
                        {problem.constraints.map((constraint, idx) => (
                          <li key={idx}>{constraint}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Examples */}
                {problem.examples.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Examples</h3>
                    <div className="space-y-4">
                      {problem.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className="bg-base-200 rounded-lg p-4 border-l-4 border-primary"
                        >
                          <p className="font-bold text-sm mb-2">
                            Example {idx + 1}:
                          </p>
                          <p className="text-sm mb-3">
                            <strong>Input:</strong>
                            <code className="block bg-base-300 p-2 rounded mt-1 overflow-x-auto">
                              {example.input}
                            </code>
                          </p>
                          <p className="text-sm mb-3">
                            <strong>Output:</strong>
                            <code className="block bg-base-300 p-2 rounded mt-1 overflow-x-auto">
                              {example.output}
                            </code>
                          </p>
                          {example.explanation && (
                            <p className="text-sm">
                              <strong>Explanation:</strong>
                              <code className="block bg-base-300 p-2 rounded mt-1">
                                {example.explanation}
                              </code>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Test Cases */}
                {problem.testCases.length > 0 && (
                  <div>
                    <button
                      onClick={() => setTestCasesExpanded(!testCasesExpanded)}
                      className="flex items-center gap-2 font-bold text-lg mb-4 hover:text-primary transition-colors"
                    >
                      {testCasesExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                      Test Cases
                    </button>

                    {testCasesExpanded && (
                      <div className="space-y-3">
                        {problem.testCases
                          .filter((tc) => !tc.isHidden)
                          .map((testCase, idx) => (
                            <div
                              key={idx}
                              className="bg-base-200 rounded-lg p-4 cursor-pointer hover:bg-base-300 transition-colors"
                              onClick={() =>
                                setExpandedTests({
                                  ...expandedTests,
                                  [idx]: !expandedTests[idx]
                                })
                              }
                            >
                              <p className="font-bold text-sm mb-2">
                                Test Case {idx + 1}
                              </p>
                              {expandedTests[idx] && (
                                <>
                                  <p className="text-xs text-base-content/70 mb-2">
                                    <strong>Input:</strong>
                                  </p>
                                  <code className="block bg-base-300 p-2 rounded mb-3 text-xs overflow-x-auto">
                                    {testCase.input}
                                  </code>
                                  <p className="text-xs text-base-content/70 mb-2">
                                    <strong>Expected Output:</strong>
                                  </p>
                                  <code className="block bg-base-300 p-2 rounded text-xs overflow-x-auto">
                                    {testCase.expectedOutput}
                                  </code>
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Code Editor */}
            <div className="w-1/2 flex flex-col bg-base-100 border-l-2 border-base-300">
              {/* Top Bar */}
              <div className="border-b-2 border-base-300 p-4 flex items-center justify-between bg-base-200">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="select select-sm select-bordered"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyCode}
                    className="btn btn-sm btn-ghost gap-2"
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetCode}
                    className="btn btn-sm btn-ghost gap-2"
                    title="Reset to template"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm resize-none outline-none bg-base-100"
                  placeholder="Write your solution here..."
                />
              </div>

              {/* Results Section */}
              <div className="border-t-2 border-base-300 p-4 bg-base-200 max-h-64 overflow-y-auto">
                {testResults ? (
                  <div>
                    <div className="mb-4">
                      {testResults.status === 'accepted' ? (
                        <div className="alert alert-success gap-3">
                          <CheckCircle className="w-5 h-5" />
                          <span>All test cases passed! 🎉</span>
                        </div>
                      ) : testResults.compilationError ? (
                        <div className="alert alert-error gap-3">
                          <XCircle className="w-5 h-5" />
                          <span>{testResults.compilationError}</span>
                        </div>
                      ) : testResults.runtimeError ? (
                        <div className="alert alert-error gap-3">
                          <XCircle className="w-5 h-5" />
                          <span>{testResults.runtimeError}</span>
                        </div>
                      ) : (
                        <div className="alert alert-warning gap-3">
                          <AlertCircle className="w-5 h-5" />
                          <span>
                            {testResults.passedTests}/{testResults.totalTests}{' '}
                            test cases passed
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Test Results Details */}
                    <div className="space-y-2 text-sm">
                      {testResults.testResults?.map((result, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded ${
                            result.passed ? 'bg-success/20' : 'bg-error/20'
                          } cursor-pointer hover:opacity-80 transition-opacity`}
                          onClick={() =>
                            setExpandedTests({
                              ...expandedTests,
                              [`result-${idx}`]: !expandedTests[`result-${idx}`]
                            })
                          }
                        >
                          <div className="flex items-center gap-2">
                            {result.passed ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <XCircle className="w-4 h-4 text-error" />
                            )}
                            <span className="font-bold">
                              Test Case {idx + 1}{' '}
                              {result.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>

                          {expandedTests[`result-${idx}`] && (
                            <div className="mt-2 space-y-1 text-xs">
                              <p>
                                <strong>Input:</strong> {result.input}
                              </p>
                              <p>
                                <strong>Expected:</strong>{' '}
                                {result.expectedOutput}
                              </p>
                              <p>
                                <strong>Got:</strong> {result.actualOutput}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-base-content/60 text-sm">
                    Run code to see results...
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="border-t-2 border-base-300 p-4 bg-base-100 flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn btn-primary flex-1 gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PracticeEditorPage;
