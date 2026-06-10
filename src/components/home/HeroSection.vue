<template>
  <section class="relative bg-[#f5e6d8] pt-14 md:pt-16">
    <div class="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] md:min-h-screen">
      <!-- Hero Carousel -->
      <div class="relative overflow-hidden min-h-[40vh] md:min-h-screen">
        <div class="relative w-full h-full">
          <img 
            v-for="(image, index) in heroImages" 
            :key="index"
            :src="image.src" 
            :alt="image.alt"
            class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            :class="{ 'opacity-100': currentSlide === index, 'opacity-0': currentSlide !== index }"
          >
        </div>
      </div>
      
      <!-- Right Image -->
      <div class="bg-[#a67c52] flex items-center justify-center p-6 md:p-12 min-h-[40vh] md:min-h-screen">
        <div class="w-full max-w-md transition-all duration-500 hover:scale-[1.02]">
          <div class="w-full rounded-2xl overflow-hidden shadow-2xl">
            <img src="/hero2.jpg" alt="Model wearing Soutou jewelry" class="w-full h-auto block object-cover aspect-square">
          </div>
        </div>
      </div>

      <!-- Overlay Text -->
      <div class="absolute inset-0 flex flex-col justify-center items-center text-center z-10 pointer-events-none px-4">
        <div class="animate-fade-scale">
          <h1 class="font-playfair text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal leading-tight text-white drop-shadow-lg tracking-tight">
            GIRL'S<br>FAVORITE
          </h1>
          <router-link 
            to="/collections" 
            class="inline-block font-inter text-xs md:text-sm tracking-[0.15em] uppercase text-white border-b border-white pb-1.5 mt-4 md:mt-5 pointer-events-auto transition-all duration-300 hover:opacity-70 hover:tracking-[0.2em] no-underline"
          >
            SHOP NOW →
          </router-link>
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
let interval = null

const startCarousel = () => {
  interval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % heroImages.length
  }, 4000)
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>