// src/services/osimart.js
import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from '@/utils/cookieHelper';

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = 'https://api.osimart.com/store/apis';
const ROOT_API_BASE_URL = 'https://api.osimart.com';
const STORE_ID = '92ea209b-b32c-448e-85af-7296eb8eea00';

// ============================================
// AXIOS INSTANCE - For store APIs
// ============================================
export const osimartApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

osimartApi.interceptors.request.use((config) => {
  if (!config.params) {
    config.params = {};
  }
  if (!config.params.store) {
    config.params.store = STORE_ID;
  }
  return config;
});

// ============================================
// AXIOS INSTANCE FOR AUTH
// ============================================
export const authAxios = axios.create({
  baseURL: ROOT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ============================================
// TOKEN MANAGEMENT
// ============================================

// Access Token: Memory only
let accessToken = null;
let sessionId = null;
let tokenExpiry = null;
let isRefreshing = false;
let failedQueue = [];

// Refresh Token: Secure cookie
export function setTokens(tokens) {
  if (tokens.access_token) {
    accessToken = tokens.access_token;
    tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    console.log('🔑 Access token stored in memory, expires in 15 minutes');
  }
  
  if (tokens.refresh_token) {
    setCookie('refresh_token', tokens.refresh_token, 7);
    console.log('🔑 Refresh token stored in cookie (7 days)');
  }
  
  if (tokens.session_id) {
    sessionId = tokens.session_id;
    setCookie('session_id', tokens.session_id, 7);
  }
}

export function clearTokens() {
  accessToken = null;
  sessionId = null;
  tokenExpiry = null;
  isRefreshing = false;
  failedQueue = [];
  deleteCookie('refresh_token');
  deleteCookie('session_id');
  console.log('🗑️ All tokens cleared');
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return getCookie('refresh_token');
}

export function getSessionId() {
  return sessionId || getCookie('session_id');
}

export function isTokenExpired() {
  if (!tokenExpiry) return true;
  return Date.now() >= tokenExpiry;
}

// ============================================
// TOKEN REFRESH FUNCTION - OPTIMIZED
// ============================================
export async function refreshAccessToken() {
  // Prevent multiple refresh calls
  if (isRefreshing) {
    console.log('⏳ Refresh already in progress, waiting...');
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.warn('⚠️ No refresh token available in cookie');
    clearTokens();
    throw new Error('No refresh token available');
  }

  console.log('🔄 Refreshing access token...');
  
  isRefreshing = true;
  
  try {
    // ✅ Only use the working format: Authorization header with refresh token
    const response = await authAxios.post('/auth/refresh/', {}, {
      params: { store: STORE_ID },
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });

    console.log('✅ Refresh response status:', response.status);

    const newAccessToken = response.data.access || response.data.access_token || response.data.token;
    const newRefreshToken = response.data.refresh || response.data.refresh_token;
    const newSessionId = response.data.session_id;
    
    if (newAccessToken) {
      // Update tokens
      accessToken = newAccessToken;
      tokenExpiry = Date.now() + 15 * 60 * 1000;
      
      if (newRefreshToken) {
        setCookie('refresh_token', newRefreshToken, 7);
      }
      
      if (newSessionId) {
        sessionId = newSessionId;
        setCookie('session_id', newSessionId, 7);
      }
      
      console.log('✅ Token refreshed successfully, new expiry:', new Date(tokenExpiry).toLocaleTimeString());
      
      // Process queued requests
      failedQueue.forEach(prom => prom.resolve(newAccessToken));
      failedQueue = [];
      
      return newAccessToken;
    } else {
      throw new Error('No access token in refresh response');
    }
  } catch (error) {
    console.error('❌ Token refresh failed:', error.response?.status, error.response?.data || error.message);
    
    // Clear all tokens on refresh failure
    clearTokens();
    
    // Reject all queued requests
    failedQueue.forEach(prom => prom.reject(error));
    failedQueue = [];
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('auth:logout'));
    throw error;
  } finally {
    isRefreshing = false;
  }
}

// ============================================
// INTERCEPTORS
// ============================================

// Request interceptor - Check token before request
authAxios.interceptors.request.use(async (config) => {
  // Don't attempt refresh on refresh endpoint itself
  if (config.url?.includes('/auth/refresh/')) {
    return config;
  }
  
  // If no access token but we have refresh token, try to refresh
  if (!accessToken && getRefreshToken()) {
    console.log('🔄 No access token, attempting refresh...');
    try {
      await refreshAccessToken();
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);
    }
  }
  
  // If token is expired, refresh it
  if (accessToken && isTokenExpired() && getRefreshToken()) {
    console.log('⏰ Access token expired, refreshing...');
    try {
      await refreshAccessToken();
    } catch (error) {
      console.error('❌ Failed to refresh expired token:', error);
    }
  }
  
  // Add token to request if available
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

// Response interceptor - Handle 401 errors
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry refresh endpoint
    if (originalRequest.url?.includes('/auth/refresh/')) {
      return Promise.reject(error);
    }
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Check if we have a refresh token
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.warn('⚠️ No refresh token, logging out');
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }

      try {
        console.log('🔄 401 received, refreshing token...');
        await refreshAccessToken();
        
        // Retry the original request with new token
        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return authAxios(originalRequest);
        } else {
          throw new Error('No access token after refresh');
        }
      } catch (refreshError) {
        console.error('❌ Refresh failed, logging out');
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// MEDIA API
// ============================================
export const mediaAPI = {
  getImageUrl: (imageData) => {
    if (!imageData) {
      return '/placeholder-banner.jpg';
    }

    if (typeof imageData === 'string' && imageData.startsWith('http')) {
      return imageData;
    }

    let imagePath = '';
    if (typeof imageData === 'string') {
      imagePath = imageData;
    } else if (typeof imageData === 'object') {
      imagePath = imageData.path || imageData.url || imageData.file || imageData.src || '';
    }

    if (!imagePath) {
      return '/placeholder-banner.jpg';
    }

    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `https://api.osimart.com/${cleanPath}`;
  },
  
  getBanners: () => osimartApi.get('/banners/'),
  getBanner: (id) => osimartApi.get(`/banners/${id}/`),
};

// ============================================
// PRODUCTS API
// ============================================
export const productAPI = {
  getProducts: (params = {}) => osimartApi.get('/products/', { params }),
  getProduct: (id) => osimartApi.get(`/products/${id}/`),
};

// ============================================
// CATEGORIES API
// ============================================
export const categoryAPI = {
  getCategories: () => osimartApi.get('/categories/'),
  getCategory: (id) => osimartApi.get(`/categories/${id}/`),
};

// ============================================
// VARIANT TYPES API
// ============================================
export const variantAPI = {
  getVariants: () => osimartApi.get('/variant-types/'),
  getVariant: (id) => osimartApi.get(`/variant-types/${id}/`),
};

// ============================================
// CART API
// ============================================
export const cartAPI = {
  viewCart: () => osimartApi.get('/cart/view/'),
  updateItem: ({ item_id, action, quantity }) => osimartApi.post('/cart/update-item/', {
    item_id,
    action,
    quantity,
  }),
  addItem: (item_id, quantity = 1) => {
    return cartAPI.updateItem({
      item_id,
      action: 'add',
      quantity,
    });
  },
  removeItem: (item_id, quantity = 1) => {
    return cartAPI.updateItem({
      item_id,
      action: 'remove',
      quantity,
    });
  },
  removeAll: (item_id) => {
    return cartAPI.updateItem({
      item_id,
      action: 'remove_all',
      quantity: 0,
    });
  },
};

// ============================================
// SHIPPING COUNTRIES API
// ============================================
export const shippingAPI = {
  getCountries: () => osimartApi.get('/shippingcountries/'),
  getCountry: (id) => osimartApi.get(`/shippingcountries/${id}/`),
};

// ============================================
// PAYMENT METHODS API
// ============================================
export const paymentAPI = {
  getPaymentMethods: () => osimartApi.get('/payment-methods/'),
  getPaymentMethod: (id) => osimartApi.get(`/payment-methods/${id}/`),
  getAvailablePaymentMethods: () => osimartApi.get('/available-payment-methods/'),
  getAvailablePaymentMethod: (id) => osimartApi.get(`/available-payment-methods/${id}/`),
};

// ============================================
// CHECKOUT API
// ============================================
export const checkoutAPI = {
  createCheckout: (data) => {
    console.log('📦 Creating checkout:', data);
    return osimartApi.post('/checkout/', data);
  },
  getCheckoutStatus: (id) => {
    console.log('📦 Getting checkout status:', id);
    return osimartApi.get(`/checkout/${id}/result/`);
  },
};

// ============================================
// ORDER SUMMARIES API
// ============================================
export const orderSummariesAPI = {
  getOrderSummaries: () => {
    console.log('📦 Fetching order summaries...');
    return osimartApi.get('/order-summaries/');
  },
  getOrderSummary: (id) => {
    console.log('📦 Fetching order summary:', id);
    return osimartApi.get(`/order-summaries/${id}/`);
  },
};

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  // ✅ LOGIN
  login: (data) => {
    console.log('🔐 Login request to Osimart:', data);
    return authAxios.post('/auth/login/', data, {
      params: { store: STORE_ID }
    });
  },
  
  // ✅ REGISTER
  register: (data) => {
    console.log('📝 Register request to Osimart:', data);
    return authAxios.post('/auth/register/', data, {
      params: { store: STORE_ID }
    });
  },
  
  // ✅ VERIFY
  verify: (data) => {
    console.log('✅ Verify request to Osimart:', data);
    return authAxios.post('/auth/verify/', data, {
      params: { store: STORE_ID }
    });
  },
  
  // ✅ RESEND VERIFICATION
  resendVerification: (data) => {
    console.log('📧 Resend verification request to Osimart:', data);
    return authAxios.post('/auth/regen/', data, {
      params: { store: STORE_ID }
    });
  },
  
  // ✅ LOGOUT - With full logging
  logout: () => {
    console.log('🚪 Logout request to Osimart');
    const body = {};
    const refreshToken = getRefreshToken();
    const sessionId = getSessionId();
    
    console.log('📤 Logout data:');
    console.log('  Refresh token:', refreshToken ? 'Yes (length: ' + refreshToken.length + ')' : 'No');
    console.log('  Session ID:', sessionId ? 'Yes (length: ' + sessionId.length + ')' : 'No');
    
    if (refreshToken) {
      body.refresh = refreshToken;
      body.refresh_token = refreshToken;
    }
    if (sessionId) {
      body.session_id = sessionId;
    }
    
    console.log('📤 Logout body:', body);
    
    return authAxios.post('/auth/logout/', body, {
      params: { store: STORE_ID }
    });
  },
  
  // ✅ CHANGE PASSWORD
  changePassword: (data) => {
    console.log('🔑 Change password request to Osimart:', data);
    return authAxios.post('/auth/change-password/', data, {
      params: { store: STORE_ID }
    });
  },
  
  // ✅ GET PROFILE
  getProfile: () => {
    console.log('👤 Get profile request to Osimart');
    return osimartApi.get('/customers/profile/', {
      params: { store: STORE_ID }
    });
  },
};

// ============================================
// EMAIL PREFIX
// ============================================
export const EMAIL_PREFIX = 'mystore1__';

export function cleanEmail(email) {
  if (!email) return '';
  return email.replace(new RegExp(`^${EMAIL_PREFIX}`), '');
}

export function prefixEmail(email) {
  if (!email) return '';
  return email.startsWith(EMAIL_PREFIX) ? email : `${EMAIL_PREFIX}${email}`;
}

// ============================================
// DEFAULT EXPORT
// ============================================
export default osimartApi;