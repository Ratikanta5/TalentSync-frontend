import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, TestTube, ChevronDown } from 'lucide-react';

/**
 * InterviewerQuestionsPanel Component
 * Displays and manages interview questions for the interviewer
 */
function InterviewerQuestionsPanel({
  questions,
  selectedIndex,
  onSelectQuestion,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleEditChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = (index) => {
    onUpdateQuestion(index, { ...questions[index], ...editValues });
    setEditingIndex(null);
    setEditValues({});
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditValues(questions[index]);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700/50">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">▪</span>
          Interview Questions
        </h2>
        <p className="text-xs text-gray-400 mt-1">{questions.length} questions</p>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {questions.map((question, index) => (
          <div
            key={question.id}
            onClick={() => !editingIndex && onSelectQuestion(index)}
            className={`group relative p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
              selectedIndex === index
                ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600/70 hover:bg-gray-700/30'
            }`}
          >
            {editingIndex === index ? (
              // Edit Mode
              <div className="space-y-3">
                {/* Title Input */}
                <input
                  type="text"
                  value={editValues.title || ''}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70"
                  placeholder="Question title"
                />

                {/* Difficulty & Time Limit Row */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={editValues.difficulty || 'Easy'}
                    onChange={(e) => handleEditChange('difficulty', e.target.value)}
                    className="px-3 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>

                  <input
                    type="number"
                    value={editValues.timeLimit || 20}
                    onChange={(e) => handleEditChange('timeLimit', parseInt(e.target.value))}
                    className="px-3 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
                    placeholder="Minutes"
                    min="5"
                    max="120"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={() => handleSaveEdit(index)}
                  className="w-full px-3 py-2 bg-green-600/80 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  Save Changes
                </button>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">{question.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">Q{index + 1}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    question.difficulty === 'Easy'
                      ? 'bg-green-500/20 text-green-400'
                      : question.difficulty === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {question.difficulty}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-xs text-gray-400">
                    <span className="font-semibold text-gray-300">Time:</span> {question.timeLimit} min
                  </p>
                  <p className="text-xs text-gray-400">
                    <span className="font-semibold text-gray-300">Test Cases:</span> {question.testCases.length}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(index);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600/50 hover:bg-blue-600 text-white text-xs rounded-lg transition-all"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQuestion(index);
                    }}
                    className="flex items-center justify-center px-2 py-1.5 bg-red-600/50 hover:bg-red-600 text-white text-xs rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>

                  <button className="flex items-center justify-center px-2 py-1.5 bg-purple-600/50 hover:bg-purple-600 text-white text-xs rounded-lg transition-all"
                    title="Add test cases"
                  >
                    <TestTube size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {questions.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p className="text-center text-sm">No questions added yet</p>
          </div>
        )}
      </div>

      {/* Add Question Button */}
      <div className="px-4 py-4 border-t border-gray-700/50 bg-gray-900/20">
        <button
          onClick={onAddQuestion}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          Add New Question
        </button>
      </div>
    </div>
  );
}

export default InterviewerQuestionsPanel;
