<template>
  <div class="overflow-x-hidden">
    <Navbar />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Footer />
    <ToastNotification />
    <AuthModal @login-success="handleLoginSuccess" />
    <Chatbot />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import AuthModal from '@/components/AuthModal.vue'
import Chatbot from '@/components/Chatbot.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()
const route = useRoute()
const router = useRouter()

// ✅ Store scroll positions in a Map
const scrollPositions = new Map()

// ✅ Save current scroll position
const saveScrollPosition = () => {
  const path = route.fullPath
  scrollPositions.set(path, window.scrollY)
}

// ✅ Restore scroll position
const restoreScrollPosition = () => {
  const path = route.fullPath
  const position = scrollPositions.get(path)
  if (position !== undefined) {
    setTimeout(() => {
      window.scrollTo({
        top: position,
        behavior: 'smooth'
      })
    }, 100)
  }
}

// ✅ Save on scroll
const handleScroll = () => {
  saveScrollPosition()
}

const handleLoginSuccess = () => {
  const added = cartStore.addPendingAfterLogin()
  if (added) {
    console.log('Product added to cart after login')
  }
}

// ✅ Watch for route changes
watch(() => route.fullPath, (newPath, oldPath) => {
  if (oldPath) {
    // Save old position before leaving
    scrollPositions.set(oldPath, window.scrollY)
  }
  // Restore new position after navigation
  restoreScrollPosition()
})

// ✅ Handle browser back/forward
const handlePopState = () => {
  restoreScrollPosition()
}

onMounted(() => {
  authStore.checkAuth()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('popstate', handlePopState)
  
  // Initial restore
  setTimeout(restoreScrollPosition, 200)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('popstate', handlePopState)
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