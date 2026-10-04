// src/api/api.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '/api/';

// إنشاء instance موحدة من axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor لإرسال التوكن تلقائيًا قبل كل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔐 Interceptor لمعالجة الأخطاء تلقائيًا مثل 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // حذف التوكن إذا انتهى أو غير صالح
      localStorage.removeItem('token');

      // إعادة توجيه المستخدم لتسجيل الدخول
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
