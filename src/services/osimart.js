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

// Access token - stored in memory only
let accessToken = null;
let sessionId = null;

// Set tokens
export function setTokens(tokens) {
  if (tokens.access_token) {
    accessToken = tokens.access_token;
    console.log('🔑 Access token stored in memory');
  }
  
  if (tokens.refresh_token) {
    setCookie('refresh_token', tokens.refresh_token, 7);
    console.log('🔑 Refresh token stored in secure cookie');
  }
  
  if (tokens.session_id) {
    sessionId = tokens.session_id;
    setCookie('session_id', tokens.session_id, 7);
  }
}

// Clear tokens
export function clearTokens() {
  accessToken = null;
  sessionId = null;
  deleteCookie('refresh_token');
  deleteCookie('session_id');
  console.log('🗑️ All tokens cleared');
}

// Get refresh token from cookie
function getRefreshToken() {
  return getCookie('refresh_token');
}

// Get session ID from cookie
function getSessionId() {
  return sessionId || getCookie('session_id');
}

// Get access token
export function getAccessToken() {
  return accessToken;
}

// ============================================
// INTERCEPTORS
// ============================================

// Request interceptor - Add access token
authAxios.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    console.log('🔑 Access token added to request:', config.url);
  }
  return config;
});

// Response interceptor - Handle token refresh
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('🔄 Refreshing access token...');
        
        const response = await authAxios.post('/auth/refresh/', {
          refresh: refreshToken
        }, {
          params: { store: STORE_ID }
        });

        const newAccessToken = response.data.access || response.data.access_token || response.data.token;
        const newRefreshToken = response.data.refresh || response.data.refresh_token;
        const newSessionId = response.data.session_id;
        
        if (newAccessToken) {
          accessToken = newAccessToken;
          
          if (newRefreshToken) {
            setCookie('refresh_token', newRefreshToken, 7);
          }
          
          if (newSessionId) {
            sessionId = newSessionId;
            setCookie('session_id', newSessionId, 7);
          }
          
          console.log('✅ Token refreshed successfully');
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return authAxios(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
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
// CART API - ADD THIS BACK
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
  
  // ✅ LOGOUT
  logout: () => {
    console.log('🚪 Logout request to Osimart');
    
    const body = {};
    const refreshToken = getRefreshToken();
    const sessionId = getSessionId();
    
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