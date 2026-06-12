<template>
  <section class="relative bg-[#f5e6d8] pt-14 md:pt-16 overflow-hidden">
    <div class="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] md:min-h-screen">
      
      <!-- Hero Carousel - Animates second with 3D effect -->
      <div 
        class="relative overflow-hidden min-h-[40vh] md:min-h-screen transition-all duration-1000 ease-out"
        :class="[
          isAnimated 
            ? 'opacity-100 translate-x-0 blur-0' 
            : 'opacity-0 -translate-x-24 blur-md'
        ]"
      >
        <div class="relative w-full h-full">
          <img 
            v-for="(image, index) in heroImages" 
            :key="index"
            :src="image.src" 
            :alt="image.alt"
            class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            :class="{ 'opacity-100': currentSlide === index, 'opacity-0': currentSlide !== index }"
          >
          <div class="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
        </div>
      </div>
      
      <!-- Right Image - Background stays, image animates with creative effects -->
      <div class="bg-gradient-to-br from-[#a67c52] to-[#8b5e3c] flex items-center justify-center p-6 md:p-12 min-h-[40vh] md:min-h-screen relative overflow-hidden">
        <!-- Animated background particles using Tailwind animation -->
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

      <!-- Overlay Text - Animates third with cinematic reveal -->
      <div class="absolute inset-0 flex flex-col justify-center items-center text-center z-20 pointer-events-none px-4">
        <div 
          class="transition-all duration-800 ease-[cubic-bezier(0.4,0,0.2,1)] delay-[300ms]"
          :class="[isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-95']"
        >
          <div 
            class="transition-all duration-800 ease-[cubic-bezier(0.4,0,0.2,1)] delay-[500ms]"
            :class="[isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16']"
          >
            <!-- Decorative lines -->
            <div class="relative">
              <div 
                class="absolute top-1/2 -translate-y-1/2 -left-20 md:-left-36 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transition-all duration-800 delay-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                :class="[isAnimated ? 'w-20 md:w-36' : 'w-0']"
              ></div>
              <div 
                class="absolute top-1/2 -translate-y-1/2 -right-20 md:-right-36 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transition-all duration-800 delay-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                :class="[isAnimated ? 'w-20 md:w-36' : 'w-0']"
              ></div>
              
              <h1 class="font-playfair text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal leading-tight text-white drop-shadow-lg tracking-tight">
                <span 
                  class="inline-block transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] delay-[600ms]"
                  :class="[isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
                >GIRL'S</span><br>
                <span 
                  class="inline-block transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] delay-[750ms]"
                  :class="[isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
                >FAVORITE</span>
              </h1>
            </div>
            
            <div 
              class="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] delay-[900ms]"
              :class="[isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']"
            >
              <router-link 
                to="/collections" 
                class="hero-button inline-block font-inter text-xs md:text-sm tracking-[0.15em] uppercase text-white border-b border-white pb-1.5 mt-4 md:mt-5 pointer-events-auto transition-all duration-300 hover:opacity-70 hover:tracking-[0.2em] no-underline relative overflow-hidden"
              >
                SHOP NOW →
                <span class="absolute inset-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 hover:left-full"></span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const heroImages = [
  { src: '/hero1.webp', alt: 'Hero model 1' },
  { src: '/hero5.jpg', alt: 'Hero model 2' },
  { src: '/hero4.jpg', alt: 'Hero model 3' }
]

const currentSlide = ref(0)
const isAnimated = ref(false)
let interval = null

const startCarousel = () => {
  interval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % heroImages.length
  }, 4000)
}

onMounted(() => {
  setTimeout(() => {
    isAnimated.value = true
  }, 100)
  startCarousel()
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style>
/* Custom animations - Tailwind doesn't have these by default */
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
</style>