import * as axios from 'axios';

// Create axios instance
export const api = axios.default.create({
  // للتطوير المحلي: ضع REACT_APP_API_URL=http://localhost:8000/api في ملف .env
  baseURL: process.env.REACT_APP_API_URL || 'https://ecom-parent-project.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    _: new Date().getTime(),
  },
});

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// هل انتهت صلاحية توكن JWT؟ نفحصه محلياً قبل إرساله.
// (توكن تالف أو غير قابل للقراءة يُعامَل كمنتهٍ — الأسلم أن نحذفه)
const isTokenExpired = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    if (!payload?.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

// Request interceptor — لا نُرسل توكناً منتهياً إطلاقاً.
// السبب: Django يتحقق من الهوية *قبل* الصلاحيات، فتوكن منتهٍ يجعل حتى
// النقاط العامة (المنتجات/الأقسام/البنرات) ترجع 403 ويظهر المتجر فارغاً.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (isTokenExpired(token)) {
        clearAuth();
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — إذا رفض السيرفر التوكن (401/403) ننظّفه ونعيد
// الطلب مرة واحدة بدون توكن، حتى لا تبقى الصفحات العامة مكسورة.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const config = error.config || {};
    const sentAuth = Boolean(config.headers?.Authorization);

    if ((status === 401 || status === 403) && sentAuth && !config._retriedAnon) {
      clearAuth();

      // الصفحات المحمية فقط تُحوَّل لتسجيل الدخول
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login';
        return Promise.reject(error);
      }

      const retryConfig = { ...config, _retriedAnon: true };
      if (retryConfig.headers) delete retryConfig.headers.Authorization;
      return api.request(retryConfig);
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Products
  products: '/products/',
  categories: '/products/categories/',
  productsByCategory: '/products/categories/',
  banners: '/products/banners/',

  // Admin — Banners
  adminBanners: '/products/admin/banners/',

  // Orders
  orders: '/orders/',
  createOrder: '/orders/',

  // Notifications
  notifications: '/notifications/',
};

export default api;
