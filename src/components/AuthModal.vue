<!-- src/components/AuthModal.vue -->
<template>
  <div v-if="authStore.showAuthModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/50" @click="authStore.closeAuthModal()"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-fade-scale max-h-[90vh] overflow-y-auto">
      <button @click="authStore.closeAuthModal()" class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition">
        <i class="fas fa-times text-xl"></i>
      </button>

      <div class="text-center mb-6">
        <i class="fas fa-gem text-3xl text-amber-600 mb-2"></i>
        <h2 class="text-2xl font-playfair font-bold text-stone-800">SOUTOU</h2>
        <p class="text-stone-500 text-sm mt-1">{{ authStore.authMode === 'login' ? 'Welcome back!' : 'Create your account' }}</p>
      </div>

      <!-- Login Form -->
      <div v-if="authStore.authMode === 'login'">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-stone-700 text-sm mb-2">Email Address</label>
            <input
              type="email"
              v-model="loginForm.email"
              required
              class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Enter your email"
            >
          </div>
          <div>
            <label class="block text-stone-700 text-sm mb-2">Password</label>
            <input
              type="password"
              v-model="loginForm.password"
              required
              class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Enter your password"
            >
          </div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2.5 rounded-full font-semibold hover:scale-[1.02] transition disabled:opacity-50"
          >
            <span v-if="!authStore.isLoading"><i class="fas fa-user mr-2"></i> Sign In</span>
            <span v-else><i class="fas fa-spinner fa-spin mr-2"></i> Signing In...</span>
          </button>
        </form>

        <div class="flex items-center gap-3 my-4">
          <div class="flex-1 border-t border-stone-200"></div>
          <span class="text-xs text-stone-400">or continue with</span>
          <div class="flex-1 border-t border-stone-200"></div>
        </div>

        <button
          @click="handleGoogleLoginClick"
          :disabled="isGoogleLoading"
          class="w-full flex items-center justify-center gap-3 py-2.5 border border-stone-300 rounded-lg hover:bg-stone-50 transition font-medium text-stone-700 disabled:opacity-50"
        >
          <svg v-if="!isGoogleLoading" class="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          <i v-else class="fas fa-spinner fa-spin"></i>
          {{ isGoogleLoading ? 'Loading...' : 'Continue with Google' }}
        </button>

        <p class="text-center text-sm text-stone-600 mt-4">
          Don't have an account?
          <button type="button" @click="authStore.authMode = 'signup'" class="text-amber-600 hover:underline font-semibold">Sign Up</button>
        </p>
      </div>

      <!-- Signup Form -->
      <div v-else>
        <form @submit.prevent="handleSignup" class="space-y-4">
          <div>
            <label class="block text-stone-700 text-sm mb-2">First Name *</label>
            <input
              type="text"
              v-model="signupForm.firstName"
              required
              class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Enter your first name"
            >
          </div>
          <div>
            <label class="block text-stone-700 text-sm mb-2">Last Name *</label>
            <input
              type="text"
              v-model="signupForm.lastName"
              required
              class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Enter your last name"
            >
          </div>
          <div>
            <label class="block text-stone-700 text-sm mb-2">Email Address *</label>
            <input
              type="email"
              v-model="signupForm.email"
              required
              class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Enter your email"
            >
          </div>
          <div>
            <label class="block text-stone-700 text-sm mb-2">Password *</label>
            <input
              type="password"
              v-model="signupForm.password"
              required
              class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Create a password (min 6 characters)"
            >
          </div>
          <div>
            <label class="block text-stone-700 text-sm mb-2">Mobile Number *</label>
            <input
              type="tel"
              v-model="signupForm.mobileNumber"
              required
              class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="+961 70 123 456"
            >
          </div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2.5 rounded-full font-semibold hover:scale-[1.02] transition disabled:opacity-50"
          >
            <span v-if="!authStore.isLoading">Create Account</span>
            <span v-else><i class="fas fa-spinner fa-spin mr-2"></i> Creating...</span>
          </button>
        </form>

        <p class="text-center text-sm text-stone-600 mt-4">
          Already have an account?
          <button type="button" @click="authStore.authMode = 'login'" class="text-amber-600 hover:underline font-semibold">Sign In</button>
        </p>
      </div>

      <p v-if="authStore.error" class="text-red-500 text-sm text-center mt-4 p-2 bg-red-50 rounded-lg">
        <i class="fas fa-exclamation-circle mr-1"></i> {{ authStore.error }}
      </p>
    </div>
  </div>

  <VerifyModal
    v-if="showVerifyModal"
    :email="verifyEmail"
    :store-id="verifyStoreId"
    @verified="handleVerificationSuccess"
    @close="handleVerificationClose"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { EMAIL_PREFIX, prefixEmail, cleanEmail } from '@/services/osimart'
