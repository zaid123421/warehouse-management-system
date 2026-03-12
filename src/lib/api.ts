import axios from 'axios';
import TokenLocalService from '@/services/locale-services/cookies-storage-services/token-service'; // تأكد من المسار حسب صورتك الأخيرة

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL_FOR_SERVER_REQUESTS || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 1. Request Interceptor ---
api.interceptors.request.use(
  (config) => {
    // نستخدم الخدمة الجديدة لجلب التوكن من الكوكيز
    const token = TokenLocalService.GetRefreshToken(); // أو GetAccessToken إذا أضفته
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 2. Response Interceptor ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً");
      
      // نستخدم الخدمة لمسح الكوكيز بدلاً من localStorage
      TokenLocalService.RemoveRefreshToken();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login'; 
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;