<!-- src/components/GuestModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-[150] flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/50" @click="close"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-fade-scale max-h-[90vh] overflow-y-auto">
      <button @click="close" class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition">
        <i class="fas fa-times text-xl"></i>
      </button>

      <div class="text-center mb-6">
        <i class="fas fa-user text-3xl text-amber-600 mb-2"></i>
        <h2 class="text-2xl font-playfair font-bold text-stone-800">Continue as Guest</h2>
        <p class="text-stone-500 text-sm mt-1">No login required. Just fill in your details</p>
      </div>

      <form @submit.prevent="handleGuestSubmit" class="space-y-4">
        <!-- First Name -->
        <div>
          <label class="block text-stone-700 text-sm mb-2">First Name *</label>
          <input
            type="text"
            v-model="guestForm.firstName"
            required
            class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
            placeholder="Enter your first name"
            :disabled="isLoading"
          >
        </div>

        <!-- Last Name -->
        <div>
          <label class="block text-stone-700 text-sm mb-2">Last Name *</label>
          <input
            type="text"
            v-model="guestForm.lastName"
            required
            class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
            placeholder="Enter your last name"
            :disabled="isLoading"
          >
        </div>

        <!-- Mobile Number -->
        <div>
          <label class="block text-stone-700 text-sm mb-2">Mobile Number *</label>
          <input
            type="tel"
            v-model="guestForm.mobileNumber"
            required
            class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
            placeholder="+961 70 123 456"
            :disabled="isLoading"
          >
          <p class="text-xs text-stone-400 mt-1">We'll use this for order updates</p>
        </div>

        <!-- Email (Optional) -->
        <div>
          <label class="block text-stone-700 text-sm mb-2">Email Address <span class="text-stone-400 text-xs">(optional)</span></label>
          <input
            type="email"
            v-model="guestForm.email"
            class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
            placeholder="Enter your email (optional)"
            :disabled="isLoading"
          >
          <p class="text-xs text-stone-400 mt-1">Optional, but recommended for order confirmations</p>
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
        <div class="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2.5 rounded-full font-semibold hover:scale-[1.02] transition disabled:opacity-50"
          >
            <span v-if="!isLoading"><i class="fas fa-user mr-2"></i> Continue as Guest</span>
            <span v-else><i class="fas fa-spinner fa-spin mr-2"></i> Creating Guest...</span>
          </button>

          <div class="relative flex items-center my-2">
            <div class="flex-1 border-t border-stone-200"></div>
            <span class="px-4 text-xs text-stone-400">or</span>
            <div class="flex-1 border-t border-stone-200"></div>
          </div>

          <button
            type="button"
            @click="switchToLogin"
            class="w-full text-amber-600 hover:text-amber-700 font-medium text-sm transition"
          >
            <i class="fas fa-sign-in-alt mr-2"></i> Sign in with existing account
          </button>

          <button
            type="button"
            @click="close"
            class="w-full text-stone-400 hover:text-stone-600 text-sm transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { authAPI } from '@/services/osimart'
import { useGuestStore } from '@/stores/guest'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success', 'switch-to-login'])

const guestStore = useGuestStore()

// Form state
const guestForm = ref({
  firstName: '',
  lastName: '',
  mobileNumber: '',
  email: '',
  password: 'guest_' + Math.random().toString(36).substring(2, 10)
})

const isLoading = ref(false)
const error = ref('')
const success = ref('')

