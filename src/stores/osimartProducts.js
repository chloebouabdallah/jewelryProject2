// src/stores/osimartProducts.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { productAPI, mediaAPI } from '@/services/osimart';

export const useOsimartProductsStore = defineStore('osimartProducts', () => {
  const products = ref([]);
  const currentProduct = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchProducts(params = {}) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await productAPI.getProducts(params);
      
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
      
      // 🔍 DEBUG: Log the first product's structure
      if (products.value.length > 0) {
        const first = products.value[0];
        console.log('🔍 First product keys:', Object.keys(first));
        console.log('🔍 First product product_variants:', first.product_variants);
        console.log('🔍 First product vary_by:', first.vary_by);
        console.log('🔍 First product categories:', first.categories);
        console.log('🔍 First product full:', first);
      }
      
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

  function mapProduct(product) {
    if (!product) return null;
    
    // Get category
    let categoryId = null;
    let categoryName = '';
    let categorySlug = '';
    
    if (product.categories && product.categories.length > 0) {
      const firstCategory = product.categories[0];
      if (firstCategory && firstCategory.category) {
        categoryId = firstCategory.category.id;
        categoryName = firstCategory.category.name;
        categorySlug = firstCategory.category.slugified_name;
      }
    }
    
    // Get image
    let imageUrl = '/placeholder.jpg';
    if (product.main_image) {
      imageUrl = mediaAPI.getImageUrl(product.main_image);
    } else if (product.gallery && product.gallery.length > 0) {
      imageUrl = mediaAPI.getImageUrl(product.gallery[0].media);
    }
    
    // Get price
    let price = 0;
    let oldPrice = null;
    let stock = 0;
    
    // Try to get price from product_variants first
    if (product.product_variants && product.product_variants.length > 0) {
      const variant = product.product_variants[0];
      if (variant) {
        price = variant.price || 0;
        oldPrice = variant.compare_at_price || null;
        stock = variant.remaining_stock || 0;
      }
    }
    
    // ✅ FALLBACK: If price is 0, try to get it from the product directly
    if (price === 0 && product.price) {
      price = product.price;
    }
    if (price === 0 && product.base_price) {
      price = product.base_price;
    }
    if (price === 0 && product.price_range) {
      price = parseFloat(product.price_range) || 0;
    }
    
    // ✅ BUILD VARIANT TEXT
    let variantText = '';
    let metalType = 'none';
    let diamondWeight = '';
    let goldWeight = '';
    let silverWeight = '';
    let chainLength = '';
    let ringSize = '';
    let gemstone = '';
    
    // ✅ Try to get metal from product.metal_type or product.metal
    if (product.metal_type) {
      metalType = product.metal_type;
    } else if (product.metal) {
      metalType = product.metal;
    }
    
    // ✅ Try to get diamond weight from product.diamond_weight or product.diamond
    if (product.diamond_weight) {
      diamondWeight = product.diamond_weight + 'ct';
    } else if (product.diamond) {
      diamondWeight = product.diamond + 'ct';
    }
    
    // ✅ Try to get gold weight from product.gold_weight
    if (product.gold_weight) {
      goldWeight = product.gold_weight + 'g';
    }
    
    // ✅ Try to get silver weight from product.silver_weight
    if (product.silver_weight) {
      silverWeight = product.silver_weight + 'g';
    }
    
    // ✅ Try to get chain length from product.chain_length
    if (product.chain_length) {
      chainLength = product.chain_length;
    }
    
    // ✅ Try to get ring size from product.ring_size
    if (product.ring_size) {
      ringSize = product.ring_size;
    }
    
    // ✅ Try to get gemstone from product.gemstone
    if (product.gemstone && product.gemstone !== 'none') {
      gemstone = product.gemstone;
    }
    
    // ✅ Build the variant text from what we found
    let parts = [];
    if (metalType !== 'none') {
      parts.push(metalType.charAt(0).toUpperCase() + metalType.slice(1));
    }
    if (diamondWeight) {
      parts.push(diamondWeight);
    }
    if (goldWeight) {
      parts.push(goldWeight + ' Gold');
    }
    if (silverWeight) {
      parts.push(silverWeight + ' Silver');
    }
    if (chainLength) {
      parts.push(chainLength);
    }
    if (ringSize) {
      parts.push(ringSize);
    }
    if (gemstone) {
      parts.push(gemstone);
    }
    
    variantText = parts.join(' · ');
    
    // ✅ FALLBACK: If no variant text, use category name or "Jewelry"
    if (!variantText) {
      variantText = categoryName || 'Jewelry';
    }
    
    console.log(`✅ ${product.name} -> Metal: ${metalType}, Variant: "${variantText}"`);
    
    return {
      id: product.id || '',
      name: product.name || '',
      slug: product.slugified_name || product.name?.toLowerCase().replace(/\s+/g, '-') || '',
      price: price,
      oldPrice: oldPrice,
      description: product.description || '',
      image: imageUrl,
      images: [],
      category: categoryName,
      category_id: categoryId,
      category_slug: categorySlug,
      badge: product.badge || 'none',
      stock: stock || product.stock || 0,
      rating: 5.0,
      review_count: 0,
      tags: [],
      features: [],
      metalType: metalType,
      diamondWeight: diamondWeight,
      goldWeight: goldWeight,
      silverWeight: silverWeight,
      chainLength: chainLength,
      ringSize: ringSize,
      gemstone: gemstone,
      displayText: variantText,
      variants: product.vary_by || [],
      is_active: true,
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
    fetchProducts,
    mapProduct,
    mapProducts,
  };
});