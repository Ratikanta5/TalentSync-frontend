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

function SessionChatPanel({ chatClient, channel, onClose, className = "" }) {
  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-xl ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-slate-100">Session Chat</h3>
          <p className="text-xs text-slate-400">Discuss the interview without leaving the call</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          title="Close chat"
          aria-label="Close chat"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden stream-chat-dark">
        <Chat client={chatClient} theme="str-chat__theme-dark">
          <Channel channel={channel}>
            <Window>
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
}

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
  const isChatConfigured = !!chatClient;
  const isChatAvailable = !!chatClient && !!channel;

  const isInterviewer = userRole === 'interviewer';
  const participantLabel = isInterviewer ? 'Candidate' : 'Interviewer';
  const waitingMessage = isInterviewer ? 'Waiting for candidate to join...' : 'Waiting for interviewer to join...';

  const displayParticipants = [];
  if (remoteParticipants && remoteParticipants.length > 0) {
    const uniqueRemote = {};
    for (const participant of remoteParticipants) {
      if (!participant || !participant.userId) continue;
      if (!uniqueRemote[participant.userId]) {
        uniqueRemote[participant.userId] = participant;
      }
    }

    const remotes = Object.values(uniqueRemote);
    if (remotes.length > 0) displayParticipants.push(remotes[0]);
  }
  const activeRemoteParticipant = displayParticipants[0] || null;
  const shouldShowSelfPreview = !!localParticipant;

  console.log('[VideoCallUI DEBUG]', {
    userRole,
    localUserId: localParticipant?.userId,
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
    <div className="relative flex h-full min-h-0 gap-4 str-video">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* =============== HEADER: Participants Count & Chat Toggle =============== */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-base-300 bg-base-100 px-4 py-3 shadow-md">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-base-content">
              {displayParticipants.length} {displayParticipants.length === 1 ? "participant" : "participants"}
            </span>
          </div>
          {isChatConfigured && (
            <button
              onClick={() => {
                if (!isChatAvailable) return;
                setIsChatOpen(!isChatOpen);
              }}
              className={`btn btn-sm gap-2 transition-all ${
                isChatOpen ? "btn-primary" : "btn-ghost"
              }`}
              title={
                !isChatAvailable
                  ? "Chat is unavailable right now"
                  : isChatOpen
                    ? "Hide chat panel"
                    : "Open chat panel"
              }
              aria-label="Toggle chat"
              disabled={!isChatAvailable}
            >
              <MessageSquareIcon className="size-4" />
              {!isChatAvailable ? "Chat Unavailable" : isChatOpen ? "Hide Chat" : "Open Chat"}
            </button>
          )}
        </div>

        {/* =============== VIDEO AREA: Show ONLY the remote participant =============== */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-base-300 shadow-md">
          <div className="relative h-full min-h-0 overflow-hidden rounded-2xl bg-black">
            {/* Remote participant (main view) */}
            {activeRemoteParticipant ? (
              <>
                <ParticipantView
                  participant={activeRemoteParticipant}
                  mode="cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs font-semibold">
                  {activeRemoteParticipant.name || participantLabel}
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

            {shouldShowSelfPreview && (
              <div className="absolute bottom-4 right-4 z-20 h-24 w-32 overflow-hidden rounded-xl border-2 border-primary bg-black/80 shadow-lg ring-1 ring-white/10">
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
        <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-4 shadow-md">
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

      {isChatAvailable && isChatOpen && (
        <>
          <SessionChatPanel
            chatClient={chatClient}
            channel={channel}
            onClose={() => setIsChatOpen(false)}
            className="hidden w-96 max-w-[38vw] shrink-0 md:flex"
          />

          <div className="absolute inset-0 z-30 md:hidden">
            <div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setIsChatOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-x-3 bottom-3 top-3">
              <SessionChatPanel
                chatClient={chatClient}
                channel={channel}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default VideoCallUI;
