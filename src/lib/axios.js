import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, //by adding this field the browser can send the cookies to the server automatically on every single request.

})


export default axiosInstance;