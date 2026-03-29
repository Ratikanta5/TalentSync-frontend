import { useState } from 'react';
import { Play, RotateCcw, Send, Copy, Check } from 'lucide-react';

/**
 * CodeEditor Component
 * VS Code-style editor for both interviewer and candidate
 */
function CodeEditor({
  userRole,
  language,
  code,
  outputConsole,
  onLanguageChange,
  onCodeChange,
  onRunCode
}) {
  const [isCopied, setIsCopied] = useState(false);

  const languages = [
    { value: 'python3', label: 'Python 3' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' }
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    onCodeChange('');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900/60 border-b border-gray-700/50">
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            title="Copy code"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {userRole === 'interviewer' && (
            <>
              <button
                onClick={onRunCode}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all active:scale-95"
              >
                <Play size={16} />
                Run Code
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-1.5 bg-gray-700 text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-600 transition-all"
              >
                <RotateCcw size={16} />
                Reset
              </button>

              <button className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all active:scale-95">
                <Send size={16} />
                Submit
              </button>
            </>
          )}

          {userRole === 'candidate' && (
            <>
              <button
                onClick={onRunCode}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all active:scale-95"
              >
                <Play size={16} />
                Run Code
              </button>

              <button className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all active:scale-95">
                <Send size={16} />
                Submit Solution
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor & Output Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col border-r border-gray-700/50">
          {/* Line Numbers & Code */}
          <div className="flex-1 overflow-hidden flex bg-gray-900/30">
            {/* Line Numbers */}
            <div className="bg-gray-900/50 border-r border-gray-700/50 py-4 px-3 select-none overflow-hidden">
              <div className="text-right text-gray-600 text-xs font-mono leading-relaxed">
                {code.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            </div>

            {/* Code Textarea */}
            <textarea
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder={`Write your ${language} code here`}
              className="flex-1 px-4 py-4 bg-transparent text-white font-mono text-sm resize-none focus:outline-none placeholder-gray-600"
              spellCheck="false"
            />
          </div>

          {/* Syntax Highlight Info Bar */}
          <div className="h-8 bg-gray-900/40 border-t border-gray-700/50 px-4 flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Syntax Highlighting: {languages.find(l => l.value === language)?.label}
          </div>
        </div>

        {/* Output Console */}
        <div className="w-1/2 flex flex-col bg-gray-900/60 border-l border-gray-700/50">
          {/* Console Header */}
          <div className="px-4 py-3 bg-gray-900/80 border-b border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <h3 className="text-sm font-semibold text-white">Output Console</h3>
            </div>
            <span className="text-xs text-gray-500">stdout | stderr</span>
          </div>

          {/* Console Content */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {outputConsole ? (
              <div className="text-gray-300 whitespace-pre-wrap break-words">
                {outputConsole}
              </div>
            ) : (
              <div className="text-gray-600 text-xs">
                Output will appear here...
              </div>
            )}
          </div>

          {/* Console Footer */}
          <div className="h-8 bg-gray-900/40 border-t border-gray-700/50 px-4 flex items-center text-xs text-gray-600">
            Ready • Waiting for input...
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
