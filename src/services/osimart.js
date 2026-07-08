// src/services/osimart.js - Add token interceptor for authAxios

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

// ✅ Add token to auth requests if available
authAxios.interceptors.request.use((config) => {
  // Get token from localStorage
  const authData = localStorage.getItem('soutou_auth');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch (e) {
      console.warn('Failed to parse auth data for token:', e);
    }
  }
  return config;
});

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
// AUTH API - Uses authAxios (root URL)
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
  // ✅ LOGOUT
  logout: () => {
    console.log('🚪 Logout request to Osimart');
    return authAxios.post('/auth/logout/', null, {
      params: { store: STORE_ID }
    });
  },
  // ✅ GET PROFILE
  getProfile: () => {
    console.log('👤 Get profile request to Osimart');
    return authAxios.get('/auth/profile/', {
      params: { store: STORE_ID }
    });
  },
};

export default osimartApi;