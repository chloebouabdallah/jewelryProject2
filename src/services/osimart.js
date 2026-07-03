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
// ✅ CART API - All methods properly defined
// ============================================
export const cartAPI = {
  // Get cart
  viewCart: () => {
    console.log('📦 Viewing cart...');
    return osimartApi.get('/cart/view/');
  },

  // Add item to cart
  addItem: (data) => {
    console.log('🔄 Adding to cart:', data);
    const payload = {
      product_id: data.product_id || data.item_id,
      quantity: data.quantity || 1,
      name: data.name || 'Product',
      price: data.price || 0,
      image: data.image || '',
    };
    console.log('📤 Sending to /cart/add/:', payload);
    return osimartApi.post('/cart/add/', payload);
  },

  // Update item in cart
  updateItem: (data) => {
    console.log('🔄 Updating cart item:', data);
    const payload = {
      product_id: data.product_id || data.item_id,
      quantity: data.quantity || 1,
    };
    console.log('📤 Sending to /cart/update/:', payload);
    return osimartApi.post('/cart/update/', payload);
  },

  // Remove item from cart
  removeItem: (data) => {
    console.log('🔄 Removing from cart:', data);
    const payload = {
      product_id: data.product_id || data.item_id,
    };
    console.log('📤 Sending to /cart/remove/:', payload);
    return osimartApi.post('/cart/remove/', payload);
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