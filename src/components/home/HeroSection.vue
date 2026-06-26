<template>
  <section class="relative bg-[#f5e6d8] pt-14 md:pt-16 overflow-hidden">
    <div class="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] md:min-h-screen">
      
      <!-- Left Side: Osimart Images Carousel -->
      <div 
        class="relative overflow-hidden min-h-[40vh] md:min-h-screen transition-all duration-1000 ease-out"
        :class="[
          isAnimated 
            ? 'opacity-100 translate-x-0 blur-0' 
            : 'opacity-0 -translate-x-24 blur-md'
        ]"
      >
        <!-- Loading State -->
        <div v-if="bannerStore.isLoading" class="flex items-center justify-center h-full w-full bg-[#e8d9cc]">
          <i class="fas fa-spinner fa-spin text-3xl text-amber-600"></i>
        </div>

        <!-- No Banners Fallback -->
        <div v-else-if="!heroBanners || heroBanners.length === 0" class="flex items-center justify-center h-full w-full bg-[#e8d9cc]">
          <div class="text-center text-stone-500">
            <i class="fas fa-image text-4xl mb-2"></i>
            <p>No banners available</p>
          </div>
        </div>

        <!-- Banners -->
        <div v-else class="relative w-full h-full">
          <div 
            v-for="(banner, index) in heroBanners" 
            :key="banner.id || index"
            class="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
            :class="{ 'opacity-100 z-10': currentSlide === index, 'opacity-0 z-0': currentSlide !== index }"
          >
            <img 
              :src="getBannerImage(banner)" 
              :alt="getBannerTitle(banner)"
              class="w-full h-full object-cover"
              @error="(e) => { e.target.src = '/placeholder-banner.jpg'; }"
            >
          </div>
        </div>
        
        <!-- Slide Indicators -->
        <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
          <button 
            v-for="(banner, index) in heroBanners" 
            :key="banner.id || index"
            @click="currentSlide = index"
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="currentSlide === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'"
          ></button>
        </div>
      </div>
      
      <!-- Right Side: Static Image -->
      <div class="bg-gradient-to-br from-[#a67c52] to-[#8b5e3c] flex items-center justify-center p-6 md:p-12 min-h-[40vh] md:min-h-screen relative overflow-hidden">
        <!-- Animated background particles -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute w-1.5 h-1.5 bg-white/30 rounded-full top-[20%] left-[10%] animate-float-slow"></div>
          <div class="absolute w-1 h-1 bg-white/30 rounded-full top-[60%] left-[85%] animate-float-medium"></div>
          <div class="absolute w-1.5 h-1.5 bg-white/30 rounded-full top-[80%] left-[20%] animate-float-slow"></div>
          <div class="absolute w-1 h-1 bg-white/30 rounded-full top-[30%] left-[75%] animate-float-medium"></div>
          <div class="absolute w-2 h-2 bg-white/20 rounded-full top-[50%] left-[45%] animate-float-slow"></div>
        </div>
        
        <div 
          class="transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
          :class="[
            isAnimated 
              ? 'opacity-100 scale-100 rotate-0 blur-0 brightness-100' 
              : 'opacity-0 scale-75 -rotate-3 blur-lg brightness-125'
          ]"
        >
          <div class="w-full max-w-md transition-all duration-500 group">
            <div class="relative rounded-2xl overflow-hidden shadow-2xl">
              <div class="absolute -inset-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition duration-700"></div>
              <img src="/hero2.jpg" alt="Model wearing Soutou jewelry" class="relative w-full h-auto block object-cover aspect-square z-10 rounded-2xl">
            </div>
          </div>
        </div>
      </div>
      
    </div>
    
    
    <!-- CENTERED OVERLAY - Over BOTH images -->
