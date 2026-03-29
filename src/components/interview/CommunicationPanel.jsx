import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, Phone, Send, Smile } from 'lucide-react';

/**
 * CommunicationPanel Component
 * Displays video call and chat interface
 */
function CommunicationPanel() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Interviewer', message: 'Hello! Let\'s start with your first problem.', timestamp: '10:23 AM' },
    { id: 2, sender: 'Candidate', message: 'Sure, I\'m ready!', timestamp: '10:24 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'You',
          message: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Video Call Section */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Video Header */}
        <div className="px-4 py-3 bg-gray-900/60 border-b border-gray-700/50">
          <h3 className="text-sm font-bold text-white">Video Call</h3>
        </div>

        {/* Video Stream Container */}
        <div className="flex-1 flex flex-col gap-3 p-4 bg-gray-900/20">
          {/* Interviewer Video */}
          <div className="flex-1 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl">
                I
              </div>
              <p className="text-sm text-gray-300 font-medium">Interviewer Camera</p>
              <p className="text-xs text-gray-500 mt-1">Connected</p>
            </div>
          </div>

          {/* Candidate Video */}
          <div className="flex-1 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-emerald-600/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl">
                C
              </div>
              <p className="text-sm text-gray-300 font-medium">Candidate Camera</p>
              <p className="text-xs text-gray-500 mt-1">Connected</p>
            </div>
          </div>
        </div>

        {/* Video Controls */}
        <div className="px-4 py-3 bg-gray-900/60 border-t border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-2 rounded-lg transition-all ${
                isMicOn
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-red-600/50 text-red-300 hover:bg-red-600'
              }`}
              title={isMicOn ? 'Mute' : 'Unmute'}
            >
              {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-2 rounded-lg transition-all ${
                isVideoOn
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-red-600/50 text-red-300 hover:bg-red-600'
              }`}
              title={isVideoOn ? 'Stop Video' : 'Start Video'}
            >
              {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>

            <button
              className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-all"
              title="Screen Share"
            >
              <Monitor size={18} />
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium text-sm">
            <Phone size={16} />
            End Call
          </button>
        </div>
      </div>

      {/* Chat Section */}
      <div className="h-64 flex flex-col bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-gray-900/60 border-b border-gray-700/50">
          <h3 className="text-sm font-bold text-white">Chat Panel</h3>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-900/20">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-3 py-2 rounded-lg ${
                msg.sender === 'You'
                  ? 'bg-blue-600/40 border border-blue-500/50'
                  : 'bg-gray-800/50 border border-gray-700/50'
              }`}>
                <p className={`text-xs font-semibold mb-1 ${
                  msg.sender === 'You' ? 'text-blue-300' : 'text-gray-400'
                }`}>
                  {msg.sender}
                </p>
                <p className="text-xs text-gray-200">{msg.message}</p>
                <p className="text-xs text-gray-600 mt-1">{msg.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="px-3 py-3 bg-gray-900/60 border-t border-gray-700/50 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
          />

          <button
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Emoji"
          >
            <Smile size={18} />
          </button>

          <button
            onClick={handleSendMessage}
            className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
            title="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunicationPanel;
