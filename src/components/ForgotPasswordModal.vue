<!-- src/components/ForgotPasswordModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/50" @click="close"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-fade-scale max-h-[90vh] overflow-y-auto">
      <button @click="close" class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition">
        <i class="fas fa-times text-xl"></i>
      </button>

      <div class="text-center mb-6">
        <i class="fas fa-key text-3xl text-amber-600 mb-2"></i>
        <h2 class="text-2xl font-playfair font-bold text-stone-800">Forgot Password</h2>
        <p class="text-stone-500 text-sm mt-1">
          {{ step === 1 ? 'Enter your email to receive a reset code' : 'Enter the 4-digit code and your new password' }}
        </p>
      </div>

      <!-- Step 1: Request Reset Code -->
      <div v-if="step === 1">
        <form @submit.prevent="handleRequestCode" class="space-y-4">
          <div>
            <label class="block text-stone-700 text-sm mb-2">Email Address</label>
            <input
              type="email"
              v-model="forgotForm.email"
              required
              class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Enter your email"
              :disabled="isLoading"
            >
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            <i class="fas fa-exclamation-circle mr-2"></i> {{ error }}
          </div>

          <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
            <i class="fas fa-check-circle mr-2"></i> {{ success }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2.5 rounded-full font-semibold hover:scale-[1.02] transition disabled:opacity-50"
          >
            <span v-if="!isLoading"><i class="fas fa-paper-plane mr-2"></i> Send Reset Code</span>
            <span v-else><i class="fas fa-spinner fa-spin mr-2"></i> Sending...</span>
          </button>

          <button
            type="button"
            @click="close"
            class="w-full text-stone-500 text-sm hover:text-stone-700 transition"
          >
            Back to Login
          </button>
        </form>
      </div>

      <!-- Step 2: Reset Password with 4-digit Code -->
      <div v-else>
        <form @submit.prevent="handleResetPassword" class="space-y-4">
          <div class="text-center mb-2">
            <p class="text-sm text-stone-600">
              We sent a 4-digit code to<br>
              <span class="font-semibold text-stone-800">{{ resetForm.email }}</span>
            </p>
            <button
              type="button"
              @click="resendCode"
              class="text-xs text-amber-600 hover:text-amber-700 hover:underline transition mt-1"
              :disabled="isLoading || isResending"
            >
              <i v-if="isResending" class="fas fa-spinner fa-spin mr-1"></i>
              {{ isResending ? 'Resending...' : 'Resend Code' }}
            </button>
          </div>

          <div>
            <label class="block text-stone-700 text-sm mb-2">Reset Code</label>
            <div class="flex justify-center gap-3">
              <input
                v-for="i in 4"
                :key="i"
                type="text"
                maxlength="1"
                ref="codeInputs"
                :value="resetForm.code[i-1] || ''"
                @input="handleCodeInput(i-1, $event)"
                @keydown="handleCodeKeydown(i-1, $event)"
                @paste="handleCodePaste"
                class="w-14 h-16 text-center text-3xl font-bold border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none focus:border-amber-500 transition"
                :class="{ 'border-red-500': codeError }"
                :disabled="isLoading"
                autofocus
              >
            </div>
            <p v-if="codeError" class="text-red-500 text-xs mt-2 text-center">
              <i class="fas fa-exclamation-circle mr-1"></i> {{ codeError }}
            </p>
            <p class="text-xs text-stone-400 text-center mt-1">Enter the 4-digit code sent to your email</p>
          </div>

          <div>
            <label class="block text-stone-700 text-sm mb-2">New Password</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="resetForm.newPassword"
                required
                minlength="6"
                class="w-full px-4 py-2 pr-10 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                placeholder="Enter new password (min 6 characters)"
                :disabled="isLoading"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-stone-700 text-sm mb-2">Confirm New Password</label>
            <div class="relative">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="resetForm.confirmPassword"
                required
                minlength="6"
                class="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                :class="confirmPasswordClass"
                placeholder="Confirm new password"
                :disabled="isLoading"
              >
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <p v-if="resetForm.confirmPassword && resetForm.newPassword !== resetForm.confirmPassword" class="text-red-500 text-xs mt-1">
              <i class="fas fa-exclamation-circle mr-1"></i> Passwords do not match
            </p>
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            <i class="fas fa-exclamation-circle mr-2"></i> {{ error }}
          </div>

          <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
            <i class="fas fa-check-circle mr-2"></i> {{ success }}
          </div>

          <button
            type="submit"
            :disabled="isLoading || !isResetFormValid"
            class="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2.5 rounded-full font-semibold hover:scale-[1.02] transition disabled:opacity-50"
          >
            <span v-if="!isLoading"><i class="fas fa-save mr-2"></i> Reset Password</span>
            <span v-else><i class="fas fa-spinner fa-spin mr-2"></i> Resetting...</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { authAPI } from '@/services/osimart'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'switch-to-login'])

