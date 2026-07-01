<!-- src/App.vue -->
<template>
  <div class="overflow-x-hidden">
    <Navbar />
    
    <!-- Main Content -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- ✅ Footer - Controlled visibility -->
    <div ref="footerWrapper" class="footer-wrapper" :class="{ 'footer-visible': isFooterVisible }">
      <Footer />
    </div>
    
    <ToastNotification />
    <AuthModal @login-success="handleLoginSuccess" />
    <Chatbot />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import AuthModal from '@/components/AuthModal.vue'
import Chatbot from '@/components/Chatbot.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const isFooterVisible = ref(false)
const footerWrapper = ref(null)

const handleLoginSuccess = () => {
  const added = cartStore.addPendingAfterLogin()
  if (added) {
    console.log('Product added to cart after login')
  }
}

// ✅ Show footer after page loads and scroll to top
const showFooterAndScrollTop = () => {
  // First scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' })
  
  // Then show footer after a small delay
  setTimeout(() => {
    isFooterVisible.value = true
  }, 300)
}

// ✅ Watch for route changes
watch(
  () => router.currentRoute.value,
  () => {
    // Hide footer immediately on route change
    isFooterVisible.value = false
    
    // Show footer and scroll top after page loads
    setTimeout(() => {
      showFooterAndScrollTop()
    }, 500)
  },
  { immediate: true }
)

onMounted(() => {
  authStore.checkAuth()
  
  // Initial load
  setTimeout(() => {
    showFooterAndScrollTop()
  }, 800)
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

/* ✅ Footer wrapper - hidden by default */
.footer-wrapper {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.footer-wrapper.footer-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>