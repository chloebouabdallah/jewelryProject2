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
  const useApi = ref(true);
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
    console.log('  - id:', product.id);
    console.log('  - variant_id:', product.variant_id);
    console.log('  - product_id:', product.product_id);
    
    if (product.variant_id) {
      console.log('✅ Using variant ID:', product.variant_id);
      return product.variant_id;
    }
    
    if (product.product_id) {
      console.log('✅ Using product ID:', product.product_id);
      return product.product_id;
    }
    
    if (product.id) {
      console.log('✅ Using item ID:', product.id);
      return product.id;
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
    if (!useApi.value || isSyncing.value) return false;
    
    isSyncing.value = true;
    console.log('🔄 Syncing cart with API...');
    
    try {
      const apiCart = await cartAPI.viewCart();
      console.log('✅ API cart response:', apiCart);
      
      if (apiCart && apiCart.cart) {
        const apiItems = Object.values(apiCart.cart).map(item => ({
          id: item.id,
          product_id: item.product_id || '',
          product_slug: item.slug || '',
          quantity: Number(item.quantity) || 1,
          name: item.name || 'Product',
          price: Number(item.price) || 0,
          image: item.image ? mediaAPI.getImageUrl(item.image) : '/placeholder.jpg',
          goldWeight: item.gold_weight || item.goldWeight || 0,
          silverWeight: item.silver_weight || item.silverWeight || 0,
          metalType: item.metal_type || item.metalType || 'none',
          originalPrice: item.original_price || item.originalPrice || item.price || 0,
          displayText: item.display_text || item.displayText || item.values?.join(' · ') || '',
          isCustom: item.is_custom || item.isCustom || false,
          description: item.description || '',
          metal: item.metal || '',
          setting: item.setting || '',
          shape: item.shape || '',
          carat: item.carat || '',
          band: item.band || '',
          accent: item.accent || '',
          variant_id: item.id,
          stock: Number(item.remaining_stock) || 0,
        }));
        
        items.value = apiItems;
        totalPrice.value = subtotal.value;
        saveToLocalStorage();
        console.log('✅ Cart synced from API:', items.value.length, 'items');
        return true;
      }
      
      if (apiCart && apiCart.cart === null) {
        items.value = [];
        totalPrice.value = 0;
        saveToLocalStorage();
        console.log('✅ API cart is empty, cleared local cart');
        return true;
      }
      
      throw new Error('Unexpected cart response from Osimart');
    } catch (err) {
      console.error('❌ Failed to sync cart with Osimart:', err.response?.data || err.message);
      return false;
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
      
      const apiSucceeded = useApi.value && await syncWithApi();

      if (!apiSucceeded) {
        console.log('📦 Loading cart from localStorage...');
        loadFromLocalStorage();
      }
      
      console.log('✅ Cart loaded:', items.value.length, 'items');
      return items.value;
      
    } catch (err) {
      console.error('❌ Failed to load cart:', err.message);
      error.value = 'Failed to load cart';
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

    if (useApi.value) {
      try {
        const quantity = product.quantity || 1;
        console.log(`📤 Sending to API: addItem ${itemId}, quantity: ${quantity}`);
        
        const response = await cartAPI.addItem(itemId, quantity);
        console.log('✅ API Response:', response);
        
        await syncWithApi();
        console.log('✅ Cart synced after API add');
        
        lastAddedMessage.value = `${product.name} added to cart!`;
        setTimeout(() => {
          lastAddedMessage.value = '';
        }, 2000);
        
        return { success: true, message: 'Item added to cart' };
      } catch (err) {
        console.error('❌ Osimart add failed:', err.response?.data || err.message);
        error.value = 'Failed to add item to cart';
        
        console.log('🔄 Falling back to local cart update...');
        updateLocalCart(itemId, 'add', product.quantity || 1, extraData);
        
        lastAddedMessage.value = `${product.name} added to cart (local only)`;
        setTimeout(() => {
          lastAddedMessage.value = '';
        }, 2000);
        
        return { success: true, message: 'Item added to cart (local only)' };
      }
    }

    updateLocalCart(itemId, 'add', product.quantity || 1, extraData);
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

    if (useApi.value) {
      try {
        const quantity = Math.abs(delta);
        if (delta > 0) {
          await cartAPI.addItem(item.variant_id || productId, quantity);
        } else {
          await cartAPI.removeItem(item.variant_id || productId);
        }
        await syncWithApi();
        return { success: true };
      } catch (err) {
        console.error('❌ Osimart quantity update failed:', err.response?.data || err.message);
        error.value = 'Failed to update cart quantity';
        updateLocalCart(productId, 'update', newQuantity);
        return { success: true, message: 'Quantity updated locally' };
      }
    }

    updateLocalCart(productId, 'update', newQuantity);
    return { success: true };
  }

  // ============================================
  // REMOVE ITEM
  // ============================================
  async function removeItem(productId) {
    const item = items.value.find((i) => i.id === productId);
    if (!item) return { success: false, message: 'Item not found' };

    if (useApi.value) {
      try {
        await cartAPI.removeItem(item.variant_id || productId);
        await syncWithApi();
        return { success: true };
      } catch (err) {
        console.error('❌ Osimart remove failed:', err.response?.data || err.message);
        error.value = 'Failed to remove item from cart';
        updateLocalCart(productId, 'delete');
        return { success: true, message: 'Item removed locally' };
      }
    }

    updateLocalCart(productId, 'delete');
    return { success: true };
  }

  // ============================================
  // CLEAR CART
  // ============================================
  async function clearCart() {
    try {
      if (useApi.value && items.value.length > 0) {
        try {
          await cartAPI.clearCart();
          console.log('✅ Cart cleared via API');
          await syncWithApi();
        } catch (err) {
          console.warn('⚠️ Failed to clear cart via API:', err.message);
          for (const item of items.value) {
            try {
              await cartAPI.removeItem(item.variant_id || item.id);
            } catch (removeErr) {
              console.warn('⚠️ Failed to remove item:', item.name, removeErr.message);
            }
          }
        }
      }

      items.value = [];
      totalPrice.value = 0;
      saveToLocalStorage();

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
      const guestCart = loadGuestCart();
      fetchCart().then(() => {
        if (guestCart.length > 0) {
          migrateGuestCartItems(guestCart);
        }
      });
    } else {
      items.value = [];
      totalPrice.value = 0;
      saveToLocalStorage();
    }
  }

  function loadGuestCart() {
    try {
      const saved = localStorage.getItem('soutouCart_guest');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  async function migrateGuestCartItems(guestItems) {
    for (const guestItem of guestItems) {
      try {
        const itemId = guestItem.variant_id || guestItem.id;
        if (itemId) {
          await cartAPI.addItem(itemId, guestItem.quantity || 1);
        }
      } catch (err) {
        console.warn('⚠️ Failed to migrate guest item:', guestItem.name, err.message);
      }
    }
    localStorage.removeItem('soutouCart_guest');
    console.log('✅ Guest cart migrated:', guestItems.length, 'items');
    await syncWithApi();
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
    isSyncing,

    itemCount,
    subtotal,
    tax,
    total,

    fetchCart,
    syncWithApi,
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