<div v-if="currentBanner" class="absolute inset-0 flex flex-col justify-center items-center text-center z-20 pointer-events-none px-4">
  <div class="pointer-events-auto">
    
    <!-- Decorative Lines -->
    <div class="relative mb-2 md:mb-4">
      <div class="absolute top-1/2 -translate-y-1/2 -left-20 md:-left-36 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent w-20 md:w-36"></div>
      <div class="absolute top-1/2 -translate-y-1/2 -right-20 md:-right-36 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent w-20 md:w-36"></div>
      
      <!-- FETCHED TITLE - Split into lines -->
      <h1 class="font-playfair text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal leading-tight text-white drop-shadow-lg tracking-tight">
        <!-- Line 1: First word of fetched title -->
        <span class="block">{{ getBannerTitle(currentBanner).split(' ')[0] }}</span>
        <!-- Line 2: Remaining words of fetched title -->
        <span class="block">{{ getBannerTitle(currentBanner).split(' ').slice(1).join(' ') }}</span>
      </h1>
    </div>
    
    <!-- FETCHED BUTTON -->
    <router-link 
      v-if="hasButton(currentBanner)"
      :to="getButtonLink(currentBanner)" 
      class="hero-button inline-block font-inter text-xs md:text-sm tracking-[0.15em] uppercase text-white border-b border-white pb-1.5 mt-4 md:mt-5 pointer-events-auto transition-all duration-300 hover:opacity-70 hover:tracking-[0.2em] no-underline relative overflow-hidden"
    >
      {{ getButtonText(currentBanner) }} →
      <span class="absolute inset-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 hover:left-full"></span>
    </router-link>
    
  </div>
</div>
    
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useBannerStore } from '@/stores/banners'

const bannerStore = useBannerStore()
const currentSlide = ref(0)
const isAnimated = ref(false)
let interval = null

const heroBanners = computed(() => {
  return bannerStore.banners || []
})

const currentBanner = computed(() => {
  if (heroBanners.value && heroBanners.value.length > 0) {
    return heroBanners.value[currentSlide.value] || heroBanners.value[0]
  }
  return null
})

const getBannerImage = (banner) => {
  if (!banner) return '/placeholder-banner.jpg'
  return bannerStore.getBannerImage(banner)
}

const getBannerTitle = (banner) => {
  return bannerStore.getBannerTitle(banner) || 'GIRL\'S FAVORITE'
}

const getBannerSubtitle = (banner) => {
  return bannerStore.getBannerSubtitle(banner)
}

const getButtonText = (banner) => {
  return bannerStore.getButtonText(banner) || 'Shop Now'
}

const getButtonLink = (banner) => {
  return bannerStore.getButtonLink(banner) || '/collections'
}

const hasButton = (banner) => {
  return bannerStore.hasButton(banner)
}

const startCarousel = () => {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
  
  if (heroBanners.value && heroBanners.value.length > 1) {
    interval = setInterval(() => {
      currentSlide.value = (currentSlide.value + 1) % heroBanners.value.length
    }, 4000)
  }
}

watch(heroBanners, (newBanners) => {
  if (newBanners && newBanners.length > 0) {
    currentSlide.value = 0
    startCarousel()
  }
}, { immediate: true })

onMounted(async () => {
  try {
    await bannerStore.fetchBanners()
    console.log('✅ Banners loaded:', bannerStore.banners.value)
  } catch (error) {
    console.error('❌ Failed to load banners:', error)
  }
  
  setTimeout(() => {
    isAnimated.value = true
  }, 100)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
})
</script>

<style scoped>
/* Floating particles animation */
@keyframes float-slow {
  0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; }
  25% { transform: translateY(-20px) translateX(10px) scale(1.2); opacity: 0.6; }
  50% { transform: translateY(10px) translateX(-15px) scale(0.8); opacity: 0.2; }
  75% { transform: translateY(-10px) translateX(5px) scale(1.1); opacity: 0.5; }
}

@keyframes float-medium {
  0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; }
  33% { transform: translateY(-15px) translateX(8px) scale(1.3); opacity: 0.7; }
  66% { transform: translateY(8px) translateX(-10px) scale(0.7); opacity: 0.2; }
}

.animate-float-slow {
  animation: float-slow 8s infinite ease-in-out;
}

.animate-float-medium {
  animation: float-medium 6s infinite ease-in-out;
}

/* Blur utilities */
.blur-md {
  filter: blur(8px);
}
.blur-lg {
  filter: blur(12px);
}
.blur-0 {
  filter: blur(0);
}
.brightness-125 {
  filter: brightness(1.25);
}
.brightness-100 {
  filter: brightness(1);
}

/* Hero button animation */
.hero-button {
  position: relative;
  display: inline-block;
}
</style>