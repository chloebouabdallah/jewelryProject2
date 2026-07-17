// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCartStore } from './cart'
import { 
  authAPI, 
  cleanEmail, 
  EMAIL_PREFIX,
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  refreshAccessToken
} from '@/services/osimart'

function cleanPrefix(str) {
  if (!str) return ''
  return str.replace(new RegExp(`^${EMAIL_PREFIX}`), '')
}

// User data cache key - this is NOT for tokens, just for display name/email
const USER_CACHE_KEY = 'soutou_user_cache'

export const useAuthStore = defineStore('auth', () => {
  // User Data: Memory + sessionStorage fallback
  const user = ref(null)
  const isAuthenticated = ref(false)
  const showAuthModal = ref(false)
  const authMode = ref('login')
  const isLoading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => isAuthenticated.value)
  const currentUser = computed(() => user.value)

  // ============================================
  // USER CACHE HELPERS (only for display data)
  // ============================================
  function cacheUserData(userData) {
    if (userData) {
      // Only cache non-sensitive data (name, email, etc.)
      const cacheData = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        session_id: userData.session_id || '',
      }
      try {
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData))
        console.log('💾 User data cached in sessionStorage')
      } catch (e) {
        console.warn('Failed to cache user data:', e)
      }
    }
  }

  function getCachedUserData() {
    try {
      const cached = sessionStorage.getItem(USER_CACHE_KEY)
      if (cached) {
        const data = JSON.parse(cached)
        console.log('📂 User data restored from cache:', data.email)
        return data
      }
    } catch (e) {
      console.warn('Failed to get cached user data:', e)
    }
    return null
  }

  function clearCachedUserData() {
    try {
      sessionStorage.removeItem(USER_CACHE_KEY)
      console.log('🗑️ User data cache cleared')
    } catch (e) {
      console.warn('Failed to clear user data cache:', e)
    }
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

      console.log('🔐 Logging in with email:', email)

      const response = await authAPI.login(loginData)
      console.log('✅ Login response:', response.data)

      let userData = null
      let accessTokenValue = null
      let refreshTokenValue = null
      let sessionIdValue = null

      if (response.data) {
        accessTokenValue = response.data.access_token || null
        refreshTokenValue = response.data.refresh_token || null
        sessionIdValue = response.data.session_id || null
        
        if (response.data.user) {
          userData = response.data.user
        } else {
          userData = {
            id: response.data.user_id,
            email: email,
            first_name: response.data.first_name || '',
            last_name: response.data.last_name || '',
            name: response.data.name || '',
            mobile_number: response.data.mobile_number || '',
            phone: response.data.phone || '',
          }
        }
      }

      console.log('🔑 Access token:', accessTokenValue ? 'Yes' : 'No')
      console.log('🔑 Refresh token:', refreshTokenValue ? 'Yes' : 'No')
      console.log('🔑 Session ID:', sessionIdValue ? 'Yes' : 'No')

      if (!userData) {
        console.warn('⚠️ No user data in response, creating fallback')
        userData = {
          id: response.data.user_id || 'user_' + Date.now(),
          email: email,
          name: email.split('@')[0]
        }
      }

      if (!accessTokenValue) {
        console.error('❌ No access token received from API!')
        throw new Error('No access token received from server. Please try again.')
      }

      // Store tokens: access in memory, refresh in secure cookie
      setTokens({
        access_token: accessTokenValue,
        refresh_token: refreshTokenValue,
        session_id: sessionIdValue
      })

      // ✅ ALSO SAVE TO LOCALSTORAGE FOR CART API
      localStorage.setItem('authToken', accessTokenValue)
      console.log('💾 Auth token saved to localStorage')

      const rawEmail = userData.email || email
      const displayEmail = cleanEmail(rawEmail)

      let displayName = userData.name || ''
      if (!displayName && userData.first_name && userData.last_name) {
        displayName = `${userData.first_name} ${userData.last_name}`
      } else if (!displayName) {
        displayName = displayEmail.split('@')[0]
      }

      // User data in memory
      user.value = {
        ...userData,
        id: userData.id || userData.user_id || response.data.user_id || 'user_' + Date.now(),
        email: displayEmail,
        rawEmail: rawEmail,
        name: displayName,
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        provider: userData.provider || 'email',
        phone: userData.mobile_number || userData.phone || '',
        session_id: sessionIdValue,
      }

      // Cache user data for recovery on refresh
      cacheUserData(user.value)

      isAuthenticated.value = true
      showAuthModal.value = false

      console.log('✅ Login successful!')
      console.log('👤 User:', user.value.name)
      console.log('📧 Email:', user.value.email)

      const cartStore = useCartStore()
      cartStore.setUser(user.value.email)

      return { success: true, user: user.value }

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
        }
      }

      error.value = errorMessage
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // LOGOUT - With full logging
  // ============================================
  async function logout() {
    try {
      console.log('🚪 Starting logout process...')
      
      // Log current token state before logout
      const refreshToken = getRefreshToken()
      const accessToken = getAccessToken()
      console.log('📤 Current tokens before logout:')
      console.log('  Access token:', accessToken ? 'Yes (length: ' + accessToken.length + ')' : 'No')
      console.log('  Refresh token:', refreshToken ? 'Yes (length: ' + refreshToken.length + ')' : 'No')
      
      // Call logout API
      console.log('📤 Sending logout request to server...')
      await authAPI.logout()
      console.log('✅ Logout successful on server')
      
    } catch (err) {
      console.warn('⚠️ Logout API call failed:', err.response?.status, err.message)
      if (err.response?.data) {
        console.warn('  Response data:', err.response.data)
      }
    } finally {
      // Clear all tokens and cache regardless of API result
      console.log('🗑️ Clearing local tokens and cache...')
      clearTokens()
      clearCachedUserData()
      
      // ✅ ALSO CLEAR LOCALSTORAGE
      localStorage.removeItem('authToken')
      console.log('🗑️ Auth token removed from localStorage')
      
      const cartStore = useCartStore()
      cartStore.clearUserCartDisplay()

      user.value = null
      isAuthenticated.value = false
      showAuthModal.value = false

      console.log('✅ Logout completed successfully')
      console.log('👤 User state:')
      console.log('  isAuthenticated:', isAuthenticated.value)
      console.log('  user:', user.value)
      console.log('  accessToken:', getAccessToken())
      console.log('  refreshToken:', getRefreshToken())
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
      const cleanEmailInput = cleanEmail(email)

      const signupData = {
        register_as: 'customer',
        store_id: STORE_ID,
        first_name: firstName,
        last_name: lastName,
        email: cleanEmailInput,
        password: password,
        mobile: mobileNumber
      }

      console.log('📝 Registering user:', cleanEmailInput)
      console.log('📤 Signup data:', signupData)

      const response = await authAPI.register(signupData)
      console.log('✅ Signup response:', response.data)

      const rawEmailFromAPI = response.data.email || cleanEmailInput
      const displayEmail = cleanEmail(rawEmailFromAPI)

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
        } else if (err.response.data.email) {
          errorMessage = err.response.data.email.join(', ')
        } else if (err.response.data.password) {
          errorMessage = err.response.data.password.join(', ')
        } else if (err.response.data.first_name) {
          errorMessage = err.response.data.first_name.join(', ')
        } else if (err.response.data.last_name) {
          errorMessage = err.response.data.last_name.join(', ')
        } else if (err.response.data.mobile) {
          errorMessage = err.response.data.mobile.join(', ')
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail
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

    cacheUserData(user.value)
    isAuthenticated.value = true
    
    if (userData.token || userData.accessToken) {
      setTokens({
        access_token: userData.token || userData.accessToken,
        refresh_token: userData.refresh_token || null,
        session_id: userData.session_id || null
      })
      
      // ✅ SAVE TO LOCALSTORAGE FOR CART API
      localStorage.setItem('authToken', userData.token || userData.accessToken)
      console.log('💾 Auth token saved to localStorage from social login')
    }

    showAuthModal.value = false
    console.log('🔐 Google login successful:', displayEmail)

    const cartStore = useCartStore()
    cartStore.setUser(displayEmail)
  }

  // ============================================
  // CHANGE PASSWORD
  // ============================================
  async function changePassword(oldPassword, newPassword) {
    isLoading.value = true
    error.value = null

    try {
      if (!isAuthenticated.value || !user.value) {
        throw new Error('You must be logged in to change your password')
      }

      const changeData = {
        old_password: oldPassword,
        new_password: newPassword
      }

      const response = await authAPI.changePassword(changeData)
      console.log('✅ Password changed successfully:', response.data)

      return { success: true, message: 'Password changed successfully!' }

    } catch (err) {
      console.error('❌ Failed to change password:', err)
      
      let errorMessage = 'Failed to change password. Please try again.'
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail
        } else if (err.response.data.old_password) {
          errorMessage = err.response.data.old_password.join(', ')
        } else if (err.response.data.new_password) {
          errorMessage = err.response.data.new_password.join(', ')
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors.join(', ')
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
  // CHECK AUTH
  // ============================================
  async function checkAuth() {
    console.log('🔍 Checking authentication...')
    
    // ✅ First check localStorage for token
    const localToken = localStorage.getItem('authToken')
    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()
    
    // ✅ If we have user data and access token in memory, we're authenticated
    if (user.value && isAuthenticated.value && (accessToken || localToken) && !isTokenExpired()) {
      console.log('✅ User already authenticated in memory:', user.value.email)
      return true
    }
    
    // ✅ If we have a token in localStorage but not in memory, restore it
    if (localToken && !accessToken) {
      console.log('🔄 Found token in localStorage, restoring...')
      // Set the token in memory
      setTokens({
        access_token: localToken,
        refresh_token: refreshToken || null
      })
      isAuthenticated.value = true
      
      // Restore user data from cache
      if (!user.value) {
        const cachedUser = getCachedUserData()
        if (cachedUser) {
          user.value = cachedUser
          console.log('✅ User data restored from cache:', user.value.email)
          const cartStore = useCartStore()
          cartStore.setUser(user.value.email)
          return true
        }
      }
      
      if (user.value) {
        console.log('✅ User data preserved:', user.value.email)
        const cartStore = useCartStore()
        cartStore.setUser(user.value.email)
        return true
      }
    }
    
    // ✅ If we have refresh token, use it to get a new access token
    if (refreshToken) {
      console.log('🔄 Refresh token found, refreshing access token...')
      try {
        await refreshAccessToken()
        console.log('✅ Access token refreshed successfully!')
        
        isAuthenticated.value = true
        
        if (!user.value) {
          const cachedUser = getCachedUserData()
          if (cachedUser) {
            user.value = cachedUser
            console.log('✅ User data restored from cache:', user.value.email)
            const cartStore = useCartStore()
            cartStore.setUser(user.value.email)
            return true
          }
        }
        
        if (user.value) {
          console.log('✅ User data preserved:', user.value.email)
          const cartStore = useCartStore()
          cartStore.setUser(user.value.email)
          return true
        }
        
        // Try to fetch profile
        try {
          console.log('👤 No user data, trying to fetch profile...')
          const response = await authAPI.getProfile()
          if (response.data) {
            console.log('✅ Profile fetched successfully')
            const userData = response.data.user || response.data
            const displayEmail = cleanEmail(userData.email || '')
            
            user.value = {
              ...userData,
              email: displayEmail,
              rawEmail: userData.email || '',
              name: userData.name || userData.first_name + ' ' + userData.last_name || displayEmail.split('@')[0],
              firstName: userData.first_name || '',
              lastName: userData.last_name || '',
              phone: userData.mobile_number || userData.phone || '',
            }
            
            cacheUserData(user.value)
            const cartStore = useCartStore()
            cartStore.setUser(user.value.email)
            return true
          }
        } catch (profileError) {
          console.warn('⚠️ Could not fetch profile, using cached data if available')
        }
        
        return true
      } catch (refreshError) {
        console.error('❌ Refresh failed:', refreshError.message)
        clearTokens()
        localStorage.removeItem('authToken')
        clearCachedUserData()
        user.value = null
        isAuthenticated.value = false
        return false
      }
    }
    
    // ✅ If we have access token but no refresh token, validate it
    if (accessToken || localToken) {
      console.log('⚠️ Access token exists but no refresh token')
      try {
        const response = await authAPI.getProfile()
        if (response.data) {
          console.log('✅ Access token is valid')
          const userData = response.data.user || response.data
          const displayEmail = cleanEmail(userData.email || '')
          
          user.value = {
            ...userData,
            email: displayEmail,
            rawEmail: userData.email || '',
            name: userData.name || userData.first_name + ' ' + userData.last_name || displayEmail.split('@')[0],
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            phone: userData.mobile_number || userData.phone || '',
          }
          
          cacheUserData(user.value)
          isAuthenticated.value = true
          
          // ✅ Save token to localStorage if not there
          if (accessToken && !localStorage.getItem('authToken')) {
            localStorage.setItem('authToken', accessToken)
          }
          
          const cartStore = useCartStore()
          cartStore.setUser(user.value.email)
          return true
        }
      } catch (err) {
        console.log('❌ Access token invalid')
        clearTokens()
        localStorage.removeItem('authToken')
        clearCachedUserData()
        user.value = null
        isAuthenticated.value = false
        return false
      }
    }
    
    console.log('👤 No valid auth found - guest mode')
    user.value = null
    isAuthenticated.value = false
    return false
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
    isLoading,
    error,
    isLoggedIn,
    currentUser,
    login,
    signup,
    socialLogin,
    logout,
    changePassword,
    checkAuth,
    openAuthModal,
    closeAuthModal
  }
})