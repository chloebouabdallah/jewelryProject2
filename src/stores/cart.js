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
  const useApi = ref(true); // Enable API calls
  const isSyncing = ref(false);

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
        console.log('📦 Loaded from localStorage:', items.value.length, 'items');
      } catch (e) {
        console.warn('⚠️ Failed to parse localStorage:', e);
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
      console.log(`🗑️ Removed item ${itemId} from local cart`);
    } else if (action === 'add' || action === 'update') {
      const existingItem = items.value.find((item) => item.id === itemId);
      if (existingItem) {
        // Update existing item
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
        console.log(`📝 Updated item ${itemId} in local cart, quantity: ${quantity}`);
      } else if (action === 'add') {
        // Add new item
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
        console.log(`➕ Added item ${itemId} to local cart, quantity: ${quantity}`);
      }
    }
    totalPrice.value = subtotal.value;
    saveToLocalStorage();
  }

  // ============================================
  // SYNC LOCAL CART WITH API
  // ============================================
  async function syncWithApi() {
    if (!useApi.value || isSyncing.value) return;
    
    isSyncing.value = true;
    console.log('🔄 Syncing cart with API...');
    
    try {
      // Get current cart from API
      const response = await cartAPI.viewCart();
      console.log('✅ API cart response:', response.data);
      
      if (response.data && response.data.items) {
        // Transform API items to local format
        const apiItems = response.data.items.map(item => ({
          id: item.id || item.product_id,
          product_id: item.product_id,
          product_slug: item.slug || '',
          quantity: item.quantity || 1,
          name: item.name || 'Product',
          price: item.price || 0,
          image: item.image ? mediaAPI.getImageUrl(item.image) : '/placeholder.jpg',
          goldWeight: item.gold_weight || item.goldWeight || 0,
          silverWeight: item.silver_weight || item.silverWeight || 0,
          metalType: item.metal_type || item.metalType || 'none',
          originalPrice: item.original_price || item.originalPrice || item.price || 0,
          displayText: item.display_text || item.displayText || '',
          isCustom: item.is_custom || item.isCustom || false,
          description: item.description || '',
          metal: item.metal || '',
          setting: item.setting || '',
          shape: item.shape || '',
          carat: item.carat || '',
          band: item.band || '',
          accent: item.accent || '',
          variant_id: item.variant_id || item.id,
        }));
        
        // Replace local items with API items
        items.value = apiItems;
        totalPrice.value = subtotal.value;
        saveToLocalStorage();
        console.log('✅ Cart synced from API:', items.value.length, 'items');
      }
    } catch (err) {
      console.warn('⚠️ Failed to sync with API, using localStorage:', err.message);
      if (err.response?.status === 404) {
        useApi.value = false;
      }
    } finally {
      isSyncing.value = false;
    }
  }

  // ============================================
  // FETCH CART
  // ============================================
  async function fetchCart() {
    isLoading.value = true;
    error.value = null;

    try {
      console.log('📦 Fetching cart...');
      
      // Try to sync with API first
      if (useApi.value) {
        await syncWithApi();
      }
      
      // If API is disabled or failed, load from localStorage
      if (!useApi.value || items.value.length === 0) {
        console.log('📦 Loading cart from localStorage...');
        loadFromLocalStorage();
      }
      
      console.log('✅ Cart loaded:', items.value.length, 'items');
      return items.value;
      
    } catch (err) {
      console.error('❌ Failed to load cart:', err.message);
      error.value = 'Failed to load cart';
      // Fallback to localStorage
      loadFromLocalStorage();
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

    // Update local cart first (optimistic)
    updateLocalCart(itemId, 'add', product.quantity || 1, extraData);

    // Try API
    if (useApi.value) {
      try {
        const response = await cartAPI.addItem({
          product_id: itemId,
          quantity: product.quantity || 1,
          name: product.name,
          price: product.price,
          image: product.image,
          gold_weight: product.goldWeight || 0,
          silver_weight: product.silverWeight || 0,
          metal_type: product.metalType || 'none',
          display_text: product.displayText || '',
          is_custom: product.isCustom || false,
          description: product.description || '',
          metal: product.metal || '',
          setting: product.setting || '',
          shape: product.shape || '',
          carat: product.carat || '',
          band: product.band || '',
          accent: product.accent || '',
        });
        console.log('✅ Item added via API:', response.data);
        
        // Sync with API to get updated cart
        await syncWithApi();
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

  // Update local cart first
  updateLocalCart(productId, 'update', newQuantity);

  // Try API if enabled
  if (useApi.value) {
    // Try all possible formats
    const attempts = [
      { fn: cartAPI.updateItem, name: 'standard' },
      { fn: cartAPI.updateItemAlt1, name: 'alt1 (item-id)' },
      { fn: cartAPI.updateItemAlt2, name: 'alt2 (product_id)' },
      { fn: cartAPI.updateItemAlt3, name: 'alt3 (item_id array)' },
    ];

    for (const attempt of attempts) {
      try {
        await attempt.fn({
          product_id: productId,
          quantity: newQuantity,
        });
        console.log(`✅ Quantity updated via API (${attempt.name})`);
        await syncWithApi();
        return { success: true };
      } catch (err) {
        console.warn(`⚠️ ${attempt.name} failed:`, err.message);
        if (err.response?.status === 404) {
          // Only disable API if all attempts return 404
          continue;
        }
      }
    }
    
    // If all attempts failed with 404, disable API
    useApi.value = false;
  }

  return { success: true };
}

// ============================================
// REMOVE ITEM - Try all endpoints
// ============================================
async function removeItem(productId) {
  // Update local cart first
  updateLocalCart(productId, 'delete');

  // Try API if enabled
  if (useApi.value) {
    // Try all possible formats
    const attempts = [
      { fn: cartAPI.removeItem, name: 'standard' },
      { fn: cartAPI.removeItemAlt1, name: 'alt1 (item-id)' },
      { fn: cartAPI.removeItemAlt2, name: 'alt2 (product_id)' },
      { fn: cartAPI.removeItemAlt3, name: 'alt3 (item_id array)' },
    ];

    for (const attempt of attempts) {
      try {
        await attempt.fn({
          product_id: productId,
        });
        console.log(`✅ Item removed via API (${attempt.name})`);
        await syncWithApi();
        return { success: true };
      } catch (err) {
        console.warn(`⚠️ ${attempt.name} failed:`, err.message);
        if (err.response?.status === 404) {
          continue;
        }
      }
    }
    
    // If all attempts failed with 404, disable API
    useApi.value = false;
  }

  return { success: true };
}

  // ============================================
  // CLEAR CART
  // ============================================
  async function clearCart() {
    try {
      const itemIds = items.value.map((item) => item.id);
      
      // Clear local cart
      items.value = [];
      totalPrice.value = 0;
      saveToLocalStorage();

      // Try API
      if (useApi.value && itemIds.length > 0) {
        try {
          for (const id of itemIds) {
            await cartAPI.removeItem({ product_id: id });
          }
          console.log('✅ Cart cleared via API');
          await syncWithApi();
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

  // Load from localStorage on init
  loadFromLocalStorage();

  // ============================================
  // RETURN
  // ============================================
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
    isSyncing,

    // Getters
    itemCount,
    subtotal,
    tax,
    total,

    // Actions
    fetchCart,
    syncWithApi,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,

    // Helpers
    getProductLink,
    getItemDisplayPrice,

    // Auth
    setUser,
    addPendingAfterLogin,
    clearUserCartDisplay,
    getUserEmail,

    // Storage
    loadFromLocalStorage,
    saveToLocalStorage,
  };
});