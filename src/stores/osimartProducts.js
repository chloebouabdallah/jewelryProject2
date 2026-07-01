// src/stores/osimartProducts.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { productAPI, mediaAPI } from '@/services/osimart';
import { useOsimartVariantsStore } from './osimartVariants';

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
      console.log('🔄 Fetching product detail with ID:', id);
      const response = await productAPI.getProduct(id);
      console.log('✅ Product detail fetched');
      
      currentProduct.value = response.data;
      
      const index = products.value.findIndex(p => p.id === id);
      if (index !== -1) {
        products.value[index] = response.data;
      }
      
      return currentProduct.value;
    } catch (err) {
      error.value = err.message || 'Failed to fetch product';
      console.error('❌ Failed to fetch product detail:', err);
      currentProduct.value = null;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function stripHtml(html) {
    if (!html) return '';
    if (typeof DOMParser !== 'undefined') {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    }
    return html.replace(/<[^>]*>/g, '').trim();
  }

  function getVariantIcon(typeName) {
    const mapping = {
      'metal type': 'fas fa-circle',
      'length': 'fas fa-ruler',
      'chain length': 'fas fa-ruler',
      'gold weight': 'fas fa-weight-hanging',
      'silver weight': 'fas fa-weight-hanging',
      'diamond weight': 'fas fa-gem',
      'diamond weight (ct)': 'fas fa-gem',
      'rose gold weight': 'fas fa-weight-hanging',
      'morganite weight': 'fas fa-gem',
      'platinum weight': 'fas fa-weight-hanging',
      'silver weight (g)': 'fas fa-weight-hanging',
      'gold weight (g)': 'fas fa-weight-hanging',
    };
    const lowerType = typeName?.toLowerCase() || '';
    return mapping[lowerType] || 'fas fa-tag';
  }

  function buildVariantDisplayText(variants) {
    const parts = [];
    const priority = ['Metal Type', 'Gold Weight', 'Silver Weight', 'Rose Gold Weight', 'Diamond Weight', 'Morganite Weight', 'Chain Length'];
    
    priority.forEach(type => {
      if (variants[type] && variants[type].length > 0) {
        parts.push(variants[type].join(' · '));
      }
    });
    
    return parts.join(' · ');
  }

  function extractProductVariants(product) {
    const variants = {};
    const seenValues = {};
    const variantStore = useOsimartVariantsStore();
    
    console.log('🔍 Extracting variants from product:', product?.name);
    
    const variantTypeMap = {};
    if (product?.vary_by && Array.isArray(product.vary_by)) {
      product.vary_by.forEach(variant => {
        if (variant.id) {
          variantTypeMap[variant.id] = {
            name: variant.name,
            label: variant.label || variant.name,
          };
        }
      });
    }
    
    if (product?.product_variants && product.product_variants.length > 0) {
      const variant = product.product_variants[0];
      
      if (variant.values && Array.isArray(variant.values)) {
        variant.values.forEach(val => {
          if (!val) return;
          const valName = val.name || '';
          const typeId = val.type || val.type_id || '';
          
          let displayName = '';
          let rawTypeName = '';
          
          if (typeId && variantTypeMap[typeId]) {
            rawTypeName = variantTypeMap[typeId].name;
            displayName = variantTypeMap[typeId].label || rawTypeName;
          } else {
            rawTypeName = detectVariantTypeFromValue(valName);
            displayName = variantStore.getVariantDisplayName(rawTypeName);
          }
          
          if (displayName) {
            const key = `${displayName}:${valName}`;
            if (!seenValues[key]) {
              seenValues[key] = true;
              if (!variants[displayName]) {
                variants[displayName] = [];
              }
              if (!variants[displayName].includes(valName)) {
                variants[displayName].push(valName);
              }
            }
          }
        });
      }
    }
    
    return variants;
  }

  function detectVariantTypeFromValue(value) {
    const lowerValue = value.toLowerCase();
    
    if (lowerValue === 'gold' || lowerValue === 'silver' || lowerValue === 'rose gold' || lowerValue === 'platinum') {
      return 'Metal Type';
    }
    if (lowerValue.includes('rose gold') && lowerValue.includes('g')) {
      return 'Rose Gold Weight';
    }
    if (lowerValue.includes('morganite') && lowerValue.includes('g')) {
      return 'Morganite Weight';
    }
    if (lowerValue.includes('gold') && lowerValue.includes('g')) {
      return 'Gold Weight';
    }
    if (lowerValue.includes('silver') && lowerValue.includes('g')) {
      return 'Silver Weight';
    }
    if (lowerValue.includes('ct') || lowerValue.includes('carat')) {
      return 'Diamond Weight';
    }
    if (lowerValue.includes('"') || lowerValue.includes('inch')) {
      return 'Chain Length';
    }
    if (lowerValue.includes('g') && !lowerValue.includes('ct')) {
      return 'Weight';
    }
    if (lowerValue.includes('morganite')) {
      return 'Morganite Weight';
    }
    if (lowerValue.includes('size') || lowerValue.includes('ring')) {
      return 'Ring Size';
    }
    return 'Variant';
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
    
    // ✅ Get images - PREVENT DUPLICATES
    const allImages = [];
    const seenImages = new Set();
    
    // 1. Add main image (if it exists)
    if (product.main_image) {
      const mainUrl = mediaAPI.getImageUrl(product.main_image);
      if (mainUrl && !seenImages.has(mainUrl)) {
        seenImages.add(mainUrl);
        allImages.push(mainUrl);
      }
    }
    
    // 2. Add gallery images (skip duplicates)
    if (product.gallery && Array.isArray(product.gallery)) {
      product.gallery.forEach(item => {
        if (item && item.media) {
          const imageUrl = mediaAPI.getImageUrl(item.media);
          if (imageUrl && !seenImages.has(imageUrl)) {
            seenImages.add(imageUrl);
            allImages.push(imageUrl);
          }
        }
      });
    }
    
    // ✅ Set main image URL
    let imageUrl = '/placeholder.jpg';
    if (product.main_image) {
      imageUrl = mediaAPI.getImageUrl(product.main_image);
    } else if (allImages.length > 0) {
      imageUrl = allImages[0];
    }
    
    // Get price
    let price = 0;
    let oldPrice = null;
    let stock = 0;
    
    if (product.product_variants && product.product_variants.length > 0) {
      const variant = product.product_variants[0];
      if (variant) {
        price = variant.price || 0;
        oldPrice = variant.compare_at_price || null;
        stock = variant.remaining_stock || 0;
      }
    }
    
    if (price === 0 && product.price) {
      price = product.price;
    }
    if (price === 0 && product.base_price) {
      price = product.base_price;
    }
    if (price === 0 && product.price_range) {
      price = parseFloat(product.price_range) || 0;
    }
    
    const cleanDescription = stripHtml(product.description);
    
    const variants = extractProductVariants(product);
    const displayText = buildVariantDisplayText(variants);
    
    const features = [];
    Object.keys(variants).forEach(type => {
      if (variants[type] && variants[type].length > 0) {
        features.push({
          label: type,
          value: variants[type].join(' · '),
          icon: getVariantIcon(type)
        });
      }
    });
    
    const tags = [];
    Object.keys(variants).forEach(type => {
      if (variants[type] && variants[type].length > 0) {
        variants[type].forEach(val => {
          let tag = val.replace(/ \d+g$/, '').replace(/ \d+ct$/, '');
          if (!tags.includes(tag) && tag.length > 1) {
            tags.push(tag);
          }
        });
      }
    });
    
    let badge = 'none';
    if (product.badge) {
      badge = product.badge;
    }
    
    let metalType = 'none';
    if (variants['Metal Type'] && variants['Metal Type'].length > 0) {
      metalType = variants['Metal Type'][0].toLowerCase().replace(' ', '-');
    }
    
    let diamondWeight = '';
    if (variants['Diamond Weight'] && variants['Diamond Weight'].length > 0) {
      diamondWeight = variants['Diamond Weight'][0];
    }
    
    let goldWeight = '';
    if (variants['Gold Weight'] && variants['Gold Weight'].length > 0) {
      goldWeight = variants['Gold Weight'][0];
    }
    
    let silverWeight = '';
    if (variants['Silver Weight'] && variants['Silver Weight'].length > 0) {
      silverWeight = variants['Silver Weight'][0];
    }
    
    let chainLength = '';
    if (variants['Chain Length'] && variants['Chain Length'].length > 0) {
      chainLength = variants['Chain Length'][0];
    }
    
    let gemstone = 'none';
    if (variants['Morganite Weight'] && variants['Morganite Weight'].length > 0) {
      gemstone = 'Morganite';
    }
    
    return {
      id: product.id || '',
      name: product.name || '',
      slug: product.slugified_name || product.name?.toLowerCase().replace(/\s+/g, '-') || '',
      price: price,
      oldPrice: oldPrice,
      description: cleanDescription,
      image: imageUrl,
      images: allImages, // ✅ Unique images only
      category: categoryName,
      category_id: categoryId,
      category_slug: categorySlug,
      badge: badge,
      stock: stock || product.stock || 0,
      rating: 5.0,
      review_count: 0,
      tags: tags,
      features: features,
      metalType: metalType,
      diamondWeight: diamondWeight,
      goldWeight: goldWeight,
      silverWeight: silverWeight,
      chainLength: chainLength,
      ringSize: '',
      gemstone: gemstone,
      displayText: displayText,
      variants: product.vary_by || [],
      allVariants: variants,
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
    fetchProduct,
    mapProduct,
    mapProducts,
  };
});