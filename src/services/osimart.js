// src/services/osimart.js
import axios from 'axios';

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = 'https://api.osimart.com/store/apis';
const STORE_ID = '92ea209b-b32c-448e-85af-7296eb8eea00';

// ============================================
// AXIOS INSTANCE
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
  viewCart: () => {
    return osimartApi.get('/cart/view/');
  },

  addItem: (data) => {
    const payload = {
      product_id: data.product_id || data.item_id,
      quantity: data.quantity || 1,
      name: data.name || 'Product',
      price: data.price || 0,
      image: data.image || '',
    };
    return osimartApi.post('/cart/add/', payload);
  },

  updateItem: async (data) => {
    const formats = [
      {
        url: '/cart/update/',
        payload: { product_id: data.product_id || data.item_id, quantity: data.quantity || 1 }
      },
      {
        url: '/cart/update-item/',
        payload: { 'item-id': data.product_id || data.item_id, action: 'edit', quantity: data.quantity || 1 }
      },
      {
        url: '/cart/update-item/',
        payload: { product_id: data.product_id || data.item_id, action: 'edit', quantity: data.quantity || 1 }
      },
      {
        url: '/cart/update-item/',
        payload: { item_id: [data.product_id || data.item_id], action: 'edit', quantity: data.quantity || 1 }
      },
    ];

    let lastError = null;
    for (const format of formats) {
      try {
        const response = await osimartApi.post(format.url, format.payload);
        return response;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  },

  removeItem: async (data) => {
    const formats = [
      {
        url: '/cart/remove/',
        payload: { product_id: data.product_id || data.item_id }
      },
      {
        url: '/cart/update-item/',
        payload: { 'item-id': data.product_id || data.item_id, action: 'remove' }
      },
      {
        url: '/cart/update-item/',
        payload: { product_id: data.product_id || data.item_id, action: 'remove' }
      },
      {
        url: '/cart/update-item/',
        payload: { item_id: [data.product_id || data.item_id], action: 'remove' }
      },
    ];

    let lastError = null;
    for (const format of formats) {
      try {
        const response = await osimartApi.post(format.url, format.payload);
        return response;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  },
};

// ============================================
// ORDERS API
// ============================================
export const orderAPI = {
  getOrders: () => osimartApi.get('/orders/'),
  getOrder: (id) => osimartApi.get(`/orders/${id}/`),
  createOrder: (data) => osimartApi.post('/orders/', data),
};

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (data) => osimartApi.post('/auth/login/', data),
  register: (data) => osimartApi.post('/auth/register/', data),
  logout: () => osimartApi.post('/auth/logout/'),
  getProfile: () => osimartApi.get('/auth/profile/'),
};

// ============================================
// DEFAULT EXPORT
// ============================================
export default osimartApi;