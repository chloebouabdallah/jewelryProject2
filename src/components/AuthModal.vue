<template>
  <div v-if="authStore.showAuthModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="authStore.closeAuthModal()"></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-fade-scale">
      <!-- Close button -->
      <button @click="authStore.closeAuthModal()" class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition">
        <i class="fas fa-times text-xl"></i>
      </button>
      
      <!-- Logo -->
      <div class="text-center mb-6">
        <i class="fas fa-gem text-3xl text-amber-600 mb-2"></i>
        <h2 class="text-2xl font-playfair font-bold text-stone-800">SOUTOU</h2>
        <p class="text-stone-500 text-sm mt-1">{{ authMode === 'login' ? 'Sign in to your account' : 'Create your account' }}</p>
      </div>
      
      <!-- Social Login Buttons -->
      <div class="space-y-3 mb-4">
        <!-- Google Button -->
        <button 
          @click="handleGoogleLogin" 
          class="w-full flex items-center justify-center gap-3 py-2.5 border border-stone-300 rounded-lg hover:bg-stone-50 transition font-medium text-stone-700"
        >
          <svg class="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Continue with Google
        </button>
        
        <!-- Facebook Button -->
        <button 
          @click="handleFacebookLogin" 
          class="w-full flex items-center justify-center gap-3 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-lg transition font-medium"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Continue with Facebook
        </button>
      </div>
      
      <!-- Divider -->
      <div class="flex items-center gap-3 my-4">
        <div class="flex-1 border-t border-stone-200"></div>
        <span class="text-xs text-stone-400">or</span>
        <div class="flex-1 border-t border-stone-200"></div>
      </div>
      
      <!-- Login Form -->
      <div v-if="authMode === 'login'">
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
          <button type="submit" class="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2.5 rounded-full font-semibold hover:scale-[1.02] transition">
            Sign In
          </button>
        </form>
        <p class="text-center text-sm text-stone-600 mt-4">
          Don't have an account? 
          <button type="button" @click="authStore.authMode = 'signup'" class="text-amber-600 hover:underline font-semibold">Sign Up</button>
        </p>
      </div>
      
      <!-- Signup Form -->
      <div v-else>
        <form @submit.prevent="handleSignup" class="space-y-4">
          <div>
            <label class="block text-stone-700 text-sm mb-2">Full Name</label>
            <input 
              type="text" 
              v-model="signupForm.name" 
              required
              class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Enter your name"
            >
          </div>
          <div>
            <label class="block text-stone-700 text-sm mb-2">Email Address</label>
            <input 
              type="email" 
              v-model="signupForm.email" 
              required
              class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Enter your email"
            >
          </div>
          <div>
            <label class="block text-stone-700 text-sm mb-2">Password</label>
            <input 
              type="password" 
              v-model="signupForm.password" 
              required
              class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              placeholder="Create a password"
            >
          </div>
          <button type="submit" class="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2.5 rounded-full font-semibold hover:scale-[1.02] transition">
            Create Account
          </button>
        </form>
        <p class="text-center text-sm text-stone-600 mt-4">
          Already have an account? 
          <button type="button" @click="authStore.authMode = 'login'" class="text-amber-600 hover:underline font-semibold">Sign In</button>
        </p>
      </div>
      
      <!-- Error Message -->
      <p v-if="errorMessage" class="text-red-500 text-sm text-center mt-4">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['login-success'])
const authStore = useAuthStore()
const errorMessage = ref('')

const loginForm = ref({
  email: '',
  password: ''
})

const signupForm = ref({
  name: '',
  email: '',
  password: ''
})

// Social Login Handlers
const handleGoogleLogin = () => {
  // For demo purposes - simulate Google login
  const googleUser = {
    name: 'Google User',
    email: 'google.user@gmail.com',
    provider: 'google'
  }
  authStore.socialLogin(googleUser)
  emit('login-success')
}

const handleFacebookLogin = () => {
  // For demo purposes - simulate Facebook login
  const facebookUser = {
    name: 'Facebook User',
    email: 'fb.user@gmail.com',
    provider: 'facebook'
  }
  authStore.socialLogin(facebookUser)
  emit('login-success')
}

// Regular login/signup handlers
const handleLogin = async () => {
  errorMessage.value = ''
  try {
    await authStore.login(loginForm.value.email, loginForm.value.password)
    loginForm.value = { email: '', password: '' }
    emit('login-success')
  } catch (error) {
    errorMessage.value = error
  }
}

const handleSignup = async () => {
  errorMessage.value = ''
  try {
    await authStore.signup(signupForm.value.name, signupForm.value.email, signupForm.value.password)
    signupForm.value = { name: '', email: '', password: '' }
    emit('login-success')
  } catch (error) {
    errorMessage.value = error
  }
}
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