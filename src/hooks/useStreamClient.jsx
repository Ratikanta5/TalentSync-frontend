import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

/**
 * Hook for Stream.io video and chat integration
 * Handles initialization, connection, and cleanup of Stream resources
 * 
 * @param {Object} session - Session data object with callId and channelId
 * @param {boolean} isLoading - Whether session is still loading
 * @param {boolean} isHost - Whether user is the host
 * @param {boolean} isParticipant - Whether user is a participant
 * @returns {Object} Stream clients, call, channel, and initialization state
 */
function useStreamClient(session, isLoading, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      try {
        // ✅ VALIDATION CHECKS
        console.log('🔍 Checking prerequisites for Stream init...', {
          hasSession: !!session,
          callId: session?.callId,
          channelId: session?.channelId,
          status: session?.status,
          isHost,
          isParticipant
        });

        if (!session) {
          console.log('⏳ Session not loaded yet');
          setIsInitializingCall(false);
          return;
        }

        if (!session.callId) {
          console.error('❌ Session exists but callId is missing!');
          console.error('Session object:', session);
          setError('Missing callId in session data');
          setIsInitializingCall(false);
          return;
        }

        // Only host or participant can join
        if (!isHost && !isParticipant) {
          console.log('⏳ User cannot join this call (not host or participant)');
          setIsInitializingCall(false);
          return;
        }

        // Cannot join completed sessions
        if (session.status === "completed") {
          console.log('⏳ Cannot join completed session');
          setIsInitializingCall(false);
          return;
        }

        console.log('🚀 Initializing Stream clients...');
        console.log('   Session:', { 
          callId: session.callId, 
          channelId: session.channelId || session.callId,
          status: session.status 
        });

        // ✅ STEP 1: Get Stream tokens from backend
        console.log('🔑 Fetching Stream tokens...');
        let tokenResponse;
        try {
          tokenResponse = await sessionApi.getStreamToken();
          console.log('📡 Token response received:', tokenResponse);
        } catch (tokenError) {
          console.error('❌ Failed to fetch token from API:', tokenError);
          throw new Error(`Token API failed: ${tokenError.message}`);
        }
        
        const { token, videoToken, userId, userName, userImage } = tokenResponse;
        
        console.log('📋 Token response data:', {
          hasToken: !!token,
          hasVideoToken: !!videoToken,
          userId,
          userName,
          hasImage: !!userImage
        });
        
        if (!token || !videoToken) {
          console.error('❌ Missing tokens in response:', {
            token: token ? 'present' : 'MISSING',
            videoToken: videoToken ? 'present' : 'MISSING',
            userId,
            fullResponse: tokenResponse
          });
          throw new Error(`Backend did not return complete tokens. Got: ${JSON.stringify(tokenResponse)}`);
        }
        console.log('✅ Tokens received for user:', userId);

        // ✅ STEP 2: Initialize Stream Video client
        console.log('📞 Initializing Video client...');
        const videoClient = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          videoToken
        );
        console.log('✅ Video client initialized');
        setStreamClient(videoClient);

        // ✅ STEP 3: Join the video call
        console.log('📞 Joining video call:', session.callId);
        videoCall = videoClient.call("default", session.callId);
        await videoCall.join({ create: true });
        setCall(videoCall);
        console.log('✅ Joined video call successfully');

        // ✅ STEP 4: Initialize Stream Chat client
        console.log('💬 Initializing Chat client...');
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        if (!apiKey) {
          throw new Error('VITE_STREAM_API_KEY not configured in .env');
        }

        chatClientInstance = StreamChat.getInstance(apiKey);
        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        setChatClient(chatClientInstance);
        console.log('✅ Chat client connected');

        // ✅ STEP 5: Watch the chat channel
        // Use channelId if available, fallback to callId
        const channelIdToUse = session.channelId || session.callId;
        console.log('💬 Watching chat channel:', channelIdToUse);
        const chatChannel = chatClientInstance.channel("messaging", channelIdToUse);
        await chatChannel.watch();
        setChannel(chatChannel);
        console.log('✅ Chat channel being watched');

        toast.success('Connected to session!');
        console.log('🎉 Stream initialization complete');
        setError(null);
      } catch (error) {
        console.error('❌ Error initializing Stream:', error?.message);
        console.error('   Full error:', error);
        const errorMsg = error?.message || 'Failed to connect to video call';
        setError(errorMsg);
        toast.error(`Connection error: ${errorMsg}`);
        setStreamClient(null);
        setCall(null);
        setChatClient(null);
        setChannel(null);
      } finally {
        setIsInitializingCall(false);
      }
    };

    // Only initialize if we have required data and not still loading
    if (!isLoading && session && (isHost || isParticipant)) {
      console.log('🚀 Starting useStreamClient initialization...');
      initCall();
    } else {
      console.log('⏳ Waiting for conditions to init Stream:', { 
        isLoading, 
        hasSession: !!session, 
        isHost, 
        isParticipant 
      });
    }

    // ✅ CLEANUP: Disconnect when component unmounts or dependencies change
    return () => {
      (async () => {
        try {
          console.log('🧹 Cleaning up Stream resources...');
          if (videoCall) {
            await videoCall.leave();
            console.log('✅ Left video call');
          }
          if (chatClientInstance) {
            await chatClientInstance.disconnectUser();
            console.log('✅ Disconnected chat client');
          }
          await disconnectStreamClient();
          console.log('✅ Stream client disconnected');
        } catch (error) {
          console.error('⚠️ Error during cleanup:', error?.message);
        }
      })();
    };
  }, [session, isLoading, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
    error,
  };
}

export default useStreamClient;