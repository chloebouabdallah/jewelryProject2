<!-- src/components/ChangePasswordModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/50" @click="close"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-fade-scale max-h-[90vh] overflow-y-auto">
      <button @click="close" class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition">
        <i class="fas fa-times text-xl"></i>
      </button>

      <div class="text-center mb-6">
        <i class="fas fa-key text-3xl text-amber-600 mb-2"></i>
        <h2 class="text-2xl font-playfair font-bold text-stone-800">Change Password</h2>
        <p class="text-stone-500 text-sm mt-1">Update your account password</p>
      </div>

      <form @submit.prevent="handleChangePassword" class="space-y-4">
        <!-- Current Password -->
        <div>
          <label class="block text-stone-700 text-sm mb-2">Current Password</label>
          <div class="relative">
            <input
              :type="showCurrentPassword ? 'text' : 'password'"
              v-model="form.currentPassword"
              required
              class="w-full px-4 py-2 pr-10 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Enter your current password"
            >
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <!-- New Password -->
        <div>
          <label class="block text-stone-700 text-sm mb-2">New Password</label>
          <div class="relative">
            <input
              :type="showNewPassword ? 'text' : 'password'"
              v-model="form.newPassword"
              required
              minlength="6"
              class="w-full px-4 py-2 pr-10 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Enter new password (min 6 characters)"
            >
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div class="mt-1 flex items-center gap-2">
            <div class="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
              <div 
                class="h-full transition-all duration-300 rounded-full"
                :class="passwordStrengthClass"
                :style="{ width: passwordStrength + '%' }"
              ></div>
            </div>
            <span class="text-xs text-stone-500">{{ passwordStrengthLabel }}</span>
          </div>
        </div>

        <!-- Confirm New Password -->
        <div>
          <label class="block text-stone-700 text-sm mb-2">Confirm New Password</label>
          <div class="relative">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="form.confirmPassword"
              required
              minlength="6"
              class="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              :class="confirmPasswordClass"
              placeholder="Confirm your new password"
            >
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <p v-if="form.confirmPassword && form.newPassword !== form.confirmPassword" class="text-red-500 text-xs mt-1">
            <i class="fas fa-exclamation-circle mr-1"></i> Passwords do not match
          </p>
          <p v-if="form.confirmPassword && form.newPassword === form.confirmPassword && form.newPassword.length >= 6" class="text-green-500 text-xs mt-1">
            <i class="fas fa-check-circle mr-1"></i> Passwords match
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          <i class="fas fa-exclamation-circle mr-2"></i> {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
          <i class="fas fa-check-circle mr-2"></i> {{ success }}
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="close"
            class="flex-1 px-4 py-2 border border-stone-300 rounded-full text-stone-700 hover:bg-stone-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2 rounded-full font-semibold hover:scale-[1.02] transition disabled:opacity-50"
          >
            <span v-if="!isLoading"><i class="fas fa-key mr-2"></i> Update Password</span>
            <span v-else><i class="fas fa-spinner fa-spin mr-2"></i> Updating...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { authAPI } from '@/services/osimart'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const authStore = useAuthStore()

// Form state
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Visibility toggles
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// UI state
const isLoading = ref(false)
const error = ref('')
const success = ref('')

// Password strength
const passwordStrength = computed(() => {
  const pwd = form.value.newPassword
  if (!pwd) return 0
  
  let score = 0
  if (pwd.length >= 6) score += 20
  if (pwd.length >= 8) score += 20
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 20
  if (/\d/.test(pwd)) score += 20
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 20
  
  return Math.min(score, 100)
})

const passwordStrengthLabel = computed(() => {
  const score = passwordStrength.value
  if (score === 0) return 'None'
  if (score < 30) return 'Weak'
  if (score < 60) return 'Fair'
  if (score < 80) return 'Good'
  return 'Strong'
})

const passwordStrengthClass = computed(() => {
  const score = passwordStrength.value
  if (score === 0) return 'bg-stone-200'
  if (score < 30) return 'bg-red-500'
  if (score < 60) return 'bg-yellow-500'
  if (score < 80) return 'bg-blue-500'
  return 'bg-green-500'
})

// Validation
const confirmPasswordClass = computed(() => {
  if (!form.value.confirmPassword) return 'border-amber-200'
  if (form.value.newPassword === form.value.confirmPassword) return 'border-green-500'
  return 'border-red-500'
})

const isFormValid = computed(() => {
  return form.value.currentPassword.length >= 6 &&
         form.value.newPassword.length >= 6 &&
         form.value.confirmPassword.length >= 6 &&
         form.value.newPassword === form.value.confirmPassword
})

// Close modal
const close = () => {
  // Reset form
  form.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  error.value = ''
  success.value = ''
  emit('close')
}

// Handle password change
const handleChangePassword = async () => {
  // Clear previous messages
  error.value = ''
  success.value = ''
  
  // Validate passwords match
  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = 'New passwords do not match.'
    return
  }
  
  // Validate password length
  if (form.value.newPassword.length < 6) {
    error.value = 'New password must be at least 6 characters.'
    return
  }
  
  // Validate current password
  if (form.value.currentPassword.length < 6) {
    error.value = 'Current password must be at least 6 characters.'
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await authAPI.changePassword({
      old_password: form.value.currentPassword,
      new_password: form.value.newPassword
    })
    
    console.log('✅ Password changed successfully:', response.data)
    
    success.value = 'Password changed successfully!'
    error.value = ''
    
    // Emit success event
    emit('success')
    
    // Close after a short delay
    setTimeout(() => {
      close()
    }, 1500)
    
  } catch (err) {
    console.error('❌ Password change failed:', err)
    
    if (err.response?.data) {
      const errorData = err.response.data
      if (errorData.message) {
        error.value = errorData.message
      } else if (errorData.error) {
        error.value = errorData.error
      } else if (errorData.detail) {
        error.value = errorData.detail
      } else if (errorData.old_password) {
        error.value = errorData.old_password.join(', ')
      } else if (errorData.new_password) {
        error.value = errorData.new_password.join(', ')
      } else if (typeof errorData === 'string') {
        error.value = errorData
      } else {
        error.value = 'Failed to change password. Please try again.'
      }
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = 'Failed to change password. Please try again.'
    }
    
    success.value = ''
  } finally {
    isLoading.value = false
  }
}

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    form.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    error.value = ''
    success.value = ''
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