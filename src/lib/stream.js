import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { runDiagnostics, logRecommendations } from './websocket-diagnostics';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

let client = null;

/**
 * Diagnostic helper to validate inputs before StreamVideoClient initialization
 */
const validateInputs = (user, token) => {
  const diagnostics = {
    apiKeyConfigured: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : 'N/A',
    tokenPresent: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'MISSING',
    userPresent: !!user,
    userId: user?.id || 'N/A',
    userName: user?.name || 'N/A',
  };

  console.log('🔍 Input Validation:', diagnostics);

  if (!apiKey) throw new Error("Stream API key is not configured (VITE_STREAM_API_KEY missing)");
  if (!token) throw new Error("Video token is required");
  if (!user?.id) throw new Error("User ID is required");

  return diagnostics;
};

/**
 * Initialize StreamVideoClient with improved connection handling
 * Includes retry logic for WebSocket connection failures with detailed diagnostics
 */
export const initializeStreamClient = async (user, token) => {
  // if client exists, reuse it
  if (client) {
    console.log('♻️ Reusing existing StreamVideoClient');
    return client;
  }

  console.log('🚀 Initializing StreamVideoClient for user:', user.id);
  
  try {
    // Validate inputs first
    validateInputs(user, token);
  } catch (validationError) {
    console.error('❌ Input validation failed:', validationError.message);
    throw validationError;
  }

  const maxRetries = 5; // Increased from 3 to 5
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n📡 Connection attempt ${attempt}/${maxRetries} at ${new Date().toISOString()}`);
      
      // Log what we're passing to the SDK
      console.log(`   - API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
      console.log(`   - User ID: ${user.id}`);
      console.log(`   - Token Length: ${token.length}`);
      console.log(`   - Token Expires: Checking...`);
      
      // Validate token JWT structure before passing
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error(`Invalid JWT structure: ${tokenParts.length} parts instead of 3`);
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = payload.exp ? (payload.exp - now) : 'unknown';
        console.log(`   - Token valid for: ${timeUntilExpiry}s`);
        
        if (payload.exp && now > payload.exp) {
          throw new Error(`Token has expired (exp: ${payload.exp}, now: ${now})`);
        }
      } catch (tokenError) {
        console.error(`❌ Token validation failed:`, tokenError.message);
        throw tokenError;
      }
      
      console.log('📝 Creating StreamVideoClient instance...');
      
      // Create client with explicit settings
      client = new StreamVideoClient({
        apiKey,
        user,
        token,
        // Add explicit options to handle connection better
        options: {
          logLevel: 'debug', // More verbose logging from SDK
          timeout: 15000,    // 15 second timeout for connection
        }
      });
      
      console.log('✅ StreamVideoClient instance created successfully');
      console.log('   Client ID:', client?.clientID);
      console.log('   Client State:', {
        initialized: !!client,
        userId: client?.user?.id,
        // Can't access internal state but we can check if it exists
      });
      
      // Give SDK time to establish WebSocket connection
      console.log('⏳ Waiting for internal WebSocket connection (8s)...');
      
      const connectionWaitPromise = new Promise((resolve, reject) => {
        let checkCount = 0;
        const maxChecks = 80; // 80 checks * 100ms = 8 seconds
        
        const checkInterval = setInterval(() => {
          checkCount++;
          
          // Try different ways to detect connection success
          if (client?.user?.id) {
            console.log(`✅ Client authenticated after ${checkCount * 100}ms`);
            clearInterval(checkInterval);
            resolve('authenticated');
            return;
          }
          
          if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            console.log(`⚠️ Timeout waiting for auth after ${checkCount * 100}ms, proceeding anyway`);
            resolve('timeout');
          }
        }, 100);
      });
      
      await connectionWaitPromise;
      
      console.log('📊 StreamVideoClient initialization complete');
      console.log('   Client exists:', !!client);
      console.log('   User ID set:', client?.user?.id);
      console.log('✅ SUCCESS: Attempt', attempt, 'succeeded');
      
      return client;
      
    } catch (error) {
      lastError = error;
      
      console.error(`\n❌ Attempt ${attempt} FAILED`);
      console.error('   Error message:', error.message);
      console.error('   Error code:', error.code || 'N/A');
      console.error('   Error type:', error.constructor.name);
      
      const isWSError = error.message?.includes('WS') || 
                        error.message?.includes('WebSocket') || 
                        error.message?.includes('connection');
      
      if (isWSError) {
        console.error('   🔴 WebSocket connection failure detected');
      }
      if (error.message?.includes('token')) {
        console.error('   🔴 Token-related error detected');
      }
      if (error.message?.includes('401') || error.message?.includes('403')) {
        console.error('   🔴 Authentication/Authorization error detected');
      }
      
      // Run diagnostics on first WebSocket failure
      if (isWSError && attempt === 1) {
        console.log('\n🔍 Running diagnostics for WebSocket failure...');
        await runDiagnostics(apiKey);
        logRecommendations(error.message);
      }
      
      // Clean up failed client
      try {
        if (client?.disconnectUser) {
          await client.disconnectUser();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      client = null;
      
      if (attempt < maxRetries) {
        // Exponential backoff with jitter: 1s, 2s, 4s, 8s, 16s
        const baseWait = Math.pow(2, attempt - 1) * 1000;
        const jitter = Math.random() * 500; // Add 0-500ms random jitter
        const waitTime = baseWait + jitter;
        console.log(`⏳ Waiting ${waitTime.toFixed(0)}ms before attempt ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // All retries exhausted - provide comprehensive error info
  console.error('\n❌ ❌ ❌ CRITICAL: StreamVideoClient initialization FAILED after', maxRetries, 'attempts');
  console.error('   Last error:', lastError?.message);
  console.error('   Check the following:');
  console.error('   1. Is VITE_STREAM_API_KEY in frontend/.env?');
  console.error('   2. Do you have internet connectivity?');
  console.error('   3. Is Stream.io service available?');
  console.error('   4. Is your token valid and not expired?');
  
  throw lastError || new Error('StreamVideoClient failed to initialize');
};

export const disconnectStreamClient = async () => {
  if (client) {
    try {
      console.log('🔌 Disconnecting StreamVideoClient');
      await client.disconnectUser();
      client = null;
    } catch (error) {
      console.error("Error disconnecting Stream client:", error);
    }
  }
};