// ============================================
// HANDLE GUEST SUBMIT - Try to set guest status
// ============================================
const handleGuestSubmit = async () => {
  // Clear previous messages
  error.value = ''
  success.value = ''

  // Validate required fields
  if (!guestForm.value.firstName.trim()) {
    error.value = 'Please enter your first name.'
    return
  }

  if (!guestForm.value.lastName.trim()) {
    error.value = 'Please enter your last name.'
    return
  }

  if (!guestForm.value.mobileNumber.trim()) {
    error.value = 'Please enter your mobile number.'
    return
  }

  // Basic phone validation
  const phoneRegex = /^[\+\d\s\-\(\)]{8,20}$/
  if (!phoneRegex.test(guestForm.value.mobileNumber.trim())) {
    error.value = 'Please enter a valid phone number.'
    return
  }

  isLoading.value = true

  try {
    // Generate a unique guest email if not provided
    let email = guestForm.value.email.trim()
    if (!email) {
      const randomId = Math.random().toString(36).substring(2, 10)
      email = `guest_${randomId}@soutou.guest`
    }

    // Generate a random password for guest
    const password = 'guest_' + Math.random().toString(36).substring(2, 15)

    // Prepare guest data - Try to set guest status with various field names
    const guestData = {
      first_name: guestForm.value.firstName.trim(),
      last_name: guestForm.value.lastName.trim(),
      mobile: guestForm.value.mobileNumber.trim(),
      email: email,
      password: password,
      register_as: 'customer',
      store_id: '92ea209b-b32c-448e-85af-7296eb8eea00',
      // Try these fields to mark as guest
      user_type: 'guest',
      is_guest: true,
      status: 'guest',
      guest: true
    }

    console.log('👤 Creating guest with guest flags:', guestData)

    const response = await authAPI.register(guestData)

    console.log('✅ Guest created successfully:', response.data)

    // Store guest data in guest store
    const guestUser = {
      id: response.data.id || response.data.user_id || 'guest_' + Date.now(),
      firstName: guestForm.value.firstName.trim(),
      lastName: guestForm.value.lastName.trim(),
      mobileNumber: guestForm.value.mobileNumber.trim(),
      email: guestForm.value.email.trim() || email,
      isGuest: true,
      status: 'guest',
      createdAt: new Date().toISOString(),
      ...response.data
    }

    guestStore.setGuest(guestUser)

    success.value = 'Welcome! You are now browsing as a guest.'

    setTimeout(() => {
      emit('success', guestUser)
      close()
    }, 1500)

  } catch (err) {
    console.error('❌ Guest registration failed:', err)
    console.error('❌ Error response:', err.response?.data)
    console.error('❌ Error status:', err.response?.status)

    // If the guest fields are rejected, try without them
    if (err.response?.status === 400 && err.response?.data) {
      console.log('🔄 Retrying without guest-specific fields...')
      
      try {
        // Generate email and password
        let email = guestForm.value.email.trim()
        if (!email) {
          const randomId = Math.random().toString(36).substring(2, 10)
          email = `guest_${randomId}@soutou.guest`
        }
        const password = 'guest_' + Math.random().toString(36).substring(2, 15)

        const guestDataRetry = {
          first_name: guestForm.value.firstName.trim(),
          last_name: guestForm.value.lastName.trim(),
          mobile: guestForm.value.mobileNumber.trim(),
          email: email,
          password: password,
          register_as: 'customer',
          store_id: '92ea209b-b32c-448e-85af-7296eb8eea00'
        }

        console.log('👤 Creating guest (retry):', guestDataRetry)

        const responseRetry = await authAPI.register(guestDataRetry)

        console.log('✅ Guest created successfully (retry):', responseRetry.data)

        const guestUser = {
          id: responseRetry.data.id || responseRetry.data.user_id || 'guest_' + Date.now(),
          firstName: guestForm.value.firstName.trim(),
          lastName: guestForm.value.lastName.trim(),
          mobileNumber: guestForm.value.mobileNumber.trim(),
          email: guestForm.value.email.trim() || email,
          isGuest: true,
          status: 'guest',
          createdAt: new Date().toISOString(),
          ...responseRetry.data
        }

        guestStore.setGuest(guestUser)

        success.value = 'Welcome! You are now browsing as a guest.'

        setTimeout(() => {
          emit('success', guestUser)
          close()
        }, 1500)
        
        return
      } catch (retryErr) {
        console.error('❌ Guest registration retry failed:', retryErr)
      }
    }

    // Handle error
    if (err.response?.data) {
      if (typeof err.response.data === 'string') {
        error.value = err.response.data
      } else if (err.response.data.message) {
        error.value = err.response.data.message
      } else if (err.response.data.error) {
        error.value = err.response.data.error
      } else if (err.response.data.detail) {
        error.value = err.response.data.detail
      } else if (err.response.data.first_name) {
        error.value = Array.isArray(err.response.data.first_name)
          ? err.response.data.first_name.join(', ')
          : err.response.data.first_name
      } else if (err.response.data.last_name) {
        error.value = Array.isArray(err.response.data.last_name)
          ? err.response.data.last_name.join(', ')
          : err.response.data.last_name
      } else if (err.response.data.mobile) {
        error.value = Array.isArray(err.response.data.mobile)
          ? err.response.data.mobile.join(', ')
          : err.response.data.mobile
      } else if (err.response.data.email) {
        error.value = Array.isArray(err.response.data.email)
          ? err.response.data.email.join(', ')
          : err.response.data.email
      } else if (err.response.data.password) {
        error.value = Array.isArray(err.response.data.password)
          ? err.response.data.password.join(', ')
          : err.response.data.password
      } else if (err.response.data.user_type) {
        error.value = Array.isArray(err.response.data.user_type)
          ? err.response.data.user_type.join(', ')
          : err.response.data.user_type
      } else if (err.response.data.is_guest) {
        error.value = Array.isArray(err.response.data.is_guest)
          ? err.response.data.is_guest.join(', ')
          : err.response.data.is_guest
      } else if (err.response.data.status) {
        error.value = Array.isArray(err.response.data.status)
          ? err.response.data.status.join(', ')
          : err.response.data.status
      } else if (err.response.data.guest) {
        error.value = Array.isArray(err.response.data.guest)
          ? err.response.data.guest.join(', ')
          : err.response.data.guest
      } else if (err.response.data.non_field_errors) {
        error.value = err.response.data.non_field_errors.join(', ')
      } else {
        error.value = 'Failed to create guest account. Please try again.'
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
// SWITCH TO LOGIN
// ============================================
const switchToLogin = () => {
  emit('switch-to-login')
  close()
}

// ============================================
// CLOSE MODAL
// ============================================
const close = () => {
  guestForm.value = {
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    password: 'guest_' + Math.random().toString(36).substring(2, 10)
  }
  error.value = ''
  success.value = ''
  isLoading.value = false
  emit('close')
}

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    guestForm.value = {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      password: 'guest_' + Math.random().toString(36).substring(2, 10)
    }
    error.value = ''
    success.value = ''
    isLoading.value = false
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