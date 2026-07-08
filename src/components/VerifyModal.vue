<!-- src/components/VerifyModal.vue -->
<template>
  <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/50" @click="closeModal"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-fade-scale">
      <button @click="closeModal" class="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
        <i class="fas fa-times text-xl"></i>
      </button>
      
      <div class="text-center mb-6">
        <i class="fas fa-gem text-3xl text-amber-600 mb-2"></i>
        <h2 class="text-2xl font-playfair font-bold text-stone-800">SOUTOU</h2>
        <p class="text-stone-500 text-sm">Verify Your Email</p>
      </div>
      
      <div class="text-center mb-6">
        <i class="fas fa-envelope text-5xl text-amber-400 mb-3"></i>
        <p class="text-stone-600 text-sm">
          We've sent a verification code to<br>
          <span class="font-semibold text-stone-800">{{ displayEmail }}</span>
        </p>
        <p class="text-stone-500 text-xs mt-2">Enter the 4-digit code below</p>
      </div>
      
      <form @submit.prevent="handleVerify" class="space-y-4">
        <div class="flex gap-2 justify-center">
          <input 
            v-for="i in 4" 
            :key="i"
            type="text"
            maxlength="1"
            v-model="code[i-1]"
            @input="handleCodeInput(i-1, $event)"
            @keydown="handleCodeKeydown(i-1, $event)"
            ref="codeInputs"
            class="w-14 h-16 text-center text-2xl font-bold border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
            :class="{ 'border-red-400': error }"
          >
        </div>
        
        <button 
          type="submit" 
          :disabled="isLoading || !isCodeComplete"
          class="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2.5 rounded-full font-semibold hover:scale-[1.02] transition disabled:opacity-50"
        >
          {{ isLoading ? 'Verifying...' : 'Verify Account' }}
        </button>
      </form>
      
      <div class="text-center mt-4">
        <p class="text-sm text-stone-600">
          Didn't receive the code?
          <button @click="resendCode" :disabled="isResending" class="text-amber-600 hover:underline font-semibold disabled:opacity-50">
            {{ isResending ? 'Sending...' : 'Resend Code' }}
          </button>
        </p>
        <p v-if="resendMessage" class="text-xs mt-2" :class="resendMessageClass">{{ resendMessage }}</p>
      </div>
      
      <p v-if="error" class="text-red-500 text-sm text-center mt-4 p-2 bg-red-50 rounded-lg">
        {{ error }}
      </p>
      <p v-if="successMessage" class="text-green-600 text-sm text-center mt-4 p-2 bg-green-50 rounded-lg">
        {{ successMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { authAPI } from '@/services/osimart'

const props = defineProps({
  email: { type: String, required: true },
  storeId: { type: String, required: true }
})

const emit = defineEmits(['verified', 'close'])

const showModal = ref(true)
const isLoading = ref(false)
const isResending = ref(false)
const error = ref('')
const successMessage = ref('')
const resendMessage = ref('')
const resendMessageClass = ref('')
const codeInputs = ref([])
const code = ref(['', '', '', ''])

const displayEmail = computed(() => {
  return props.email.replace(/^mystore1__/, '')
})

const isCodeComplete = computed(() => code.value.every(digit => digit !== ''))
const isCodeValid = computed(() => code.value.every(digit => /^[0-9]$/.test(digit)))

const closeModal = () => {
  showModal.value = false
  emit('close')
}

const handleCodeInput = (index, event) => {
  const value = event.target.value
  if (value && !/^[0-9]$/.test(value)) {
    event.target.value = ''
    return
  }
  code.value[index] = value
  if (value && index < 3) {
    nextTick(() => codeInputs.value[index + 1].focus())
  }
}

const handleCodeKeydown = (index, event) => {
  if (event.key === 'Backspace' && !code.value[index] && index > 0) {
    nextTick(() => codeInputs.value[index - 1].focus())
  }
}

const handleVerify = async () => {
  if (!isCodeComplete.value || !isCodeValid.value) {
    error.value = 'Please enter a valid 4-digit code'
    return
  }

  isLoading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const codeString = code.value.join('')
    const verifyData = {
      verify_as: 'customer',
      store_id: props.storeId,
      email: props.email,
      code: codeString
    }

    console.log('✅ Verifying:', verifyData)
    const response = await authAPI.verify(verifyData)
    console.log('✅ Verification response:', response.data)

    let userData = response.data
    if (response.data.user) userData = response.data.user
    else if (response.data.data?.user) userData = response.data.data.user

    const rawEmail = userData?.email || response.data?.email || props.email

    successMessage.value = '✅ Email verified successfully!'
    
    setTimeout(() => {
      emit('verified', { user: userData, rawEmail: rawEmail, cleanEmail: props.email })
      closeModal()
    }, 1500)

  } catch (err) {
    console.error('❌ Verification failed:', err)
    error.value = err.response?.data?.message || 'Invalid verification code. Please try again.'
    code.value = ['', '', '', '']
    nextTick(() => codeInputs.value[0]?.focus())
  } finally {
    isLoading.value = false
  }
}

const resendCode = async () => {
  isResending.value = true
  resendMessage.value = ''
  error.value = ''

  try {
    const resendData = {
      verify_as: 'customer',
      store_id: props.storeId,
      email: props.email
    }

    await authAPI.resendVerification(resendData)
    resendMessage.value = '✅ New code sent to your email!'
    resendMessageClass.value = 'text-green-600'
  } catch (err) {
    resendMessage.value = '❌ Failed to resend code. Please try again.'
    resendMessageClass.value = 'text-red-600'
  } finally {
    isResending.value = false
  }
}

watch(showModal, (isOpen) => {
  if (isOpen) {
    nextTick(() => codeInputs.value[0]?.focus())
  }
})
</script>

<style scoped>
.animate-fade-scale {
  animation: fadeScale 0.2s ease-out;
}
@keyframes fadeScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>