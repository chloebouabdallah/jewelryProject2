// src/stores/wishlist.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wishlistService } from '../services/wishlistService'
import { productService } from '../services/productService'

export const useWishlistStore = defineStore('wishlist', () => {
  // State
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const currentUserEmail = ref(null)

  // Getters
  const itemCount = computed(() => items.value.length)

  // ============================================
  // LOCAL STORAGE HELPERS
  // ============================================
  function getStorageKey() {
    const userEmail = currentUserEmail.value || localStorage.getItem('soutou_user_email') || 'guest'
    return `soutouWishlist_${userEmail}`
  }

  function saveToLocalStorage() {
    try {
      const key = getStorageKey()
      localStorage.setItem(key, JSON.stringify(items.value))
      console.log('💾 Wishlist saved to localStorage:', key)
    } catch (e) {
      console.warn('Failed to save wishlist:', e)
    }
  }

  function loadFromLocalStorage() {
    try {
      const key = getStorageKey()
      const saved = localStorage.getItem(key)
      if (saved) {
        items.value = JSON.parse(saved)
        console.log('📦 Wishlist loaded from localStorage:', items.value.length, 'items')
        return true
      }
    } catch (e) {
      console.warn('Failed to load wishlist:', e)
    }
    return false
  }

  // ============================================
  // FETCH PRODUCTS BY IDS
  // ============================================
  async function fetchProductsByIds(ids) {
    try {
      const products = []
      for (const id of ids) {
        try {
          const product = await productService.getProduct(id)
          if (product) {
            products.push(product)
          }
        } catch (e) {
          console.warn('Failed to fetch product:', id, e)
        }
      }
      return products
    } catch (error) {
      console.error('Failed to fetch products by IDs:', error)
      return []
    }
  }

  // ============================================
  // LOAD WISHLIST
  // ============================================
  async function fetchWishlist() {
    isLoading.value = true
    error.value = null

    try {
      console.log('📦 Fetching wishlist...')
      const data = await wishlistService.getWishlist()
      
      // If data is array of product IDs
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
        const fullProducts = await fetchProductsByIds(data)
        items.value = fullProducts.map(p => ({
          ...productService.transformProduct(p),
          wishlisted: true
        }))
      } else if (Array.isArray(data)) {
        // It's already an array of product objects
        items.value = data.map(item => ({
          ...productService.transformProduct(item.product || item),
          wishlisted: true
        }))
      } else {
        items.value = []
      }
      
      saveToLocalStorage()
      console.log('✅ Wishlist loaded:', items.value.length, 'items')
      return items.value
      
    } catch (err) {
      console.error('❌ Failed to load wishlist:', err)
      error.value = 'Failed to load wishlist'
      loadFromLocalStorage()
      return items.value
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // ADD TO WISHLIST
  // ============================================
  async function addToWishlist(product) {
    console.log('❤️ Adding to wishlist:', product.name)
    
    const exists = items.value.some(item => item.id === product.id)
    if (exists) {
      console.log('⚠️ Product already in wishlist')
      return false
    }

    try {
      await wishlistService.updateWishlist(product.id, 'add')
      
      // Add to local items
      const fullProduct = productService.transformProduct(product)
      items.value.push({
        ...fullProduct,
        wishlisted: true
      })
      saveToLocalStorage()
      
      console.log('✅ Added to wishlist:', product.name)
      return true
    } catch (error) {
      console.error('❌ Failed to add to wishlist:', error)
      // Fallback - add locally anyway
      const fullProduct = productService.transformProduct(product)
      items.value.push({
        ...fullProduct,
        wishlisted: true
      })
      saveToLocalStorage()
      return true
    }
  }

  // ============================================
  // REMOVE FROM WISHLIST
  // ============================================
  async function removeFromWishlist(productId) {
    console.log('🗑️ Removing from wishlist:', productId)

    try {
      await wishlistService.updateWishlist(productId, 'remove')
      
      items.value = items.value.filter(item => item.id !== productId)
      saveToLocalStorage()
      console.log('✅ Removed from wishlist')
      return true
    } catch (error) {
      console.error('❌ Failed to remove from wishlist:', error)
      // Fallback - remove locally anyway
      items.value = items.value.filter(item => item.id !== productId)
      saveToLocalStorage()
      return true
    }
  }

  // ============================================
  // CHECK IF IN WISHLIST
  // ============================================
  function isInWishlist(productId) {
    return items.value.some(item => item.id === productId)
  }

  // ============================================
  // TOGGLE WISHLIST
  // ============================================
  async function toggleWishlist(product) {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id)
      return false
    } else {
      await addToWishlist(product)
      return true
    }
  }

  // ============================================
  // CLEAR WISHLIST
  // ============================================
  async function clearWishlist() {
    items.value = []
    saveToLocalStorage()
    console.log('✅ Wishlist cleared')
    return { success: true }
  }

  // ============================================
  // SET USER
  // ============================================
  function setUser(email) {
    console.log(`👤 SET WISHLIST USER: ${email || 'guest'}`)
    currentUserEmail.value = email
    if (email) {
      localStorage.setItem('soutou_user_email', email)
    } else {
      localStorage.removeItem('soutou_user_email')
      items.value = []
    }
    loadFromLocalStorage()
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  loadFromLocalStorage()

  return {
    // State
    items,
    isLoading,
    error,
    currentUserEmail,
    
    // Getters
    itemCount,
    
    // Actions
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    setUser,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
})