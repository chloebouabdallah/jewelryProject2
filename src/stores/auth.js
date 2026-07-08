// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCartStore } from './cart'
import { authAPI, cleanEmail, EMAIL_PREFIX } from '@/services/osimart'

// Helper to clean the prefix from any string (not just emails)
function cleanPrefix(str) {
  if (!str) return ''
  return str.replace(new RegExp(`^${EMAIL_PREFIX}`), '')
}

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
        if (data.user) {
          data.user.email = cleanEmail(data.user.email || '')
          data.user.name = cleanPrefix(data.user.name || '')
        }
        user.value = data.user || null
        isAuthenticated.value = data.isAuthenticated || false
        token.value = data.token || null
        saveToLocalStorage()
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
  // HELPER: Save/Get user display name
  // ============================================
  function saveUserDisplayName(name) {
    localStorage.setItem('soutou_user_display_name', cleanPrefix(name))
  }

  function getUserDisplayName() {
    return cleanPrefix(localStorage.getItem('soutou_user_display_name') || '')
  }

  // ============================================
  // LOGIN
  // ============================================
  async function login(email, password, deviceName, deviceId) {
    isLoading.value = true
    error.value = null

    try {
      const loginData = {
        email: email,
        password: password,
        'login-as': 'customer',
        'device-name': deviceName,
        'device-id': deviceId
      }

      console.log('🔐 Logging in with email (API):', email)

      const response = await authAPI.login(loginData)
      console.log('✅ Login response:', response.data)

      let userData = null
      let authToken = null

      if (response.data) {
        if (response.data.user) {
          userData = response.data.user
          authToken = response.data.token || response.data.access_token || null
        } else if (response.data.id || response.data.email) {
          userData = response.data
          authToken = response.data.token || response.data.access_token || null
        }
      }

      if (!userData) {
        userData = {
          id: 'user_' + Date.now(),
          email: email,
          name: email.split('@')[0]
        }
      }

      const rawEmail = userData.email || email
      const displayEmail = cleanEmail(rawEmail)

      let displayName = getUserDisplayName()
      if (!displayName) {
        if (userData.first_name && userData.last_name) {
          displayName = `${userData.first_name} ${userData.last_name}`
        } else if (userData.name) {
          displayName = userData.name
        } else {
          displayName = displayEmail.split('@')[0]
        }
        saveUserDisplayName(displayName)
      }

      user.value = {
        ...userData,
        id: userData.id || userData.user_id || 'user_' + Date.now(),
        email: displayEmail,
        rawEmail: rawEmail,
        name: displayName,
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        provider: userData.provider || 'email',
        // Store phone if available from user data
        phone: userData.mobile_number || userData.phone || '',
      }

      isAuthenticated.value = true
      token.value = authToken

      saveToLocalStorage()
      showAuthModal.value = false

      console.log('✅ Login successful!')
      console.log('👤 User name:', user.value.name)
      console.log('📧 Display email:', user.value.email)

      const cartStore = useCartStore()
      cartStore.setUser(user.value.email)

      return { success: true, user: user.value, token: authToken }

    } catch (err) {
      console.error('❌ Login failed:', err)

      let errorMessage = 'Login failed. Please check your credentials.'

      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors.join(', ')
        } else {
          errorMessage = JSON.stringify(err.response.data)
        }
      }

      error.value = errorMessage
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // SIGNUP - FIXED: log phone number and response
  // ============================================
  async function signup(firstName, lastName, email, password, mobileNumber) {
    isLoading.value = true
    error.value = null

    try {
      const STORE_ID = '92ea209b-b32c-448e-85af-7296eb8eea00'

      // Ensure phone number is in correct format (with country code)
      // If user didn't include '+', we could prepend a default, but we'll let them enter it.
      const cleanPhone = mobileNumber.trim()

      const signupData = {
        register_as: 'customer',
        store_id: STORE_ID,
        first_name: firstName,
        last_name: lastName,
        email: cleanEmail(email),
        password: password,
        mobile_number: cleanPhone  // API expects 'mobile_number'
      }

      console.log('📝 Registering user:', cleanEmail(email))
      console.log('📤 Signup data:', signupData)

      const response = await authAPI.register(signupData)
      console.log('✅ Signup response:', response.data)

      // Log whether phone number is present in response
      if (response.data.mobile_number) {
        console.log('📱 Phone number saved in API response:', response.data.mobile_number)
      } else {
        console.warn('⚠️ Phone number not returned in API response. It may not have been saved.')
      }

      const rawEmailFromAPI = response.data.email || cleanEmail(email)
      const displayEmail = cleanEmail(rawEmailFromAPI)

      const fullName = `${firstName} ${lastName}`
      saveUserDisplayName(fullName)

      isLoading.value = false
      showAuthModal.value = false

      return {
        success: true,
        requiresVerification: true,
        verificationData: {
          email: displayEmail,
          rawEmail: rawEmailFromAPI,
          storeId: STORE_ID,
          firstName: firstName,
          lastName: lastName,
          phone: cleanPhone // pass back for potential use
        }
      }

    } catch (err) {
      console.error('❌ Signup failed:', err)

      let errorMessage = 'Signup failed. Please try again.'

      if (err.response?.data) {
        console.error('API error response:', err.response.data)
        if (err.response.data.message) {
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
        } else if (err.response.data.first_name) {
          errorMessage = err.response.data.first_name.join(', ')
        } else if (err.response.data.last_name) {
          errorMessage = err.response.data.last_name.join(', ')
        } else if (err.response.data.mobile_number) {
          errorMessage = err.response.data.mobile_number.join(', ')
        } else {
          errorMessage = JSON.stringify(err.response.data)
        }
      }

      error.value = errorMessage
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // SOCIAL LOGIN (Google)
  // ============================================
  function socialLogin(userData) {
    const displayName = userData.name || userData.displayName || 'Social User'
    saveUserDisplayName(displayName)

    const rawEmail = userData.email || ''
    const displayEmail = cleanEmail(rawEmail)

    user.value = {
      ...userData,
      id: userData.id || userData.user_id || 'social_' + Date.now(),
      name: displayName,
      email: displayEmail,
      rawEmail,
      picture: userData.picture || '',
      provider: userData.provider || 'google',
      deviceName: userData.deviceName || 'Desktop',
      deviceId: userData.deviceId || 'unknown',
      phone: userData.phone || '',
    }

    isAuthenticated.value = true
    token.value = userData.token || userData.accessToken || 'social_token_' + Date.now()

    saveToLocalStorage()
    showAuthModal.value = false

    console.log('🔐 Google login successful:', displayEmail)

    const cartStore = useCartStore()
    cartStore.setUser(displayEmail)
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
  // CHECK AUTH - validates stored token with API
  // ============================================
  async function checkAuth() {
    const loaded = loadFromLocalStorage()

    if (loaded && isAuthenticated.value && user.value && token.value) {
      try {
        const response = await authAPI.getProfile()
        if (response.data) {
          console.log('✅ Auth token validated:', user.value.email)
          // Optionally update user data with fresh info
          if (response.data.mobile_number) {
            user.value.phone = response.data.mobile_number
          }
          const cartStore = useCartStore()
          cartStore.setUser(user.value.email)
          return true
        }
      } catch (err) {
        console.warn('⚠️ Auth token invalid or expired, logging out:', err.message)
        user.value = null
        isAuthenticated.value = false
        token.value = null
        clearLocalStorage()
        console.log('👤 Session expired, guest mode')
        return false
      }
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
    user,
    isAuthenticated,
    showAuthModal,
    authMode,
    token,
    isLoading,
    error,
    isLoggedIn,
    currentUser,
    getToken,
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