import VerifyModal from './VerifyModal.vue'

const emit = defineEmits(['login-success'])
const authStore = useAuthStore()
const isGoogleLoading = ref(false)

// Verification modal state
const showVerifyModal = ref(false)
const verifyEmail = ref('')
const verifyStoreId = ref('')
const rawEmailForLogin = ref('')

const loginForm = ref({
  email: '',
  password: ''
})

const signupForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  mobileNumber: ''
})

// Generate device info
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent
  let deviceName = 'Desktop'
  if (userAgent.includes('Mobile')) {
    deviceName = 'Mobile'
  } else if (userAgent.includes('Tablet')) {
    deviceName = 'Tablet'
  } else if (userAgent.includes('Mac')) {
    deviceName = 'Mac'
  } else if (userAgent.includes('Windows')) {
    deviceName = 'Windows'
  } else if (userAgent.includes('Linux')) {
    deviceName = 'Linux'
  }

  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    localStorage.setItem('device_id', deviceId)
  }

  return { deviceName, deviceId }
}

// ============================================
// GOOGLE LOGIN
// ============================================
const handleGoogleLogin = (response) => {
  console.log('🔐 Google login response received:', response)
  isGoogleLoading.value = false

  try {
    const { credential } = response

    if (!credential) {
      console.error('❌ No credential received from Google')
      authStore.error = 'Google login failed. No credential received.'
      return
    }

    const payload = credential.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload))

    console.log('📧 Decoded Google user:', {
      name: decodedPayload.name,
      email: decodedPayload.email,
      sub: decodedPayload.sub
    })

    const { deviceName, deviceId } = getDeviceInfo()

    const googleUser = {
      id: decodedPayload.sub,
      name: decodedPayload.name || 'Google User',
      email: decodedPayload.email,
      picture: decodedPayload.picture || '',
      provider: 'google',
      token: credential,
      deviceName: deviceName,
      deviceId: deviceId
    }

    authStore.socialLogin(googleUser)
    authStore.closeAuthModal()
    emit('login-success')

    console.log('✅ Google login successful for:', googleUser.email)

  } catch (error) {
    console.error('❌ Google login error:', error)
    authStore.error = 'Google login failed. Please try again.'
  }
}

const handleGoogleLoginClick = () => {
  isGoogleLoading.value = true

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    console.error('❌ VITE_GOOGLE_CLIENT_ID is not set')
    authStore.error = 'Google login is not configured properly.'
    isGoogleLoading.value = false
    return
  }

  if (typeof google === 'undefined' || !google.accounts) {
    console.log('⏳ Google API not loaded, trying to load...')
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('✅ Google API loaded dynamically')
      setTimeout(() => handleGoogleLoginClick(), 300)
    }
    script.onerror = () => {
      console.error('❌ Failed to load Google API')
      authStore.error = 'Failed to load Google login. Please refresh and try again.'
      isGoogleLoading.value = false
    }
    document.head.appendChild(script)
    return
  }

  console.log('✅ Google API available, initializing One Tap...')

  try {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleLogin,
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    google.accounts.id.prompt((notification) => {
      console.log('📢 Google One Tap notification:', notification)
      if (notification.isNotDisplayed()) {
        console.log('❌ One Tap not displayed:', notification.getNotDisplayedReason())
      }
      if (notification.isSkippedMoment()) {
        console.log('⏭️ One Tap skipped:', notification.getSkippedReason())
      }
    })

    setTimeout(() => {
      if (isGoogleLoading.value) {
        isGoogleLoading.value = false
      }
    }, 10000)

  } catch (error) {
    console.error('❌ Google login error:', error)
    authStore.error = 'Google login failed. Please try again.'
    isGoogleLoading.value = false
  }
}

