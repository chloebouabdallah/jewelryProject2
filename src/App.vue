<template>
  <div class="overflow-x-hidden">
    <Navbar />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <!-- ✅ Add a wrapper with opacity control -->
    <div :class="{ 'opacity-0': !isContentReady, 'opacity-100 transition-opacity duration-700': isContentReady }">
      <Footer />
    </div>
    <ToastNotification />
    <AuthModal @login-success="handleLoginSuccess" />
    <Chatbot />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import AuthModal from '@/components/AuthModal.vue'
import Chatbot from '@/components/Chatbot.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()

// ✅ Control when content is ready
const isContentReady = ref(false)

const handleLoginSuccess = () => {
  const added = cartStore.addPendingAfterLogin()
  if (added) {
    console.log('Product added to cart after login')
  }
}

onMounted(() => {
  authStore.checkAuth()
  
  // ✅ Wait for the hero animation to complete before showing footer
  // Hero animation in HomeView takes about 0.8-1.2 seconds
  setTimeout(() => {
    isContentReady.value = true
  }, 1200)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>