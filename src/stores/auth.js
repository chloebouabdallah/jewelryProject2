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
  getAccessToken
} from '@/services/osimart'
import { getCookie } from '@/utils/cookieHelper';

function cleanPrefix(str) {
  if (!str) return ''
  return str.replace(new RegExp(`^${EMAIL_PREFIX}`), '')
}

export const useAuthStore = defineStore('auth', () => {
  // State - User data only
  const user = ref(null)
  const isAuthenticated = ref(false)
  const showAuthModal = ref(false)
  const authMode = ref('login')
  const isLoading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => isAuthenticated.value)
  const currentUser = computed(() => user.value)

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

      // ✅ Extract tokens and user data from response
      if (response.data) {
        // Tokens are at the root level
        accessTokenValue = response.data.access_token || null
        refreshTokenValue = response.data.refresh_token || null
        sessionIdValue = response.data.session_id || null
        
        // User data - check if there's a user object or use root data
        if (response.data.user) {
          userData = response.data.user
        } else {
          // If no user object, create one from the response data
          userData = {
            id: response.data.user_id,
            email: email, // We'll use the email we logged in with
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
      console.log('👤 User data:', userData ? 'Yes' : 'No')

      // If no userData, create a fallback
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
        console.error('📦 Full response:', JSON.stringify(response.data, null, 2))
        throw new Error('No access token received from server. Please try again.')
      }

      // ✅ Store tokens: access in memory, refresh in secure cookie
      setTokens({
        access_token: accessTokenValue,
        refresh_token: refreshTokenValue,
        session_id: sessionIdValue
      })

      const rawEmail = userData.email || email
      const displayEmail = cleanEmail(rawEmail)

      // Build user display name
      let displayName = userData.name || ''
      if (!displayName && userData.first_name && userData.last_name) {
        displayName = `${userData.first_name} ${userData.last_name}`
      } else if (!displayName) {
        displayName = displayEmail.split('@')[0]
      }

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
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data
        }
      }

      error.value = errorMessage
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // LOGOUT
  // ============================================
  async function logout() {
    try {
      console.log('🚪 Logging out...')
      await authAPI.logout()
      console.log('✅ Logout successful on server')
    } catch (err) {
      console.warn('Logout API call failed:', err.message)
    } finally {
      // Clear all tokens
      clearTokens()
      
      const cartStore = useCartStore()
      cartStore.clearUserCartDisplay()

      user.value = null
      isAuthenticated.value = false
      showAuthModal.value = false

      console.log('🚪 Logged out successfully')
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

    isAuthenticated.value = true
    
    if (userData.token || userData.accessToken) {
      setTokens({
        access_token: userData.token || userData.accessToken,
        refresh_token: userData.refresh_token || null,
        session_id: userData.session_id || null
      })
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
    
    // Check if we have access token in memory
    const accessToken = getAccessToken();
    const refreshToken = getCookie('refresh_token');
    
    if (accessToken) {
      console.log('✅ Access token found in memory')
      try {
        const response = await authAPI.getProfile()
        if (response.data) {
          console.log('✅ User is authenticated')
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
          
          isAuthenticated.value = true
          const cartStore = useCartStore()
          cartStore.setUser(user.value.email)
          return true
        }
      } catch (err) {
        console.log('⚠️ Token validation failed:', err.message)
        // If we have refresh token, try to refresh
        if (refreshToken) {
          console.log('🔄 Attempting to refresh with refresh token from cookie')
          try {
            // The interceptor will handle the refresh
            const response = await authAPI.getProfile()
            if (response.data) {
              console.log('✅ Token refreshed and user authenticated')
              return true
            }
          } catch (refreshErr) {
            console.log('❌ Refresh failed, clearing all tokens')
            clearTokens()
            user.value = null
            isAuthenticated.value = false
            return false
          }
        } else {
          clearTokens()
          user.value = null
          isAuthenticated.value = false
          return false
        }
      }
    } else if (refreshToken) {
      // We have refresh token but no access token
      console.log('🔄 No access token but refresh token exists, attempting refresh...')
      try {
        // The interceptor will handle the refresh
        const response = await authAPI.getProfile()
        if (response.data) {
          console.log('✅ Token refreshed and user authenticated')
          return true
        }
      } catch (err) {
        console.log('❌ Refresh failed, clearing tokens')
        clearTokens()
        user.value = null
        isAuthenticated.value = false
        return false
      }
    } else {
      console.log('👤 No tokens found')
      user.value = null
      isAuthenticated.value = false
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