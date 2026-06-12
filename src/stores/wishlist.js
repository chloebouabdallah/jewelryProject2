import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWishlistStore = defineStore('wishlist', () => {
  // State
  const items = ref([])
  
  // Getters
  const itemCount = computed(() => items.value.length)
  
  // Load wishlist from localStorage
  function loadWishlist() {
    const savedWishlist = localStorage.getItem('soutou_wishlist')
    if (savedWishlist) {
      items.value = JSON.parse(savedWishlist)
    }
  }
  
  // Save wishlist to localStorage
  function saveWishlist() {
    localStorage.setItem('soutou_wishlist', JSON.stringify(items.value))
  }
  
  // Add item to wishlist
  function addToWishlist(product) {
    const exists = items.value.some(item => item.id === product.id)
    if (!exists) {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        badge: product.badge
      })
      saveWishlist()
      return true
    }
    return false
  }
  
  // Remove item from wishlist
  function removeFromWishlist(productId) {
    items.value = items.value.filter(item => item.id !== productId)
    saveWishlist()
  }
  
  // Check if item is in wishlist
  function isInWishlist(productId) {
    return items.value.some(item => item.id === productId)
  }
  
  // Toggle wishlist item
  function toggleWishlist(product) {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      return false
    } else {
      addToWishlist(product)
      return true
    }
  }
  
  // Clear wishlist
  function clearWishlist() {
    items.value = []
    saveWishlist()
  }
  
  // Initialize
  loadWishlist()
  
  return {
    items,
    itemCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    loadWishlist,
    saveWishlist
  }
})