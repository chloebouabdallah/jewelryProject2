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
  const accessToken = ref(null)
  const refreshToken = ref(null)
  const sessionId = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isLoggedIn = computed(() => isAuthenticated.value)
  const currentUser = computed(() => user.value)
  const getToken = computed(() => accessToken.value)
  const getSessionId = computed(() => sessionId.value)

  // ============================================
  // LOCAL STORAGE HELPERS
  // ============================================
  function saveToLocalStorage() {
    const data = {
      user: user.value,
      isAuthenticated: isAuthenticated.value,
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
      session_id: sessionId.value
    }
    
    console.log('💾 Saving to localStorage:', {
      hasUser: !!data.user,
      isAuthenticated: data.isAuthenticated,
      hasAccessToken: !!data.access_token,
      hasRefreshToken: !!data.refresh_token,
      hasSessionId: !!data.session_id
    })
    
    localStorage.setItem('soutou_auth', JSON.stringify(data))
    
    // Save tokens separately for easy access
    if (refreshToken.value) {
      localStorage.setItem('soutou_refresh_token', refreshToken.value)
    }
    if (sessionId.value) {
      localStorage.setItem('soutou_session_id', sessionId.value)
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('soutou_auth')
      if (saved) {
        const data = JSON.parse(saved)
        console.log('📂 Loading from localStorage:', {
          hasUser: !!data.user,
          isAuthenticated: data.isAuthenticated,
          hasAccessToken: !!data.access_token,
          hasRefreshToken: !!data.refresh_token,
          hasSessionId: !!data.session_id
        })
        
        if (data.user) {
          data.user.email = cleanEmail(data.user.email || '')
          data.user.name = cleanPrefix(data.user.name || '')
        }
        user.value = data.user || null
        isAuthenticated.value = data.isAuthenticated || false
        accessToken.value = data.access_token || data.token || null
        refreshToken.value = data.refresh_token || null
        sessionId.value = data.session_id || null
        
        // If access token exists but isAuthenticated is false, set it to true
        if (accessToken.value && !isAuthenticated.value) {
          isAuthenticated.value = true
        }
        
        return true
      }
    } catch (e) {
      console.warn('Failed to load auth from localStorage:', e)
    }
    return false
  }

  function clearLocalStorage() {
    localStorage.removeItem('soutou_auth')
    localStorage.removeItem('soutou_refresh_token')
    localStorage.removeItem('soutou_session_id')
    console.log('🗑️ Cleared localStorage')
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
      console.log('✅ Login response status:', response.status)
      console.log('✅ Login response data:', JSON.stringify(response.data, null, 2))

      let userData = null
      let accessTokenValue = null
      let refreshTokenValue = null
      let sessionIdValue = null

      // Extract tokens, session_id, and user data from response
      if (response.data) {
        // Extract tokens
        accessTokenValue = response.data.access_token || response.data.access || response.data.token || null
        refreshTokenValue = response.data.refresh_token || response.data.refresh || null
        sessionIdValue = response.data.session_id || null
        
        // Check for user data in different locations
        if (response.data.user) {
          userData = response.data.user
        } else if (response.data.id || response.data.email) {
          userData = response.data
        }
        
        // If user data has session_id, use it
        if (userData && userData.session_id) {
          sessionIdValue = userData.session_id
        }
      }

      console.log('🔑 Extracted access token:', accessTokenValue ? 'Yes' : 'No')
      console.log('🔑 Extracted refresh token:', refreshTokenValue ? 'Yes' : 'No')
      console.log('🔑 Extracted session ID:', sessionIdValue ? 'Yes' : 'No')
      console.log('👤 Extracted user data:', userData ? 'Yes' : 'No')

      // If no userData, create a fallback
      if (!userData) {
        console.warn('⚠️ No user data in response, creating fallback')
        userData = {
          id: response.data.user_id || 'user_' + Date.now(),
          email: email,
          name: email.split('@')[0]
        }
      }

      // If no access token, this is a problem
      if (!accessTokenValue) {
        console.error('❌ No access token received from API!')
        console.error('📦 Full response:', JSON.stringify(response.data, null, 2))
        throw new Error('No access token received from server. Please try again.')
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

      // Set user data with session_id
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

      // Set tokens and session
      accessToken.value = accessTokenValue
      refreshToken.value = refreshTokenValue
      sessionId.value = sessionIdValue
      isAuthenticated.value = true

      // Save to localStorage
      saveToLocalStorage()
      
      showAuthModal.value = false

      console.log('✅ Login successful!')
      console.log('👤 User name:', user.value.name)
      console.log('📧 Display email:', user.value.email)
      console.log('🔑 Access token:', accessToken.value ? 'Yes' : 'No')
      console.log('🔑 Refresh token:', refreshToken.value ? 'Yes' : 'No')
      console.log('🔑 Session ID:', sessionId.value ? 'Yes' : 'No')

      const cartStore = useCartStore()
      cartStore.setUser(user.value.email)

      return { 
        success: true, 
        user: user.value, 
        accessToken: accessTokenValue, 
        refreshToken: refreshTokenValue,
        sessionId: sessionIdValue
      }

    } catch (err) {
      console.error('❌ Login failed:', err)
      console.error('❌ Error details:', err.response?.data || err.message)

      let errorMessage = 'Login failed. Please check your credentials.'

      if (err.response?.data) {
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
  // REFRESH TOKEN
  // ============================================
  async function refreshTokenFunction() {
    try {
      const refresh = refreshToken.value || localStorage.getItem('soutou_refresh_token')
      if (!refresh) {
        throw new Error('No refresh token available')
      }

      console.log('🔄 Refreshing access token...')
      const response = await authAPI.refreshToken({ refresh: refresh })
      
      const newAccessToken = response.data.access || response.data.access_token || response.data.token
      const newRefreshToken = response.data.refresh || response.data.refresh_token
      const newSessionId = response.data.session_id || sessionId.value
      
      if (newAccessToken) {
        accessToken.value = newAccessToken
        if (newRefreshToken) {
          refreshToken.value = newRefreshToken
        }
        if (newSessionId) {
          sessionId.value = newSessionId
        }
        saveToLocalStorage()
        console.log('✅ Access token refreshed successfully')
        return newAccessToken
      } else {
        throw new Error('No access token in refresh response')
      }
    } catch (err) {
      console.error('❌ Token refresh failed:', err)
      // If refresh fails, logout the user
      await logout()
      throw err
    }
  }

  // ============================================
  // LOGOUT - Uses session_id and refresh_token
  // ============================================
  async function logout() {
    try {
      // Get session data
      const session = sessionId.value || localStorage.getItem('soutou_session_id')
      const refresh = refreshToken.value || localStorage.getItem('soutou_refresh_token')
      
      console.log('🚪 Logging out with:')
      console.log('  Session ID:', session ? 'Yes' : 'No')
      console.log('  Refresh Token:', refresh ? 'Yes' : 'No')

      if (session || refresh) {
        try {
          // Build logout data
          const logoutData = {}
          if (session) {
            logoutData.session_id = session
          }
          if (refresh) {
            logoutData.refresh_token = refresh
            logoutData.refresh = refresh
          }
          
          console.log('📤 Logout data:', logoutData)
          
          await authAPI.logout(logoutData)
          console.log('✅ Logout successful on server')
        } catch (err) {
          // If logout fails, log the error but continue with local cleanup
          console.warn('Logout API call failed:', err.response?.status, err.message)
          if (err.response?.data) {
            console.warn('Response data:', err.response.data)
          }
        }
      } else {
        console.log('🚪 No session or refresh token found, skipping logout API call')
      }
    } catch (err) {
      console.warn('Logout error:', err.message)
    } finally {
      // ALWAYS clear local state
      const cartStore = useCartStore()
      cartStore.clearUserCartDisplay()

      user.value = null
      isAuthenticated.value = false
      accessToken.value = null
      refreshToken.value = null
      sessionId.value = null
      showAuthModal.value = false

      clearLocalStorage()

      console.log('🚪 Logged out successfully (local state cleared)')
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
        } else if (err.response.data.mobile) {
          errorMessage = err.response.data.mobile.join(', ')
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
      session_id: userData.session_id || null,
    }

    isAuthenticated.value = true
    accessToken.value = userData.token || userData.accessToken || 'social_token_' + Date.now()
    refreshToken.value = userData.refresh_token || null
    sessionId.value = userData.session_id || null

    saveToLocalStorage()
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
      // Check if user is authenticated
      if (!isAuthenticated.value || !user.value) {
        throw new Error('You must be logged in to change your password')
      }

      // Get token from store or localStorage
      let authToken = accessToken.value
      if (!authToken) {
        const authData = localStorage.getItem('soutou_auth')
        if (authData) {
          try {
            const parsed = JSON.parse(authData)
            authToken = parsed.access_token || parsed.token
          } catch (e) {}
        }
      }

      if (!authToken) {
        // Try to refresh the token
        try {
          await refreshTokenFunction()
          const authData = JSON.parse(localStorage.getItem('soutou_auth') || '{}')
          authToken = authData.access_token || authData.token
        } catch (e) {
          throw new Error('No authentication token found. Please log in again.')
        }
      }

      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.')
      }

      console.log('🔑 Token available for password change')

      // Validate passwords
      if (!oldPassword || oldPassword.length < 6) {
        throw new Error('Current password must be at least 6 characters.')
      }

      if (!newPassword || newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters.')
      }

      const changeData = {
        old_password: oldPassword,
        new_password: newPassword
      }

      console.log('🔑 Changing password for:', user.value?.email)

      const response = await authAPI.changePassword(changeData)
      console.log('✅ Password changed successfully:', response.data)

      return { success: true, message: 'Password changed successfully!' }

    } catch (err) {
      console.error('❌ Failed to change password:', err)
      console.error('❌ Error details:', err.response?.data || err.message)

      let errorMessage = 'Failed to change password. Please try again.'

      if (err.response?.data) {
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
        } else if (err.response.data.old_password) {
          errorMessage = err.response.data.old_password.join(', ')
        } else if (err.response.data.new_password) {
          errorMessage = err.response.data.new_password.join(', ')
        } else {
          errorMessage = JSON.stringify(err.response.data)
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
    
    const loaded = loadFromLocalStorage()

    if (loaded && isAuthenticated.value && user.value && accessToken.value) {
      console.log('✅ Auth found:', user.value.email)
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
    accessToken,
    refreshToken,
    sessionId,
    isLoading,
    error,
    isLoggedIn,
    currentUser,
    getToken,
    getSessionId,
    login,
    signup,
    socialLogin,
    changePassword,
    refreshTokenFunction,
    logout,
    checkAuth,
    openAuthModal,
    closeAuthModal,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage
  }
})