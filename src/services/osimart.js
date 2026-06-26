// src/services/osimart.js
import axios from 'axios';

const API_BASE_URL = 'https://api.osimart.com/store/apis';
const STORE_ID = '92ea209b-b32c-448e-85af-7296eb8eea00';

export const osimartApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
// MEDIA API - FIXED IMAGE URL HANDLING
// ============================================
export const mediaAPI = {
  getImageUrl: (imageData) => {
    // If no image data, return placeholder
    if (!imageData) {
      return '/placeholder-collection.jpg';
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
      // Try different possible field names
      imagePath = imageData.path || imageData.url || imageData.file || imageData.src || '';
    }

    // If no path found, return placeholder
    if (!imagePath) {
      return '/placeholder-collection.jpg';
    }

    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    // Build the full URL
    // The correct base URL for images is the main API domain
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
};

export default osimartApi;