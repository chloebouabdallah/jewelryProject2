// src/services/osimart.js
import axios from 'axios';

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

// ✅ Add store ID to all requests automatically
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
// AXIOS INSTANCE FOR AUTH - Uses root URL
// ============================================
export const authAxios = axios.create({
  baseURL: ROOT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ✅ Token management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ✅ Request interceptor - Add token to all requests
authAxios.interceptors.request.use((config) => {
  // Get token from localStorage
  const authData = localStorage.getItem('soutou_auth');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      // Try different token field names
      const token = parsed.access_token || parsed.token || parsed.access;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token added to request:', config.url);
      }
    } catch (e) {
      console.warn('Failed to parse auth data for token:', e);
    }
  }
  return config;
});

// ✅ Response interceptor - Handle token refresh
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return authAxios(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('soutou_refresh_token');
        if (!refreshToken) {
          console.warn('⚠️ No refresh token available');
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
        
        if (newAccessToken) {
          // Save new tokens
          const authData = JSON.parse(localStorage.getItem('soutou_auth') || '{}');
          authData.access_token = newAccessToken;
          authData.token = newAccessToken;
          if (newRefreshToken) {
            authData.refresh_token = newRefreshToken;
            localStorage.setItem('soutou_refresh_token', newRefreshToken);
          }
          localStorage.setItem('soutou_auth', JSON.stringify(authData));
          
          console.log('✅ Token refreshed successfully');
          
          // Process queued requests
          processQueue(null, newAccessToken);
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return authAxios(originalRequest);
        } else {
          throw new Error('No token in refresh response');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        
        // Clear auth data
        localStorage.removeItem('soutou_auth');
        localStorage.removeItem('soutou_refresh_token');
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
  addItem: (item_id, quantity = 1) => cartAPI.updateItem({
    item_id,
    action: 'add',
    quantity,
  }),
  removeItem: (item_id, quantity = 1) => cartAPI.updateItem({
    item_id,
    action: 'remove',
    quantity,
  }),
  removeAll: (item_id) => cartAPI.updateItem({
    item_id,
    action: 'remove_all',
    quantity: 0,
  }),
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
  // ✅ VERIFY - 4-digit code verification
  verify: (data) => {
    console.log('✅ Verify request to Osimart:', data);
    return authAxios.post('/auth/verify/', data, {
      params: { store: STORE_ID }
    });
  },
  // ✅ RESEND VERIFICATION CODE - /auth/regen/
  resendVerification: (data) => {
    console.log('📧 Resend verification request to Osimart:', data);
    return authAxios.post('/auth/regen/', data, {
      params: { store: STORE_ID }
    });
  },
  // ✅ LOGOUT - Try with session_id and refresh_token
  logout: () => {
    console.log('🚪 Logout request to Osimart');
    
    // Get auth data from localStorage
    const authData = localStorage.getItem('soutou_auth');
    let refreshToken = null;
    let sessionId = null;
    
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        refreshToken = parsed.refresh_token || parsed.refresh;
        // Get session_id from the user data if available
        if (parsed.user && parsed.user.session_id) {
          sessionId = parsed.user.session_id;
        }
      } catch (e) {}
    }
    
    // Build the request body
    const body = {};
    
    // Send refresh token if available
    if (refreshToken) {
      body.refresh_token = refreshToken;
      body.refresh = refreshToken;
    }
    
    // Send session_id if available
    if (sessionId) {
      body.session_id = sessionId;
    }
    
    console.log('📤 Logout body:', body);
    
    return authAxios.post('/auth/logout/', body, {
      params: { store: STORE_ID }
    });
  },
  // ✅ GUEST REGISTER
  guestRegister: (data) => {
    console.log('👤 Guest register request to Osimart:', data);
    return authAxios.post('/auth/guest/', data, {
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
  // ✅ REFRESH TOKEN
  refreshToken: (data) => {
    console.log('🔄 Refresh token request to Osimart');
    return authAxios.post('/auth/refresh/', data, {
      params: { store: STORE_ID }
    });
  },
  // ✅ GET PROFILE - Using the correct store API endpoint
  getProfile: () => {
    console.log('👤 Get profile request to Osimart');
    // Try the auth endpoint instead
    return authAxios.get('/auth/profile/', {
      params: { store: STORE_ID }
    }).catch(() => {
      // Fallback to store API
      return osimartApi.get('/customers/profile/', {
        params: { store: STORE_ID }
      });
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

export default osimartApi;