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
// MEDIA API - For images and banners
// ============================================
export const mediaAPI = {
  // Get full image URL
  getImageUrl: (imageData) => {
    if (!imageData) {
      return '/placeholder-banner.jpg';
    }

    // If it's already a full URL, return it
    if (typeof imageData === 'string' && imageData.startsWith('http')) {
      return imageData;
    }

    // Get the image path
    let imagePath = '';
    if (typeof imageData === 'string') {
      imagePath = imageData;
    } else if (typeof imageData === 'object') {
      imagePath = imageData.path || imageData.url || imageData.file || imageData.src || '';
    }

    if (!imagePath) {
      return '/placeholder-banner.jpg';
    }

    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `https://api.osimart.com/${cleanPath}`;
  },
  
  // Banner endpoints
  getBanners: () => osimartApi.get('/banners/'),
  getBanner: (id) => osimartApi.get(`/banners/${id}/`),
};

// ============================================
// PRODUCTS API
// ============================================
export const productAPI = {
  // ✅ Get all products - can filter by category
  // Usage: productAPI.getProducts({ category: 1 }) 
  //        productAPI.getProducts({ category_slug: 'necklaces' })
  getProducts: (params = {}) => osimartApi.get('/products/', { params }),
  
  // Get single product by ID
  getProduct: (id) => osimartApi.get(`/products/${id}/`),
};

// ============================================
// CATEGORIES API
// ============================================
export const categoryAPI = {
  // Get all categories
  getCategories: () => osimartApi.get('/categories/'),
  
  // Get single category by ID
  getCategory: (id) => osimartApi.get(`/categories/${id}/`),
};

// ============================================
// CART API (for future use)
// ============================================
export const cartAPI = {
  getCart: () => osimartApi.get('/cart/'),
  addToCart: (data) => osimartApi.post('/cart/items/', data),
  updateCartItem: (id, data) => osimartApi.patch(`/cart/items/${id}/`, data),
  removeFromCart: (id) => osimartApi.delete(`/cart/items/${id}/`),
  clearCart: () => osimartApi.delete('/cart/'),
};

// ============================================
// ORDERS API (for future use)
// ============================================
export const orderAPI = {
  getOrders: () => osimartApi.get('/orders/'),
  getOrder: (id) => osimartApi.get(`/orders/${id}/`),
  createOrder: (data) => osimartApi.post('/orders/', data),
};

// ============================================
// AUTH API (if Osimart handles auth)
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