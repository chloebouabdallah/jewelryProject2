import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCartStore } from './cart'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isAuthenticated = ref(false)
  const showAuthModal = ref(false)
  const authMode = ref('login')
  
  // Getters
  const isLoggedIn = computed(() => isAuthenticated.value)
  const currentUser = computed(() => user.value)
  
  // Actions
  async function login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password && email.includes('@')) {
          user.value = { email, name: email.split('@')[0], provider: 'email' }
          isAuthenticated.value = true
          showAuthModal.value = false
          
          console.log(`🔐 LOGIN SUCCESS: ${email}`)
          
          const cartStore = useCartStore()
          cartStore.setUser(email)
          
          resolve(true)
        } else {
          reject('Invalid email or password')
        }
      }, 500)
    })
  }
  
  async function signup(name, email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password && email.includes('@')) {
          user.value = { name, email, provider: 'email' }
          isAuthenticated.value = true
          showAuthModal.value = false
          
          console.log(`🔐 SIGNUP SUCCESS: ${email}`)
          
          const cartStore = useCartStore()
          cartStore.setUser(email)
          
          resolve(true)
        } else {
          reject('Please fill all fields with valid information')
        }
      }, 500)
    })
  }
  
  // Social Login (Google/Facebook)
  function socialLogin(userData) {
    user.value = {
      name: userData.name,
      email: userData.email,
      provider: userData.provider || 'social'
    }
    isAuthenticated.value = true
    showAuthModal.value = false
    
    console.log(`🔐 SOCIAL LOGIN SUCCESS: ${userData.email} via ${userData.provider}`)
    
    const cartStore = useCartStore()
    cartStore.setUser(userData.email)
    saveToLocalStorage()
  }
  
  function logout() {
    const cartStore = useCartStore()
    const userEmail = cartStore.getUserEmail()
    
    console.log(`🚪 LOGOUT: ${userEmail}`)
    
    cartStore.clearUserCartDisplay()
    
    user.value = null
    isAuthenticated.value = false
    showAuthModal.value = false
    localStorage.removeItem('auth_user')
  }
  
  function openAuthModal(mode = 'login') {
    authMode.value = mode
    showAuthModal.value = true
  }
  
  function closeAuthModal() {
    showAuthModal.value = false
  }
  
  function checkAuth() {
    const savedUser = localStorage.getItem('auth_user')
    console.log(`🔍 CHECK AUTH: savedUser = ${savedUser}`)
    if (savedUser) {
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
      
      console.log(`✅ AUTH RESTORED: ${user.value.email}`)
      
      const cartStore = useCartStore()
      cartStore.setUser(user.value.email)
    } else {
      console.log(`👤 NO AUTH, guest mode`)
      const cartStore = useCartStore()
      cartStore.setUser(null)
    }
  }
  
  function saveToLocalStorage() {
    if (user.value) {
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }
  
  return {
    user,
    isAuthenticated,
    showAuthModal,
    authMode,
    isLoggedIn,
    currentUser,
    login,
    signup,
    socialLogin,
    logout,
    openAuthModal,
    closeAuthModal,
    checkAuth,
    saveToLocalStorage
  }
})