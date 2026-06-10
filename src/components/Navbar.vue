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
        <i @click="openSearchBar" class="fas fa-search text-base md:text-xl cursor-pointer hover:text-amber-700 transition text-[#4a3a2a]"></i>
        <i class="far fa-heart text-base md:text-xl cursor-pointer hover:text-amber-700 transition text-[#4a3a2a]"></i>
        <i class="far fa-user text-base md:text-xl cursor-pointer hover:text-amber-700 transition text-[#4a3a2a]"></i>
        <div class="relative cursor-pointer" @click="goToCart">
          <i class="fas fa-shopping-bag text-base md:text-xl hover:text-amber-700 transition text-[#4a3a2a]"></i>
          <span 
            class="cart-badge absolute -top-2 -right-2 bg-[#b8926c] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-opacity"
            :class="{ 'opacity-100': cartStore.itemCount > 0, 'opacity-0': cartStore.itemCount === 0 }"
          >
            {{ cartStore.itemCount }}
          </span>
        </div>
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
      </div>
    </Transition>
  </nav>
  
  <!-- Search Bar Component -->
  <SearchBar ref="searchBarRef" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import SearchBar from './SearchBar.vue'

const router = useRouter()
const cartStore = useCartStore()

const mobileMenuOpen = ref(false)
const isScrolled = ref(false)
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

const goToCart = () => {
  router.push('/cart')
}

const openSearchBar = () => {
  if (searchBarRef.value) {
    searchBarRef.value.openSearch()
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
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
</style>