// Form states
const step = ref(1)
const isLoading = ref(false)
const isResending = ref(false)
const error = ref('')
const success = ref('')
const codeError = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const codeInputs = ref([])

const forgotForm = ref({
  email: ''
})

const resetForm = ref({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed
const confirmPasswordClass = computed(() => {
  if (!resetForm.value.confirmPassword) return 'border-amber-200'
  if (resetForm.value.newPassword === resetForm.value.confirmPassword) return 'border-green-500'
  return 'border-red-500'
})

const isResetFormValid = computed(() => {
  return resetForm.value.email &&
         resetForm.value.code &&
         resetForm.value.code.length === 4 &&
         resetForm.value.newPassword.length >= 6 &&
         resetForm.value.confirmPassword.length >= 6 &&
         resetForm.value.newPassword === resetForm.value.confirmPassword
})

// ============================================
// CODE INPUT HANDLING (4-digit)
// ============================================
const handleCodeInput = (index, event) => {
  const value = event.target.value.replace(/\D/g, '').slice(0, 1)
  const code = resetForm.value.code.split('')
  code[index] = value
  resetForm.value.code = code.join('')
  
  if (value && index < 3) {
    nextTick(() => {
      const nextInput = codeInputs.value[index + 1]
      if (nextInput) nextInput.focus()
    })
  }
  
  codeError.value = ''
}

const handleCodeKeydown = (index, event) => {
  if (event.key === 'Backspace' && !resetForm.value.code[index] && index > 0) {
    const prevInput = codeInputs.value[index - 1]
    if (prevInput) prevInput.focus()
  }
}

const handleCodePaste = (event) => {
  event.preventDefault()
  const paste = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
  if (paste) {
    resetForm.value.code = paste
    if (paste.length === 4) {
      nextTick(() => {
        const lastInput = codeInputs.value[3]
        if (lastInput) lastInput.focus()
      })
    }
  }
}

// ============================================
// STEP 1: Request Reset Code
// ============================================
const handleRequestCode = async () => {
  error.value = ''
  success.value = ''
  isLoading.value = true

  try {
    const requestData = {
      email: forgotForm.value.email
    }
    
    console.log('📤 Sending forgot password request:', requestData)
    
    const response = await authAPI.forgotPassword(requestData)
    
    console.log('✅ Reset code sent:', response.data)
    
    success.value = 'A 4-digit reset code has been sent to your email!'
    
    resetForm.value.email = forgotForm.value.email
    
    setTimeout(() => {
      step.value = 2
      success.value = ''
      nextTick(() => {
        if (codeInputs.value[0]) codeInputs.value[0].focus()
      })
    }, 2000)

  } catch (err) {
    console.error('❌ Forgot password error:', err)
    console.error('❌ Error response:', err.response?.data)
    console.error('❌ Error status:', err.response?.status)
    
    if (err.response?.data) {
      if (typeof err.response.data === 'string') {
        error.value = err.response.data
      } else if (err.response.data.message) {
        error.value = err.response.data.message
      } else if (err.response.data.error) {
        error.value = err.response.data.error
      } else if (err.response.data.detail) {
        error.value = err.response.data.detail
      } else if (err.response.data.email) {
        error.value = Array.isArray(err.response.data.email) 
          ? err.response.data.email.join(', ') 
          : err.response.data.email
      } else if (err.response.data.non_field_errors) {
        error.value = err.response.data.non_field_errors.join(', ')
      } else if (err.response.data.reset_as) {
        error.value = 'Invalid request format. Please try again.'
      } else {
        error.value = 'Failed to send reset code. Please try again.'
        console.log('📝 Full error data:', JSON.stringify(err.response.data))
      }
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = 'Network error. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

// ============================================
// RESEND CODE
// ============================================
const resendCode = async () => {
  isResending.value = true
  error.value = ''
  success.value = ''

  try {
    const requestData = {
      email: resetForm.value.email
    }
    
    console.log('📤 Resending reset code:', requestData)
    
    const response = await authAPI.forgotPassword(requestData)
    
    console.log('✅ Reset code resent:', response.data)
    
    success.value = 'A new 4-digit reset code has been sent to your email!'
    
    resetForm.value.code = ''
    nextTick(() => {
      if (codeInputs.value[0]) codeInputs.value[0].focus()
    })
    
    setTimeout(() => {
      success.value = ''
    }, 3000)

  } catch (err) {
    console.error('❌ Resend code error:', err)
    error.value = 'Failed to resend code. Please try again.'
  } finally {
    isResending.value = false
  }
}

// ============================================
// STEP 2: Reset Password with Code
// ============================================
const handleResetPassword = async () => {
  error.value = ''
  success.value = ''
  codeError.value = ''

  if (resetForm.value.code.length !== 4) {
    codeError.value = 'Please enter the complete 4-digit code.'
    return
  }

  if (resetForm.value.newPassword !== resetForm.value.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }

  if (resetForm.value.newPassword.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }

  isLoading.value = true

  try {
    const requestData = {
      email: resetForm.value.email,
      code: resetForm.value.code,
      new_password: resetForm.value.newPassword
    }
    
    console.log('📤 Sending reset password request:', requestData)
    
    const response = await authAPI.resetPassword(requestData)

    console.log('✅ Password reset successful:', response.data)
    
    success.value = 'Password reset successfully!'

    setTimeout(() => {
      emit('switch-to-login')
      close()
    }, 2000)

  } catch (err) {
    console.error('❌ Reset password error:', err)
    console.error('❌ Error response:', err.response?.data)
    console.error('❌ Error status:', err.response?.status)
    
    if (err.response?.data) {
      if (typeof err.response.data === 'string') {
        error.value = err.response.data
      } else if (err.response.data.message) {
        error.value = err.response.data.message
      } else if (err.response.data.error) {
        error.value = err.response.data.error
      } else if (err.response.data.detail) {
        error.value = err.response.data.detail
      } else if (err.response.data.code) {
        codeError.value = 'Invalid reset code. Please check and try again.'
      } else if (err.response.data.password) {
        error.value = Array.isArray(err.response.data.password)
          ? err.response.data.password.join(', ')
          : err.response.data.password
      } else if (err.response.data.new_password) {
        error.value = Array.isArray(err.response.data.new_password)
          ? err.response.data.new_password.join(', ')
          : err.response.data.new_password
      } else if (err.response.data.non_field_errors) {
        error.value = err.response.data.non_field_errors.join(', ')
      } else if (err.response.data.reset_as) {
        error.value = 'Invalid request format. Please try again.'
      } else {
        error.value = 'Failed to reset password. Please try again.'
        console.log('📝 Full error data:', JSON.stringify(err.response.data))
      }
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = 'Network error. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

// ============================================
// HELPERS
// ============================================
const close = () => {
  step.value = 1
  isLoading.value = false
  isResending.value = false
  error.value = ''
  success.value = ''
  codeError.value = ''
  showPassword.value = false
  showConfirmPassword.value = false
  forgotForm.value = { email: '' }
  resetForm.value = {
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  }
  emit('close')
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    step.value = 1
    error.value = ''
    success.value = ''
    codeError.value = ''
    forgotForm.value = { email: '' }
    resetForm.value = {
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: ''
    }
  }
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