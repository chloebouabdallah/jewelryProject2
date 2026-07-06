// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCartStore } from './cart'
import { authAPI } from '@/services/osimart'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isAuthenticated = ref(false)
  const showAuthModal = ref(false)
  const authMode = ref('login')
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isLoggedIn = computed(() => isAuthenticated.value)
  const currentUser = computed(() => user.value)
  const getToken = computed(() => token.value)

  // ============================================
  // LOCAL STORAGE HELPERS
  // ============================================
  function saveToLocalStorage() {
    const data = {
      user: user.value,
      isAuthenticated: isAuthenticated.value,
      token: token.value
    }
    localStorage.setItem('soutou_auth', JSON.stringify(data))
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('soutou_auth')
      if (saved) {
        const data = JSON.parse(saved)
        user.value = data.user || null
        isAuthenticated.value = data.isAuthenticated || false
        token.value = data.token || null
        return true
      }
    } catch (e) {
      console.warn('Failed to load auth from localStorage:', e)
    }
    return false
  }

  function clearLocalStorage() {
    localStorage.removeItem('soutou_auth')
  }

  // ============================================
  // LOGIN - Customer only (no device params)
  // ============================================
  async function login(email, password) {
    isLoading.value = true
    error.value = null

    try {
      const loginData = {
        email: email,
        password: password,
        'login-as': 'customer'
      }

      console.log('🔐 Logging in as customer:', email)
      console.log('📤 Login data:', loginData)

      const response = await authAPI.login(loginData)
      console.log('✅ Login response:', response.data)

      let userData = null
      let authToken = null

      if (response.data) {
        if (response.data.user) {
          userData = response.data.user
          authToken = response.data.token || response.data.access_token || null
        } else if (response.data.data && response.data.data.user) {
          userData = response.data.data.user
          authToken = response.data.data.token || response.data.token || null
        } else if (response.data.id || response.data.email || response.data.pk) {
          userData = response.data
          authToken = response.data.token || response.data.access_token || null
        } else if (response.data.token || response.data.access_token) {
          authToken = response.data.token || response.data.access_token
          if (response.data.user_id || response.data.id) {
            userData = {
              id: response.data.user_id || response.data.id,
              email: response.data.email || email,
              name: response.data.name || email.split('@')[0]
            }
          }
        }
      }

      if (!userData) {
        console.warn('⚠️ No user data in response, creating fallback')
        userData = {
          id: 'user_' + Date.now(),
          email: email,
          name: email.split('@')[0]
        }
      }

      user.value = {
        id: userData.id || userData.user_id || userData.pk || 'user_' + Date.now(),
        email: userData.email || email,
        name: userData.name || userData.full_name || userData.display_name || email.split('@')[0],
        provider: userData.provider || 'email',
        ...userData
      }

      isAuthenticated.value = true
      token.value = authToken

      saveToLocalStorage()
      showAuthModal.value = false

      console.log('✅ Customer login successful:', user.value.email)

      const cartStore = useCartStore()
      cartStore.setUser(email)

      return { success: true, user: user.value, token: authToken }

    } catch (err) {
      console.error('❌ Login failed:', err)
      
      let errorMessage = 'Login failed. Please check your credentials.'
      
      if (err.response) {
        console.log('Response status:', err.response.status)
        console.log('Response data:', err.response.data)
        
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message
          } else if (err.response.data.error) {
            errorMessage = err.response.data.error
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail
          } else if (err.response.data.non_field_errors) {
            errorMessage = err.response.data.non_field_errors.join(', ')
          } else if (err.response.data.email) {
            errorMessage = err.response.data.email.join(', ')
          } else if (err.response.data.password) {
            errorMessage = err.response.data.password.join(', ')
          } else {
            errorMessage = JSON.stringify(err.response.data)
          }
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      error.value = errorMessage
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // SIGNUP - With all required fields
  // ============================================
  async function signup(name, email, password) {
    isLoading.value = true
    error.value = null

    try {
      const STORE_ID = '92ea209b-b32c-448e-85af-7296eb8eea00'
      
      const signupData = {
        name: name,
        email: email,
        password: password,
        register_as: 'customer',
        store: STORE_ID
      }

      console.log('📝 Registering user:', email)
      console.log('📤 Signup data:', signupData)

      const response = await authAPI.register(signupData)
      console.log('✅ Signup response:', response.data)

      let userData = null
      let authToken = null

      if (response.data) {
        if (response.data.user) {
          userData = response.data.user
          authToken = response.data.token || response.data.access_token || null
        } else if (response.data.data && response.data.data.user) {
          userData = response.data.data.user
          authToken = response.data.data.token || response.data.token || null
        } else if (response.data.id || response.data.email) {
          userData = response.data
          authToken = response.data.token || response.data.access_token || null
        }
      }

      if (!userData) {
        userData = {
          id: 'user_' + Date.now(),
          email: email,
          name: name
        }
      }

      user.value = {
        id: userData.id || userData.user_id || 'user_' + Date.now(),
        email: userData.email || email,
        name: userData.name || name,
        provider: 'email',
        ...userData
      }

      isAuthenticated.value = true
      token.value = authToken

      saveToLocalStorage()
      showAuthModal.value = false

      console.log('✅ Signup successful:', user.value.email)

      const cartStore = useCartStore()
      cartStore.setUser(email)

      return { success: true, user: user.value, token: authToken }

    } catch (err) {
      console.error('❌ Signup failed:', err)
      
      let errorMessage = 'Signup failed. Please try again.'
      
      if (err.response) {
        console.log('Response status:', err.response.status)
        console.log('Response data:', err.response.data)
        
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message
          } else if (err.response.data.error) {
            errorMessage = err.response.data.error
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail
          } else if (err.response.data.non_field_errors) {
            errorMessage = err.response.data.non_field_errors.join(', ')
          } else if (err.response.data.email) {
            errorMessage = err.response.data.email.join(', ')
          } else if (err.response.data.password) {
            errorMessage = err.response.data.password.join(', ')
          } else if (err.response.data.name) {
            errorMessage = err.response.data.name.join(', ')
          } else if (err.response.data.register_as) {
            errorMessage = err.response.data.register_as.join(', ')
          } else if (err.response.data.store) {
            errorMessage = err.response.data.store.join(', ')
          } else {
            errorMessage = JSON.stringify(err.response.data)
          }
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      error.value = errorMessage
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // SOCIAL LOGIN (Google/Facebook)
  // ============================================
  function socialLogin(userData) {
    user.value = {
      id: userData.id || userData.user_id || 'social_' + Date.now(),
      name: userData.name || userData.displayName || 'Social User',
      email: userData.email,
      provider: userData.provider || 'social',
      ...userData
    }

    isAuthenticated.value = true
    token.value = userData.token || userData.accessToken || 'social_token_' + Date.now()

    saveToLocalStorage()
    showAuthModal.value = false

    console.log('🔐 Social login successful:', userData.email)

    const cartStore = useCartStore()
    cartStore.setUser(userData.email)
  }

  // ============================================
  // LOGOUT
  // ============================================
  async function logout() {
    try {
      if (token.value) {
        await authAPI.logout()
      }
    } catch (err) {
      console.warn('Logout API call failed:', err)
    }

    const cartStore = useCartStore()
    cartStore.clearUserCartDisplay()

    user.value = null
    isAuthenticated.value = false
    token.value = null
    showAuthModal.value = false

    clearLocalStorage()

    console.log('🚪 Logged out successfully')
  }

  // ============================================
  // CHECK AUTH
  // ============================================
  function checkAuth() {
    const loaded = loadFromLocalStorage()
    
    if (loaded && isAuthenticated.value && user.value) {
      console.log('✅ Auth restored:', user.value.email)
      const cartStore = useCartStore()
      cartStore.setUser(user.value.email)
      return true
    } else {
      console.log('👤 No auth found, guest mode')
      return false
    }
  }

  // ============================================
  // MODAL CONTROLS
  // ============================================
  function openAuthModal(mode = 'login') {
    authMode.value = mode
    showAuthModal.value = true
    error.value = null
    console.log('🔓 Opening auth modal, mode:', mode)
  }

  function closeAuthModal() {
    showAuthModal.value = false
    error.value = null
    console.log('🔒 Closing auth modal')
  }

  return {
    // State
    user,
    isAuthenticated,
    showAuthModal,
    authMode,
    token,
    isLoading,
    error,

    // Getters
    isLoggedIn,
    currentUser,
    getToken,

    // Actions
    login,
    signup,
    socialLogin,
    logout,
    checkAuth,
    openAuthModal,
    closeAuthModal,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage
  }
})