// ============================================
// LOGIN - ALWAYS USE RAW EMAIL (with prefix)
// ============================================
const handleLogin = async () => {
  try {
    const { deviceName, deviceId } = getDeviceInfo()
    
    // ✅ ALWAYS send the raw email (with prefix) to the API
    // If user entered clean email, add the prefix
    const emailToSend = prefixEmail(loginForm.value.email)

    console.log('📧 Sending to API:', emailToSend)

    const result = await authStore.login(
      emailToSend,
      loginForm.value.password,
      deviceName,
      deviceId
    )

    if (result && result.success) {
      loginForm.value = { email: '', password: '' }
      authStore.closeAuthModal()
      emit('login-success')
    }
  } catch (error) {
    console.error('Login error:', error)
    if (!authStore.error) {
      authStore.error = 'Invalid email or password. Please try again.'
    }
  }
}

// ============================================
// SIGNUP
// ============================================
const handleSignup = async () => {
  try {
    console.log('📝 Starting signup process...')

    const result = await authStore.signup(
      signupForm.value.firstName,
      signupForm.value.lastName,
      signupForm.value.email,
      signupForm.value.password,
      signupForm.value.mobileNumber
    )

    console.log('📝 Signup result:', result)

    if (result && result.success) {
      if (result.requiresVerification) {
        console.log('✅ Verification required! Showing verification modal...')
        console.log('📧 Verification email:', result.verificationData.email)

        verifyEmail.value = result.verificationData.email
        verifyStoreId.value = result.verificationData.storeId
        rawEmailForLogin.value = result.verificationData.rawEmail || result.verificationData.email

        console.log('📧 Raw email for login:', rawEmailForLogin.value)

        showVerifyModal.value = true

        signupForm.value = {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          mobileNumber: ''
        }

        authStore.closeAuthModal()

        console.log('✅ Verification modal should now be visible')
      } else {
        console.log('✅ No verification required, logging in directly')
        signupForm.value = { firstName: '', lastName: '', email: '', password: '', mobileNumber: '' }
        authStore.closeAuthModal()
        emit('login-success')
      }
    } else {
      console.log('❌ Signup result was not successful:', result)
    }
  } catch (error) {
    console.error('❌ Signup error:', error)
  }
}

// ============================================
// VERIFICATION
// ============================================
const handleVerificationSuccess = (data) => {
  console.log('✅ Verification successful!')
  showVerifyModal.value = false

  // Get the raw email with prefix
  const loginEmail = data?.rawEmail || rawEmailForLogin.value || verifyEmail.value
  const displayEmail = cleanEmail(loginEmail)

  // Pre-fill login form silently
  loginForm.value.email = loginEmail

  alert(`✅ Your account has been verified!\n\nPlease sign in with your email:\n📧 ${displayEmail}`)

  authStore.authMode = 'login'
  authStore.openAuthModal('login')

  emit('login-success')
}

const handleVerificationClose = () => {
  console.log('🔒 Verification modal closed')
  showVerifyModal.value = false
}

onMounted(() => {
  console.log('🔧 AuthModal mounted')
})

onUnmounted(() => {
  console.log('🔧 AuthModal unmounted')
})
</script>

<style scoped>
.animate-fade-scale {
  animation: fadeScale 0.2s ease-out;
}

@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>