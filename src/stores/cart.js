// src/stores/cart.js
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { cartAPI, mediaAPI } from '@/services/osimart';

export const useCartStore = defineStore('cart', () => {
  // ============================================
  // STATE
  // ============================================
  const items = ref([]);
  const totalPrice = ref(0);
  const isLoading = ref(false);
  const error = ref(null);
  const lastAddedMessage = ref('');
  const pendingProduct = ref(null);
  const authRequiredMessage = ref('');
  const currentUserEmail = ref(null);
  const useApi = ref(false); // Disabled by default

  // ============================================
  // GETTERS
  // ============================================
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });

  const tax = computed(() => subtotal.value * 0.08);

  const total = computed(() => subtotal.value + tax.value);

  // ============================================
  // LOCAL STORAGE HELPERS
  // ============================================
  function getStorageKey() {
    const userEmail = currentUserEmail.value;
    if (userEmail) {
      return `soutouCart_${userEmail}`;
    }
    return 'soutouCart_guest';
  }

  function saveToLocalStorage() {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(items.value));
  }

  function loadFromLocalStorage() {
    const key = getStorageKey();
    const savedCart = localStorage.getItem(key);
    if (savedCart) {
      try {
        items.value = JSON.parse(savedCart);
        totalPrice.value = subtotal.value;
      } catch (e) {
        items.value = [];
        totalPrice.value = 0;
      }
    } else {
      items.value = [];
      totalPrice.value = 0;
    }
  }

  // ============================================
  // HELPER: Extract product ID
  // ============================================
  function extractProductId(product) {
    if (!product) return null;
    
    console.log('🔍 Extracting ID from:', product.name || product.id);
    
    if (product.id) {
      console.log('✅ Using product ID:', product.id);
      return product.id;
    }
    
    if (product.product_id) {
      console.log('✅ Using product_id:', product.product_id);
      return product.product_id;
    }
    
    console.error('❌ Could not extract valid ID from product');
    return null;
  }

  // ============================================
  // UPDATE LOCAL CART
  // ============================================
  function updateLocalCart(itemId, action, quantity, extraData = {}) {
    if (action === 'delete' || action === 'remove') {
      items.value = items.value.filter((item) => item.id !== itemId);
    } else if (action === 'add' || action === 'update') {
      const existingItem = items.value.find((item) => item.id === itemId);
      if (existingItem) {
        existingItem.quantity = quantity;
        if (extraData.name) existingItem.name = extraData.name;
        if (extraData.price) existingItem.price = extraData.price;
        if (extraData.image) existingItem.image = extraData.image;
        if (extraData.product_id) existingItem.product_id = extraData.product_id;
        if (extraData.product_slug) existingItem.product_slug = extraData.product_slug;
        if (extraData.slug) existingItem.product_slug = extraData.slug;
        if (extraData.goldWeight !== undefined) existingItem.goldWeight = extraData.goldWeight;
        if (extraData.silverWeight !== undefined) existingItem.silverWeight = extraData.silverWeight;
        if (extraData.metalType) existingItem.metalType = extraData.metalType;
        if (extraData.displayText) existingItem.displayText = extraData.displayText;
        if (extraData.isCustom) existingItem.isCustom = extraData.isCustom;
        if (extraData.description) existingItem.description = extraData.description;
        if (extraData.metal) existingItem.metal = extraData.metal;
        if (extraData.setting) existingItem.setting = extraData.setting;
        if (extraData.shape) existingItem.shape = extraData.shape;
        if (extraData.carat) existingItem.carat = extraData.carat;
        if (extraData.band) existingItem.band = extraData.band;
        if (extraData.accent) existingItem.accent = extraData.accent;
      } else if (action === 'add') {
        items.value.push({
          id: itemId,
          product_id: extraData.product_id || itemId,
          product_slug: extraData.product_slug || extraData.slug || '',
          quantity: quantity,
          name: extraData.name || 'Product',
          price: extraData.price || 0,
          image: extraData.image || '/placeholder.jpg',
          goldWeight: extraData.goldWeight || 0,
          silverWeight: extraData.silverWeight || 0,
          metalType: extraData.metalType || 'none',
          originalPrice: extraData.originalPrice || extraData.price || 0,
          displayText: extraData.displayText || '',
          isCustom: extraData.isCustom || false,
          description: extraData.description || '',
          metal: extraData.metal || '',
          setting: extraData.setting || '',
          shape: extraData.shape || '',
          carat: extraData.carat || '',
          band: extraData.band || '',
          accent: extraData.accent || '',
          variant_id: extraData.variant_id || itemId,
          selected_variants: [],
        });
      }
    }
    totalPrice.value = subtotal.value;
    saveToLocalStorage();
  }

  // ============================================
  // FETCH CART
  // ============================================
  async function fetchCart() {
    isLoading.value = true;
    error.value = null;

    try {
      console.log('📦 Fetching cart from API...');
      
      if (useApi.value) {
        try {
          const response = await cartAPI.viewCart();
          console.log('✅ Cart API response:', response.data);
          
          if (response.data && response.data.items) {
            items.value = response.data.items.map(item => ({
              id: item.id || item.product_id,
              product_id: item.product_id,
              product_slug: item.slug || '',
              quantity: item.quantity || 1,
              name: item.name || 'Product',
              price: item.price || 0,
              image: item.image ? mediaAPI.getImageUrl(item.image) : '/placeholder.jpg',
              goldWeight: item.goldWeight || 0,
              silverWeight: item.silverWeight || 0,
              metalType: item.metalType || 'none',
              originalPrice: item.original_price || item.price || 0,
              displayText: item.display_text || '',
              isCustom: item.is_custom || false,
              description: item.description || '',
              metal: item.metal || '',
              setting: item.setting || '',
              shape: item.shape || '',
              carat: item.carat || '',
              band: item.band || '',
              accent: item.accent || '',
              variant_id: item.variant_id || item.id,
            }));
            
            totalPrice.value = subtotal.value;
            saveToLocalStorage();
            return items.value;
          }
        } catch (err) {
          console.warn('⚠️ Failed to fetch cart from API:', err.message);
          if (err.response?.status === 404) {
            useApi.value = false;
          }
        }
      }
      
      console.log('📦 Loading cart from localStorage...');
      loadFromLocalStorage();
      console.log('✅ Cart loaded:', items.value.length, 'items');
      return items.value;
      
    } catch (err) {
      console.error('❌ Failed to load cart:', err.message);
      error.value = 'Failed to load cart';
      return items.value;
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================
  // ADD TO CART
  // ============================================
  async function addToCart(product, isAuthenticated, openAuthModal) {
    console.log(`🛒 ADD TO CART: ${product.name}, authenticated: ${isAuthenticated}`);

    if (!isAuthenticated) {
      pendingProduct.value = product;
      authRequiredMessage.value = 'Please login or signup to add items to cart';
      setTimeout(() => {
        authRequiredMessage.value = '';
      }, 3000);
      return { success: false, message: 'Please login to add items to cart' };
    }

    const itemId = extractProductId(product);
    
    if (!itemId) {
      console.error('❌ Could not extract valid ID from product');
      return { success: false, message: 'Could not add product to cart (invalid ID)' };
    }

    console.log(`✅ Using item ID: ${itemId}`);

    const extraData = {
      name: product.name,
      price: product.price,
      image: product.image,
      product_id: product.id,
      product_slug: product.slug || '',
      goldWeight: product.goldWeight || 0,
      silverWeight: product.silverWeight || 0,
      metalType: product.metalType || 'none',
      originalPrice: product.originalPrice || product.price,
      displayText: product.displayText || '',
      variant_id: itemId,
    };

    if (product.isCustom) {
      extraData.isCustom = true;
      extraData.description = product.description || '';
      extraData.metal = product.metal || '';
      extraData.setting = product.setting || '';
      extraData.shape = product.shape || '';
      extraData.carat = product.carat || '';
      extraData.band = product.band || '';
      extraData.accent = product.accent || '';
      extraData.price = product.price || 0;
    }

    // Update local cart
    updateLocalCart(itemId, 'add', product.quantity || 1, extraData);
    saveToLocalStorage();

    // Try API if enabled
    if (useApi.value) {
      try {
        await cartAPI.addItem({
          product_id: itemId,
          quantity: product.quantity || 1,
          name: product.name,
          price: product.price,
          image: product.image,
        });
        console.log('✅ Item added via API');
        await fetchCart();
      } catch (err) {
        console.warn('⚠️ API add failed, using localStorage:', err.message);
        if (err.response?.status === 404) {
          useApi.value = false;
        }
      }
    }

    lastAddedMessage.value = `${product.name} added to cart!`;
    setTimeout(() => {
      lastAddedMessage.value = '';
    }, 2000);

    return { success: true, message: 'Item added to cart' };
  }

  // ============================================
  // UPDATE QUANTITY
  // ============================================
  async function updateQuantity(productId, delta) {
    const item = items.value.find((i) => i.id === productId);
    if (!item) {
      return { success: false, message: 'Item not found' };
    }

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      return removeItem(productId);
    }

    // Update local cart
    updateLocalCart(productId, 'update', newQuantity);
    saveToLocalStorage();

    // Try API if enabled
    if (useApi.value) {
      try {
        await cartAPI.updateItem({
          product_id: productId,
          quantity: newQuantity,
        });
        console.log('✅ Quantity updated via API');
        await fetchCart();
      } catch (err) {
        console.warn('⚠️ API update failed, using localStorage:', err.message);
        if (err.response?.status === 404) {
          useApi.value = false;
        }
      }
    }

    return { success: true };
  }

  // ============================================
  // REMOVE ITEM
  // ============================================
  async function removeItem(productId) {
    // Update local cart
    updateLocalCart(productId, 'delete');
    saveToLocalStorage();

    // Try API if enabled
    if (useApi.value) {
      try {
        await cartAPI.removeItem({
          product_id: productId,
        });
        console.log('✅ Item removed via API');
        await fetchCart();
      } catch (err) {
        console.warn('⚠️ API remove failed, using localStorage:', err.message);
        if (err.response?.status === 404) {
          useApi.value = false;
        }
      }
    }

    return { success: true };
  }

  // ============================================
  // CLEAR CART
  // ============================================
  async function clearCart() {
    try {
      const itemIds = items.value.map((item) => item.id);
      
      items.value = [];
      totalPrice.value = 0;
      saveToLocalStorage();

      if (useApi.value && itemIds.length > 0) {
        try {
          for (const id of itemIds) {
            await cartAPI.removeItem({ product_id: id });
          }
          await fetchCart();
        } catch (err) {
          console.warn('⚠️ Failed to clear cart via API:', err.message);
          if (err.response?.status === 404) {
            useApi.value = false;
          }
        }
      }

      console.log('✅ Cart cleared');
      return { success: true, message: 'Cart cleared' };
    } catch (err) {
      console.error('❌ Failed to clear cart:', err.message);
      return { success: false, message: 'Failed to clear cart' };
    }
  }

  // ============================================
  // HELPERS
  // ============================================
  function getProductLink(item) {
    if (!item) return '/collections';
    if (item.product_slug) {
      return `/product/${item.product_slug}`;
    }
    if (item.product_id) {
      return `/product/${item.product_id}`;
    }
    return `/product/${item.id}`;
  }

  function getItemDisplayPrice(item) {
    if (!item) return 0;
    return item.price || 0;
  }

  // ============================================
  // AUTHENTICATION HELPERS
  // ============================================
  function setUser(email) {
    console.log(`👤 SET USER: ${email || 'guest'}`);
    currentUserEmail.value = email;
    if (email) {
      fetchCart();
    } else {
      items.value = [];
      totalPrice.value = 0;
      saveToLocalStorage();
    }
  }

  async function addPendingAfterLogin() {
    if (pendingProduct.value) {
      const result = await addToCart(pendingProduct.value, true, null);
      pendingProduct.value = null;
      return result.success;
    }
    return false;
  }

  function clearUserCartDisplay() {
    items.value = [];
    totalPrice.value = 0;
    saveToLocalStorage();
  }

  function getUserEmail() {
    return currentUserEmail.value;
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  watch(items, () => {
    saveToLocalStorage();
  }, { deep: true });

  loadFromLocalStorage();

  // ============================================
  // RETURN
  // ============================================
  return {
    items,
    totalPrice,
    isLoading,
    error,
    lastAddedMessage,
    pendingProduct,
    authRequiredMessage,
    currentUserEmail,

    itemCount,
    subtotal,
    tax,
    total,

    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,

    getProductLink,
    getItemDisplayPrice,

    setUser,
    addPendingAfterLogin,
    clearUserCartDisplay,
    getUserEmail,

    loadFromLocalStorage,
    saveToLocalStorage,
  };
});