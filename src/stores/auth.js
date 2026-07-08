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
  // HELPER: Save/Get user display name
  // ============================================
  function saveUserDisplayName(name) {
    localStorage.setItem('soutou_user_display_name', name)
  }

  function getUserDisplayName() {
    return localStorage.getItem('soutou_user_display_name') || ''
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

      // ✅ The API returns email with prefix
      const rawEmail = userData.email || email
      const displayEmail = rawEmail.replace(/^mystore1__/, '')

      // ✅ Get display name - priority order:
      // 1. From stored name (set during signup)
      // 2. From API response (first_name + last_name or name)
      // 3. Fallback to clean email username
      let displayName = getUserDisplayName()

      if (!displayName) {
        if (userData.first_name && userData.last_name) {
          displayName = `${userData.first_name} ${userData.last_name}`
        } else if (userData.name) {
          displayName = userData.name
        } else {
          displayName = displayEmail.split('@')[0]
        }
        // Save the name for future logins
        saveUserDisplayName(displayName)
      }

      user.value = {
        id: userData.id || userData.user_id || 'user_' + Date.now(),
        email: displayEmail,
        rawEmail: rawEmail,
        name: displayName, // ✅ User's actual name
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        provider: userData.provider || 'email',
        ...userData
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
  // SIGNUP
  // ============================================
  async function signup(firstName, lastName, email, password, mobileNumber) {
    isLoading.value = true
    error.value = null

    try {
      const STORE_ID = '92ea209b-b32c-448e-85af-7296eb8eea00'

      const cleanEmailInput = email.replace(/^mystore1__/, '')

      const signupData = {
        register_as: 'customer',
        store_id: STORE_ID,
        first_name: firstName,
        last_name: lastName,
        email: cleanEmailInput,
        password: password,
        mobile_number: mobileNumber
      }

      console.log('📝 Registering user:', cleanEmailInput)

      const response = await authAPI.register(signupData)
      console.log('✅ Signup response:', response.data)

      const rawEmailFromAPI = response.data.email || cleanEmailInput
      const displayEmail = rawEmailFromAPI.replace(/^mystore1__/, '')

      // ✅ Save the user's full name for future logins
      const fullName = `${firstName} ${lastName}`
      saveUserDisplayName(fullName)

      console.log('📧 Raw email from API (for login):', rawEmailFromAPI)
      console.log('📧 Display email (UI):', displayEmail)
      console.log('👤 Saved display name:', fullName)

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
          lastName: lastName
        }
      }

    } catch (err) {
      console.error('❌ Signup failed:', err)

      let errorMessage = 'Signup failed. Please try again.'

      if (err.response?.data) {
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
    // Save the name for future logins
    saveUserDisplayName(displayName)

    const rawEmail = userData.email || ''
    const displayEmail = rawEmail.replace(/^mystore1__/, '')

    user.value = {
      id: userData.id || userData.user_id || 'social_' + Date.now(),
      name: displayName,
      email: displayEmail,
      rawEmail: rawEmail,
      picture: userData.picture || '',
      provider: userData.provider || 'google',
      deviceName: userData.deviceName || 'Desktop',
      deviceId: userData.deviceId || 'unknown',
      ...userData
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