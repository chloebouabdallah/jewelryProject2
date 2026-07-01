// src/stores/cart.js
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { cartAPI } from '@/services/osimart';

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
  const useApi = ref(true); // ✅ Try API first

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
  // LOCAL STORAGE HELPERS (Fallback)
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
  // API ACTIONS
  // ============================================

  /**
   * Fetch the current cart from Osimart API
   */
  async function fetchCart() {
    if (!useApi.value) {
      loadFromLocalStorage();
      return items.value;
    }

    isLoading.value = true;
    error.value = null;
    try {
      console.log('🔄 Fetching cart from Osimart API...');
      const response = await cartAPI.viewCart();
      console.log('✅ Cart API Response:', response.data);

      // Transform API response
      const cartData = response.data.cart || {};
      const cartItems = Object.values(cartData);

      if (cartItems.length > 0) {
        items.value = cartItems.map((item) => ({
          id: item.id || item.item_id || item.product_id,
          product_id: item.product_id,
          product_slug: item.product_slug || item.slug || '',
          name: item.product_name || item.name || 'Product',
          price: parseFloat(item.price) || 0,
          image: item.product_image || item.image || '/placeholder.jpg',
          quantity: item.quantity || 1,
          goldWeight: item.gold_weight || 0,
          silverWeight: item.silver_weight || 0,
          metalType: item.metal_type || 'none',
          originalPrice: parseFloat(item.original_price) || parseFloat(item.price) || 0,
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
          selected_variants: item.selected_variants || [],
        }));
        totalPrice.value = response.data.total_price || subtotal.value;
      } else {
        // If API returns empty, fallback to localStorage
        loadFromLocalStorage();
      }

      saveToLocalStorage();
      return items.value;
    } catch (err) {
      console.error('❌ Failed to fetch cart from API:', err);
      // Fallback to localStorage
      loadFromLocalStorage();
      return items.value;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update an item in the cart (add, update, or delete)
   */
  async function updateCartItem(itemId, action, quantity = 1, extraData = {}) {
    isLoading.value = true;
    error.value = null;

    // ✅ Optimistic update - update local cart first
    updateLocalCart(itemId, action, quantity, extraData);
    saveToLocalStorage();

    // ✅ Then try API
    if (useApi.value) {
      try {
        const payload = {
          item_id: itemId,
          action: action,
          quantity: quantity,
        };

        // Add custom fields if provided
        if (extraData.is_custom) {
          payload.is_custom = extraData.is_custom;
          payload.description = extraData.description || '';
          payload.metal = extraData.metal || '';
          payload.setting = extraData.setting || '';
          payload.shape = extraData.shape || '';
          payload.carat = extraData.carat || '';
          payload.band = extraData.band || '';
          payload.accent = extraData.accent || '';
          payload.price = extraData.price || 0;
        }

        console.log(`🔄 Sending to Osimart API:`, payload);

        const response = await cartAPI.updateItem(payload);
        console.log('✅ Cart update response:', response.data);

        // ✅ Refetch to sync with server
        await fetchCart();

        return { success: true, message: 'Cart updated successfully' };
      } catch (err) {
        console.error('❌ Failed to update cart via API:', err);
        
        // Check if it's a 404 - endpoint might not exist
        if (err.response?.status === 404) {
          console.warn('⚠️ Cart API endpoint not found. Using localStorage only.');
          useApi.value = false; // Disable API for future requests
          // Keep local changes since we already updated
          return { success: true, message: 'Cart updated locally (API unavailable)' };
        }
        
        return { success: true, message: 'Cart updated locally (API error)' };
      } finally {
        isLoading.value = false;
      }
    } else {
      isLoading.value = false;
      return { success: true, message: 'Cart updated locally' };
    }
  }

  /**
   * Update local cart
   */
  function updateLocalCart(itemId, action, quantity, extraData = {}) {
    if (action === 'delete') {
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
          variant_id: itemId,
          selected_variants: [],
        });
      }
    }
    totalPrice.value = subtotal.value;
    saveToLocalStorage();
  }

  /**
   * Add a product to the cart
   */
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

    const variantId = product.variant_id || product.id;

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

    const result = await updateCartItem(
      variantId,
      'add',
      product.quantity || 1,
      extraData
    );

    if (result.success) {
      lastAddedMessage.value = `${product.name} added to cart!`;
      setTimeout(() => {
        lastAddedMessage.value = '';
      }, 2000);
    }

    return result;
  }

  /**
   * Update quantity of an item in the cart
   */
  async function updateQuantity(productId, delta) {
    const item = items.value.find((i) => i.id === productId);
    if (!item) {
      return { success: false, message: 'Item not found' };
    }

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      return removeItem(productId);
    }

    return updateCartItem(productId, 'update', newQuantity);
  }

  /**
   * Remove an item from the cart
   */
  async function removeItem(productId) {
    return updateCartItem(productId, 'delete');
  }

  /**
   * Clear the entire cart
   */
  async function clearCart() {
    const itemIds = items.value.map((item) => item.id);
    for (const id of itemIds) {
      await updateCartItem(id, 'delete');
    }
    items.value = [];
    totalPrice.value = 0;
    saveToLocalStorage();
    return { success: true, message: 'Cart cleared' };
  }

  /**
   * Get product link from cart item
   */
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

  function getItemDisplayPrice(item) {
    if (!item) return 0;
    return item.price || 0;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  // Watch for changes and save to localStorage
  watch(items, () => {
    saveToLocalStorage();
  }, { deep: true });

  // Initialize with localStorage
  loadFromLocalStorage();

  return {
    // State
    items,
    totalPrice,
    isLoading,
    error,
    lastAddedMessage,
    pendingProduct,
    authRequiredMessage,
    currentUserEmail,

    // Getters
    itemCount,
    subtotal,
    tax,
    total,

    // Actions
    fetchCart,
    updateCartItem,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,

    // Helpers
    getProductLink,
    getItemDisplayPrice,

    // Auth Helpers
    setUser,
    addPendingAfterLogin,
    clearUserCartDisplay,
    getUserEmail,

    // Storage
    loadFromLocalStorage,
    saveToLocalStorage,
  };
});