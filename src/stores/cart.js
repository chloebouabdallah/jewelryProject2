import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([])
  const lastAddedMessage = ref('')
  
  // Getters
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })
  
  const tax = computed(() => subtotal.value * 0.08)
  
  const total = computed(() => subtotal.value + tax.value)
  
  // Actions
  function addToCart(product) {
    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += product.quantity || 1
    } else {
      items.value.push({
        ...product,
        quantity: product.quantity || 1
      })
    }
    
    lastAddedMessage.value = `${product.name} added to cart!`
    saveToLocalStorage()
    
    // Clear message after 2 seconds
    setTimeout(() => {
      lastAddedMessage.value = ''
    }, 2000)
    
    return lastAddedMessage.value
  }
  
  function updateQuantity(productId, delta) {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.quantity += delta
      if (item.quantity <= 0) {
        removeItem(productId)
      }
    }
    saveToLocalStorage()
  }
  
  function removeItem(productId) {
    items.value = items.value.filter(item => item.id !== productId)
    saveToLocalStorage()
  }
  
  function clearCart() {
    items.value = []
    saveToLocalStorage()
  }
  
  function saveToLocalStorage() {
    localStorage.setItem('soutouCart', JSON.stringify(items.value))
  }
  
  function loadFromLocalStorage() {
    const savedCart = localStorage.getItem('soutouCart')
    if (savedCart) {
      items.value = JSON.parse(savedCart)
    }
  }
  
  // Initialize
  loadFromLocalStorage()
  
  return {
    items,
    itemCount,
    subtotal,
    tax,
    total,
    lastAddedMessage,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  }
})