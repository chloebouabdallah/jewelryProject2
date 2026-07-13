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
    
    <!-- Footer -->
    <div ref="footerWrapper" class="footer-wrapper" :class="{ 'footer-visible': isFooterVisible }">
      <Footer />
    </div>
    
    <ToastNotification />
    <AuthModal @login-success="handleLoginSuccess" />
    <GuestModal 
      :show="showGuestModal"
      @close="showGuestModal = false"
      @success="handleGuestSuccess"
      @switch-to-login="handleSwitchToLogin"
    />
    <ChangePasswordModal 
      :show="showChangePassword"
      @close="showChangePassword = false"
      @success="handlePasswordChanged"
    />
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
import GuestModal from '@/components/GuestModal.vue'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import Chatbot from '@/components/Chatbot.vue'
import { useAuthStore } from '@/stores/auth'
import { useGuestStore } from '@/stores/guest'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const guestStore = useGuestStore()
const cartStore = useCartStore()

const isFooterVisible = ref(false)
const footerWrapper = ref(null)
const showGuestModal = ref(false)
const showChangePassword = ref(false)

const handleLoginSuccess = () => {
  const added = cartStore.addPendingAfterLogin()
  if (added) {
    console.log('Product added to cart after login')
  }
}

const handleGuestSuccess = (guestData) => {
  console.log('✅ Guest created:', guestData)
  showGuestModal.value = false
}

const handleSwitchToLogin = () => {
  showGuestModal.value = false
  authStore.openAuthModal('login')
}

const handlePasswordChanged = () => {
  console.log('✅ Password changed successfully!')
  showChangePassword.value = false
}

// Show footer after page loads and scroll to top
const showFooterAndScrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  setTimeout(() => {
    isFooterVisible.value = true
  }, 300)
}

// Watch for route changes
watch(
  () => router.currentRoute.value,
  () => {
    isFooterVisible.value = false
    setTimeout(() => {
      showFooterAndScrollTop()
    }, 500)
  },
  { immediate: true }
)

onMounted(async () => {
  await authStore.checkAuth()
  
  // Load guest from localStorage
  guestStore.loadGuestFromLocalStorage()
  
  // If guest exists, set it in cart
  if (guestStore.isGuest && guestStore.currentGuest) {
    const guestEmail = guestStore.currentGuest.email || `guest_${guestStore.currentGuest.id}`
    cartStore.setUser(guestEmail)
  }
  
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

/* Footer wrapper - hidden by default */
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