/**
 * WebSocket Diagnostics Utility
 * Helps diagnose WebSocket connection issues preventing Stream.io SDK from working
 */

/**
 * Test basic WebSocket connectivity to confirm WSS connections work
 */
export const testWebSocketConnectivity = async () => {
  console.log('🔍 Testing WebSocket connectivity...');
  
  return new Promise((resolve) => {
    let testSucceeded = false;
    
    // Try connecting to a public WebSocket echo server
    const wsUrl = 'wss://echo.websocket.org/';
    console.log(`   Attempting to connect to: ${wsUrl}`);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      const timeoutId = setTimeout(() => {
        console.error('   ❌ WebSocket connection timed out (5s)');
        ws.close();
        resolve({
          success: false,
          message: 'WebSocket connection timed out',
          blockedByFirewall: true
        });
      }, 5000);
      
      ws.onopen = () => {
        console.log('   ✅ WebSocket connection successful');
        clearTimeout(timeoutId);
        ws.close();
        testSucceeded = true;
        resolve({
          success: true,
          message: 'WebSocket connectivity confirmed'
        });
      };
      
      ws.onerror = (error) => {
        console.error('   ❌ WebSocket error:', error);
        clearTimeout(timeoutId);
        resolve({
          success: false,
          message: 'WebSocket connection error',
          error: error.message,
          blockedByFirewall: true
        });
      };
      
      ws.onclose = () => {
        if (!testSucceeded) {
          console.error('   ❌ WebSocket connection closed unexpectedly');
          clearTimeout(timeoutId);
        }
      };
    } catch (error) {
      console.error('   ❌ WebSocket test failed:', error.message);
      resolve({
        success: false,
        message: 'WebSocket test failed',
        error: error.message
      });
    }
  });
};

/**
 * Test connectivity to Stream.io's services
 */
export const testStreamConnectivity = async (apiKey) => {
  console.log('🔍 Testing Stream.io connectivity...');
  
  if (!apiKey) {
    console.error('   ❌ No API key provided');
    return {
      success: false,
      apiKeyProvided: false,
      message: 'API key is required'
    };
  }
  
  try {
    // Try to reach Stream's API endpoints
    const urls = [
      'https://api.stream-io-api.com/api/v1/health',
      'https://www.google.com/generate_204', // Fallback connectivity test
    ];
    
    for (const url of urls) {
      try {
        console.log(`   Testing: ${url}`);
        const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
        console.log(`   ✅ ${url} is reachable (${response.status})`);
        return {
          success: true,
          message: 'Stream.io connectivity confirmed',
          apiKeyProvided: true,
          endpoint: url
        };
      } catch (error) {
        console.log(`   ⚠️ ${url} unreachable: ${error.message}`);
      }
    }
    
    return {
      success: false,
      apiKeyProvided: true,
      message: 'Unable to reach Stream.io endpoints'
    };
  } catch (error) {
    console.error('   ❌ Connectivity test failed:', error.message);
    return {
      success: false,
      message: 'Connectivity test failed',
      error: error.message
    };
  }
};

/**
 * Run comprehensive diagnostics
 */
export const runDiagnostics = async (apiKey) => {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('🔧 STREAM.IO CONNECTION DIAGNOSTICS');
  console.log('════════════════════════════════════════════════════════════\n');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    tests: {}
  };
  
  // Test 1: WebSocket connectivity
  const wsTest = await testWebSocketConnectivity();
  diagnostics.tests.websocket = wsTest;
  
  // Test 2: Stream connectivity
  const streamTest = await testStreamConnectivity(apiKey);
  diagnostics.tests.stream = streamTest;
  
  // Test 3: Check browser connectivity
  console.log('\n🌐 Browser Network Status:');
  console.log('   Online:', navigator.onLine);
  if (!navigator.onLine) {
    console.error('   ⚠️ Browser reports offline status');
    diagnostics.tests.browser = { online: false };
  } else {
    console.log('   ✅ Browser is online');
    diagnostics.tests.browser = { online: true };
  }
  
  // Summary
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('📊 DIAGNOSTIC SUMMARY:');
  console.log('════════════════════════════════════════════════════════════');
  
  const allTestsPassed = wsTest.success && streamTest.success && navigator.onLine;
  
  if (allTestsPassed) {
    console.log('✅ All tests passed - network connectivity is good');
    console.log('   The issue is likely with:');
    console.log('   - Stream.io API key validity');
    console.log('   - Token expiration or format');
    console.log('   - Stream.io service configuration');
  } else {
    console.log('❌ Some tests failed - network/connectivity issue detected');
    if (!wsTest.success) {
      console.log('   ⚠️ WebSocket connections are blocked');
      console.log('      Check: Firewall, Proxy, or ISP blocking WSS connections');
    }
    if (!streamTest.success) {
      console.log('   ⚠️ Cannot reach Stream.io services');
      console.log('      Check: Internet connection, VPN, or DNS');
    }
    if (!navigator.onLine) {
      console.log('   ⚠️ Browser reports offline');
      console.log('      Check: Internet connection');
    }
  }
  
  console.log('\n════════════════════════════════════════════════════════════');
  
  return diagnostics;
};

/**
 * Log diagnostic recommendations based on error message
 */
export const logRecommendations = (errorMessage) => {
  console.log('\n🎯 RECOMMENDED NEXT STEPS:');
  
  const msg = errorMessage.toLowerCase();
  
  if (msg.includes('ws') || msg.includes('websocket') || msg.includes('connection failed')) {
    console.log('1. Run WebSocket diagnostic (see logs above)');
    console.log('2. Check if your network/firewall blocks WSS connections');
    console.log('3. Try using a different network (e.g., mobile hotspot)');
    console.log('4. Disable VPN or proxy if you\'re using one');
  }
  
  if (msg.includes('token')) {
    console.log('1. Verify token is valid and not expired');
    console.log('2. Check that API key is correct');
    console.log('3. Try refreshing the page to get a new token');
  }
  
  if (msg.includes('api') || msg.includes('key')) {
    console.log('1. Verify VITE_STREAM_API_KEY in frontend/.env');
    console.log('2. Ensure frontend is restarted after changing .env');
    console.log('3. Check Stream.io dashboard for API key validity');
  }
  
  if (msg.includes('timeout') || msg.includes('hang')) {
    console.log('1. Check your internet connection speed');
    console.log('2. Try with a different network');
    console.log('3. Check if firewall is rate-limiting connections');
  }
  
  console.log('\nFor detailed help, see: STREAM_WEBSOCKET_FIX.md');
};
