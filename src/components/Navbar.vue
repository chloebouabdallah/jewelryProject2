<template>
  <nav ref="navbarRef" class="fixed w-full z-50 transition-all duration-300 backdrop-blur-md shadow-sm" :class="navbarClass">
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex justify-between items-center">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2">
        <i class="fas fa-gem text-lg md:text-xl text-[#b8926c]"></i>
        <span class="text-base md:text-xl font-semibold tracking-wide font-playfair text-[#2c2418]">SOUTOU</span>
      </router-link>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex space-x-8 text-[#4a3a2a] font-medium">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path"
          class="hover:text-amber-800 transition"
          :class="{ 'text-amber-800 border-b-2 border-amber-600 pb-1': $route.path === link.path }"
        >
          {{ link.name }}
        </router-link>
      </div>
      
      <!-- Icons -->
      <div class="flex items-center gap-3 md:gap-4">
        <!-- Search Icon - Now clickable -->
        <i @click="openSearchBar" class="fas fa-search text-base md:text-xl cursor-pointer hover:text-amber-700 transition text-[#4a3a2a]"></i>
        
        <!-- Heart / Wishlist Icon -->
        <router-link to="/wishlist" class="relative">
          <i class="far fa-heart text-base md:text-xl cursor-pointer hover:text-amber-700 transition text-[#4a3a2a]"></i>
          <span 
            v-if="wishlistStore.itemCount > 0"
            class="wishlist-badge absolute -top-2 -right-2 bg-[#b8926c] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
          >
            {{ wishlistStore.itemCount > 99 ? '99+' : wishlistStore.itemCount }}
          </span>
        </router-link>
        
        <!-- User Icon with Dropdown -->
        <div class="relative">
          <button @click="toggleUserMenu" class="focus:outline-none">
            <i class="far fa-user text-base md:text-xl cursor-pointer hover:text-amber-700 transition text-[#4a3a2a]"></i>
          </button>
          
          <!-- User Menu Dropdown -->
          <div v-if="userMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-amber-100">
            <template v-if="authStore.isAuthenticated">
              <div class="px-4 py-2 border-b border-amber-100">
                <p class="text-sm font-semibold text-stone-800">{{ authStore.currentUser?.name || authStore.currentUser?.email?.split('@')[0] }}</p>
                <p class="text-xs text-stone-500">{{ authStore.currentUser?.email }}</p>
              </div>
              
              <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-amber-50">Logout</button>
            </template>
            <template v-else>
              <button @click="handleLogin" class="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-amber-50">Login</button>
              <button @click="handleSignup" class="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-amber-50">Sign Up</button>
            </template>
          </div>
        </div>
        
        <!-- Cart Icon with Badge - Only show badge when logged in -->
        <div class="relative cursor-pointer" @click="goToCart">
          <i class="fas fa-shopping-bag text-base md:text-xl hover:text-amber-700 transition text-[#4a3a2a]"></i>
          <span 
            v-if="authStore.isAuthenticated && cartStore.itemCount > 0"
            class="cart-badge absolute -top-2 -right-2 bg-[#b8926c] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
          >
            {{ cartStore.itemCount > 99 ? '99+' : cartStore.itemCount }}
          </span>
        </div>
        
        <!-- Mobile Menu Button -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden text-xl focus:outline-none text-[#4a3a2a]">
          <i :class="mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
        </button>
      </div>
    </div>
    
    <!-- Mobile Menu -->
    <Transition name="slide-down">
      <div v-if="mobileMenuOpen" class="md:hidden bg-white/95 backdrop-blur-lg border-t border-amber-100 py-3 px-5 flex flex-col gap-2 text-[#3e2c24] font-medium shadow-lg">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path"
          class="py-2 border-b border-amber-100"
          :class="{ 'text-amber-800': $route.path === link.path }"
          @click="mobileMenuOpen = false"
        >
          {{ link.name }}
        </router-link>
        <div class="pt-2 border-t border-amber-100 mt-1">
          <template v-if="authStore.isAuthenticated">
            <div class="py-2 text-stone-600 text-sm">Hello, {{ authStore.currentUser?.name || authStore.currentUser?.email?.split('@')[0] }}</div>
            <button @click="handleLogoutMobile" class="py-2 text-red-600 w-full text-left">Logout</button>
          </template>
          <template v-else>
            <button @click="handleLoginMobile" class="py-2 w-full text-left">Login</button>
            <button @click="handleSignupMobile" class="py-2 w-full text-left">Sign Up</button>
          </template>
        </div>
      </div>
    </Transition>
  </nav>
  
  <!-- Search Bar Component -->
  <SearchBar ref="searchBarRef" />
  
  <!-- Auth Modal -->
  <AuthModal />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import SearchBar from './SearchBar.vue'
import AuthModal from './AuthModal.vue'
import { useWishlistStore } from '@/stores/wishlist'


const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()

const mobileMenuOpen = ref(false)
const isScrolled = ref(false)
const userMenuOpen = ref(false)
const searchBarRef = ref(null)

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Collections', path: '/collections' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact Us', path: '/contact' },
  { name: 'Reviews', path: '/reviews' }
]

const navbarClass = computed(() => ({
  'bg-[#f5e6d8]/98 shadow-md': isScrolled.value,
  'bg-[#f5e6d8]/95': !isScrolled.value
}))

// Search bar functions
const openSearchBar = () => {
  if (searchBarRef.value) {
    searchBarRef.value.openSearch()
  }
}

// Toggle user menu
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeUserMenu = () => {
  userMenuOpen.value = false
}

// Close user menu when clicking outside
const handleClickOutside = (event) => {
  const userButton = document.querySelector('.fa-user')?.parentElement
  const userMenu = document.querySelector('.absolute.right-0.mt-2')
  if (userMenuOpen.value && userButton && !userButton.contains(event.target) && userMenu && !userMenu.contains(event.target)) {
    userMenuOpen.value = false
  }
}

// Auth handlers
const handleLogin = () => {
  authStore.openAuthModal('login')
  userMenuOpen.value = false
}

const handleSignup = () => {
  authStore.openAuthModal('signup')
  userMenuOpen.value = false
}

const handleLogout = () => {
  authStore.logout()
  userMenuOpen.value = false
}

// Mobile auth handlers
const handleLoginMobile = () => {
  authStore.openAuthModal('login')
  mobileMenuOpen.value = false
}

const handleSignupMobile = () => {
  authStore.openAuthModal('signup')
  mobileMenuOpen.value = false
}

const handleLogoutMobile = () => {
  authStore.logout()
  mobileMenuOpen.value = false
}

const goToCart = () => {
  router.push('/cart')
}

// Scroll handler
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
  authStore.checkAuth()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease-out;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.cart-badge {
  transition: opacity 0.2s;
}
</style>