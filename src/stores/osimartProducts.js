// src/stores/osimartProducts.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { productAPI, mediaAPI } from '@/services/osimart';

export const useOsimartProductsStore = defineStore('osimartProducts', () => {
  const products = ref([]);
  const currentProduct = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const getProductById = computed(() => {
    return (id) => products.value.find(p => p.id === id);
  });

  const getProductsByCategory = computed(() => {
    return (categoryId) => products.value.filter(p => p.category_id === categoryId);
  });

  async function fetchProducts(params = {}) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await productAPI.getProducts(params);
      console.log('✅ Products API Response:', response.data);
      
      let productData = [];
      if (response.data && response.data.results) {
        productData = response.data.results;
      } else if (Array.isArray(response.data)) {
        productData = response.data;
      } else if (response.data) {
        productData = [response.data];
      }
      
      products.value = Array.isArray(productData) ? productData : [];
      console.log('✅ Products stored:', products.value.length);
      return products.value;
      
    } catch (err) {
      error.value = err.message || 'Failed to fetch products';
      console.error('❌ Failed to fetch products:', err);
      products.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchProduct(id) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await productAPI.getProduct(id);
      currentProduct.value = response.data || null;
      return currentProduct.value;
    } catch (err) {
      error.value = err.message || 'Failed to fetch product';
      console.error('❌ Failed to fetch product:', err);
      currentProduct.value = null;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function mapProduct(product) {
    if (!product) return null;
    
    let imageUrl = '/placeholder.jpg';
    if (product.images && product.images.length > 0) {
      imageUrl = mediaAPI.getImageUrl(product.images[0]);
    } else if (product.main_image) {
      imageUrl = mediaAPI.getImageUrl(product.main_image);
    } else if (product.image) {
      imageUrl = mediaAPI.getImageUrl(product.image);
    }

    const allImages = [];
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        allImages.push(mediaAPI.getImageUrl(img));
      });
    }
    if (product.main_image) {
      allImages.unshift(mediaAPI.getImageUrl(product.main_image));
    }

    return {
      id: product.id || '',
      name: product.name || '',
      slug: product.slug || product.name?.toLowerCase().replace(/\s+/g, '-') || '',
      price: parseFloat(product.price) || 0,
      oldPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
      description: product.description || '',
      short_description: product.short_description || (product.description || '').substring(0, 100),
      image: imageUrl,
      images: allImages.length > 0 ? allImages : [imageUrl],
      category: product.category_name || '',
      category_id: product.category_id || '',
      category_slug: product.category_slug || '',
      badge: product.badge || 'none',
      stock: product.stock_quantity || product.stock || 0,
      rating: parseFloat(product.rating) || 5.0,
      review_count: product.reviews_count || 0,
      tags: Array.isArray(product.tags) ? product.tags : [],
      features: Array.isArray(product.features) ? product.features : [],
      metalType: product.metal_type || 'none',
      goldWeight: parseFloat(product.gold_weight) || 0,
      silverWeight: parseFloat(product.silver_weight) || 0,
      gemstone: product.gemstone || 'none',
      diamondWeight: parseFloat(product.diamond_weight) || 0,
      chain_length: product.chain_length || '',
      ring_size: product.ring_size || '',
      style: product.style || 'classic',
      variants: Array.isArray(product.variants) ? product.variants : [],
      is_active: product.is_active !== false,
    };
  }

  function mapProducts(productList) {
    if (!Array.isArray(productList)) return [];
    return productList.map(p => mapProduct(p)).filter(p => p !== null);
  }

  return {
    products,
    currentProduct,
    isLoading,
    error,
    getProductById,
    getProductsByCategory,
    fetchProducts,
    fetchProduct,
    mapProduct,
    mapProducts,
  };
});