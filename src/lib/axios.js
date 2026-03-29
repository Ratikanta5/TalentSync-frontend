import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Interceptor for adding Clerk token
let tokenInterceptor = null;
let getTokenFn = null;

export const setupAxiosInterceptor = (getToken) => {
  console.log('⚙️ Setting up axios interceptor with Clerk getToken');
  getTokenFn = getToken;
  
  // Remove old interceptor if it exists
  if (tokenInterceptor !== null) {
    axiosInstance.interceptors.request.eject(tokenInterceptor);
    console.log('📝 Removed old token interceptor');
  }

  // Add new request interceptor
  tokenInterceptor = axiosInstance.interceptors.request.use(
    async (config) => {
      try {
        if (!getTokenFn) {
          console.warn('⚠️ getToken not available yet');
          return config;
        }
        
        console.log('🔑 Fetching Clerk token for request to:', config.url);
        const token = await getTokenFn();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Clerk token added to request:', config.url);
        } else {
          console.warn('⚠️ No Clerk token available for request:', config.url);
        }
      } catch (error) {
        console.error('❌ Error getting Clerk token:', error.message);
      }
      return config;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;