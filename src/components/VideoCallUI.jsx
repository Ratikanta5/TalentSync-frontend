import {
  CallControls,
  CallingState,
  ParticipantView,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

/**
 * VideoCallUI Component
 * Handles video rendering, chat, and call controls
 * Shows only remote participants to avoid duplicate video display
 * 
 * Props:
 * - chatClient: Stream chat client
 * - channel: Stream chat channel
 * - userRole: 'interviewer' or 'candidate' - determines what remote participant to show
 * 
 * Features:
 * - Display remote participant videos only (no duplicate self-video)
 * - CallControls with mute, screen share, and other options
 * - Integrated chat interface
 * - Participant count display
 */
function VideoCallUI({ chatClient, channel, userRole = 'interviewer' }) {
  const navigate = useNavigate();
  const { useCallCallingState, useRemoteParticipants, useLocalParticipant } = useCallStateHooks();
  const callingState = useCallCallingState();
  const remoteParticipants = useRemoteParticipants();
  const localParticipant = useLocalParticipant();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isInterviewer = userRole === 'interviewer';
  const participantLabel = isInterviewer ? 'Candidate' : 'Interviewer';
  const waitingMessage = isInterviewer ? 'Waiting for candidate to join...' : 'Waiting for interviewer to join...';

  // Strong duplicate removal: ensure local participant is NEVER in remote list, even if SDK includes them multiple times
  const localUserId = localParticipant?.userId;
  const displayParticipants = [];
  if (remoteParticipants && remoteParticipants.length > 0) {
    // Remove all entries matching local userId and deduplicate by userId
    const uniqueRemote = {};
    for (const p of remoteParticipants) {
      if (!p || !p.userId) continue;
      if (p.userId === localUserId) continue; // skip self
      if (!uniqueRemote[p.userId]) {
        uniqueRemote[p.userId] = p;
      }
    }
    // Only take the first unique remote participant
    const remotes = Object.values(uniqueRemote);
    if (remotes.length > 0) displayParticipants.push(remotes[0]);
  }

  console.log('[VideoCallUI DEBUG]', {
    userRole,
    localUserId,
    totalRemote: remoteParticipants ? remoteParticipants.length : 0,
    displayCount: displayParticipants.length,
    displayUserIds: displayParticipants.map(p => p.userId)
  });

  // Loading state
  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Joining call...</p>
          <p className="text-sm text-base-content/70 mt-2">Please wait while we connect you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-3 relative str-video">
      <div className="flex-1 flex flex-col gap-3">
        {/* =============== HEADER: Participants Count & Chat Toggle =============== */}
        <div className="flex items-center justify-between gap-2 bg-base-100 p-3 rounded-lg shadow-md border border-base-300">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-base-content">
              {displayParticipants.length} {displayParticipants.length === 1 ? "participant" : "participants"}
            </span>
          </div>
          {chatClient && channel && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`btn btn-sm gap-2 transition-all ${
                isChatOpen ? "btn-primary" : "btn-ghost"
              }`}
              title={isChatOpen ? "Hide chat" : "Show chat"}
              aria-label="Toggle chat"
            >
              <MessageSquareIcon className="size-4" />
              Chat
            </button>
          )}
        </div>

        {/* =============== VIDEO AREA: Show ONLY the remote participant =============== */}
        <div className="flex-1 bg-base-300 rounded-lg overflow-hidden relative shadow-md">
          <div className="h-full relative bg-black rounded-lg overflow-hidden">
            {/* Remote participant (main view) */}
            {displayParticipants[0] ? (
              <>
                <ParticipantView
                  participant={displayParticipants[0]}
                  mode="cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs font-semibold">
                  {displayParticipants[0].name || participantLabel}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-base-300">
                <div className="text-center">
                  <UsersIcon className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                  <p className="text-base-content/50 font-medium">{waitingMessage}</p>
                </div>
              </div>
            )}

            {/* Self-view (small overlay, always visible) */}
            {localParticipant && (
              <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-primary shadow-lg bg-black/80 z-20">
                <ParticipantView
                  participant={localParticipant}
                  mode="contain"
                />
                <div className="absolute bottom-1 left-1 bg-black/60 px-1 py-0.5 rounded text-white text-xs font-semibold">
                  You
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =============== FOOTER: Call Controls =============== */}
        <div className="bg-base-100 px-4 py-4 rounded-lg shadow-md border border-base-300">
          <div className="flex items-center justify-center gap-2">
            {/* Default CallControls includes: Mute/Unmute, Camera On/Off, Leave Call */}
            <CallControls 
              onLeave={() => {
                console.log('👋 User leaving session');
                navigate("/dashboard");
              }}
              className="str-call-controls"
            />
          </div>
          <p className="text-xs text-base-content/60 text-center mt-3">
            Use the controls above to manage your audio, video, screen share, and call settings
          </p>
        </div>
      </div>

      {/* =============== CHAT SECTION (Collapsible) =============== */}
      {chatClient && channel && (
        <div
          className={`flex flex-col rounded-lg shadow-md overflow-hidden bg-[#272a30] transition-all duration-300 ease-in-out ${
            isChatOpen ? "w-80 opacity-100 visible" : "w-0 opacity-0 invisible"
          }`}
        >
          {isChatOpen && (
            <>
              {/* Chat Header */}
              <div className="bg-[#1c1e22] p-4 border-b border-[#3a3d44] flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm">Session Chat</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-[#3a3d44]"
                  title="Close chat"
                  aria-label="Close chat"
                >
                  <XIcon className="size-5" />
                </button>
              </div>

              {/* Chat Messages and Input */}
              <div className="flex-1 overflow-hidden stream-chat-dark">
                <Chat 
                  client={chatClient} 
                  theme="str-chat__theme-dark"
                >
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default VideoCallUI;