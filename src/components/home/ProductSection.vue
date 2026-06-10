<template>
  <section class="py-12 md:py-20 px-4 md:px-5 bg-[#f5e6d8]">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-8 md:mb-12 fade-on-scroll fade-up">
        <span class="text-amber-700 tracking-widest text-[10px] md:text-sm uppercase font-semibold">our curated edit</span>
        <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold font-playfair mt-2 text-stone-800">Bestselling Treasures</h2>
        <div class="w-16 md:w-20 h-0.5 bg-amber-400 mx-auto mt-2 md:mt-3 rounded-full"></div>
        <p class="text-stone-500 text-xs md:text-sm mt-2 md:mt-3">✨ Infinite circular rotation ✨</p>
      </div>
      
      <div class="relative overflow-hidden px-2 md:px-4 py-4 md:py-6">
        <div 
          ref="trackRef"
          class="flex gap-4 md:gap-6 transition-all duration-700 ease-in-out"
          :style="{ transform: `translateX(-${currentTranslateX}px)` }"
        >
          <div 
            v-for="product in infiniteProducts" 
            :key="product.id"
            class="group w-[170px] sm:w-[200px] md:w-[220px] lg:w-[230px] flex-shrink-0"
          >
            <router-link :to="`/product/${product.id}`" class="block bg-white rounded-xl overflow-hidden shadow-md transition-all duration-400 hover:shadow-2xl hover:-translate-y-3">
              <div class="relative overflow-hidden h-44 sm:h-52 bg-[#e8d9cc]">
                <img :src="product.img" :alt="product.name" class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110">
                <div v-if="product.badge" class="absolute top-2 right-2 bg-amber-100/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[8px] font-semibold text-amber-800">
                  {{ product.badge }}
                </div>
              </div>
              <div class="p-2 md:p-3 text-center">
                <h3 class="font-playfair font-semibold text-stone-800 text-xs sm:text-sm">{{ product.name }}</h3>
                <p class="text-stone-500 text-[10px] sm:text-xs mt-0.5">{{ product.type }}</p>
                <div class="flex justify-center items-center gap-1 sm:gap-2 mt-1">
                  <span class="text-amber-700 font-bold text-xs sm:text-sm">${{ product.price }}</span>
                  <span v-if="product.oldPrice" class="text-stone-400 text-[8px] sm:text-xs line-through">${{ product.oldPrice }}</span>
                </div>
                <button class="mt-2 w-full py-1 rounded-full border border-amber-300 text-amber-700 text-[10px] sm:text-xs font-semibold hover:bg-amber-600 hover:text-white transition">
                  Quick Shop
                </button>
              </div>
            </router-link>
          </div>
        </div>
        
        <button @click="slidePrev" class="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10">
          <i class="fas fa-chevron-left text-amber-700 text-sm md:text-base"></i>
        </button>
        <button @click="slideNext" class="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10">
          <i class="fas fa-chevron-right text-amber-700 text-sm md:text-base"></i>
        </button>
        
        <div class="flex justify-center gap-1 md:gap-2 mt-4 md:mt-8">
          <button 
            v-for="(_, index) in products" 
            :key="index"
            @click="goToSlide(index)"
            class="rounded-full transition-all duration-300"
            :class="activeDotIndex === index ? 'bg-amber-600 w-4 md:w-6 h-1.5 md:h-2' : 'bg-amber-300 hover:bg-amber-400 w-1.5 md:w-2 h-1.5 md:h-2'"
          ></button>
        </div>
      </div>
      
      <div class="text-center mt-6 md:mt-8 fade-on-scroll fade-up">
        <router-link to="/collections" class="inline-flex items-center gap-2 text-amber-700 font-semibold text-xs md:text-sm tracking-wider uppercase border-b border-amber-400 pb-1 hover:gap-3 transition-all duration-300">
          See All Products <i class="fas fa-arrow-right text-xs"></i>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const products = [
  { id: 1, img: "/necklace2.webp", name: "Celestial Diamond Necklace", type: "Necklace", price: "3850", oldPrice: "4800", badge: "Best Seller" },
  { id: 101, img: "/earring1.avif", name: "Gold Earrings", type: "Earrings", price: "5290", oldPrice: null, badge: "Best Seller" },
  { id: 201, img: "/ring1.jpg", name: "Silver Diamond Ring", type: "Ring", price: "2975", oldPrice: null, badge: "Best Seller" },
  { id: 301, img: "/bracelet1.webp", name: "Silver Diamond Bracelet", type: "Bracelet", price: "299", oldPrice: "450", badge: "Best Seller" },
  { id: 202, img: "/ring2.webp", name: "Rose Gold Morganite Ring", type: "Ring", price: "1590", oldPrice: "2200", badge: "New" },
  { id: 302, img: "/bracelet2.jpg", name: "Gold Diamond Tennis Bracelet", type: "Bracelet", price: "2890", oldPrice: "3800", badge: "New" }
]

const infiniteProducts = computed(() => [...products, ...products, ...products])
const trackRef = ref(null)
const currentIndex = ref(products.length)
const currentTranslateX = ref(0)
let autoRotateInterval = null
let cardWidth = 220

const activeDotIndex = computed(() => currentIndex.value % products.length)

const updateTranslateX = () => {
  const gap = 16
  const cardWidthActual = document.querySelector('.group')?.offsetWidth || 220
  cardWidth = cardWidthActual
  currentTranslateX.value = currentIndex.value * (cardWidth + gap)
}

const slideNext = () => {
  const gap = 16
  currentIndex.value++
  currentTranslateX.value = currentIndex.value * (cardWidth + gap)
  
  setTimeout(() => {
    if (currentIndex.value >= products.length * 2) {
      if (trackRef.value) trackRef.value.style.transition = 'none'
      const resetIndex = currentIndex.value - products.length
      currentIndex.value = resetIndex
      currentTranslateX.value = currentIndex.value * (cardWidth + gap)
      if (trackRef.value) {
        trackRef.value.offsetHeight
        trackRef.value.style.transition = 'transform 0.7s ease-in-out'
      }
    }
  }, 700)
}

const slidePrev = () => {
  const gap = 16
  currentIndex.value--
  currentTranslateX.value = currentIndex.value * (cardWidth + gap)
  
  setTimeout(() => {
    if (currentIndex.value < products.length) {
      if (trackRef.value) trackRef.value.style.transition = 'none'
      const resetIndex = currentIndex.value + products.length
      currentIndex.value = resetIndex
      currentTranslateX.value = currentIndex.value * (cardWidth + gap)
      if (trackRef.value) {
        trackRef.value.offsetHeight
        trackRef.value.style.transition = 'transform 0.7s ease-in-out'
      }
    }
  }, 700)
}

const goToSlide = (index) => {
  const gap = 16
  const targetIndex = ((currentIndex.value - (currentIndex.value % products.length)) + index)
  currentIndex.value = targetIndex
  currentTranslateX.value = currentIndex.value * (cardWidth + gap)
}

const startAutoRotate = () => {
  autoRotateInterval = setInterval(slideNext, 4000)
}

const stopAutoRotate = () => {
  if (autoRotateInterval) clearInterval(autoRotateInterval)
}

onMounted(() => {
  setTimeout(() => {
    updateTranslateX()
  }, 100)
  startAutoRotate()
  window.addEventListener('resize', () => {
    updateTranslateX()
  })
})

onUnmounted(() => {
  stopAutoRotate()
  window.removeEventListener('resize', updateTranslateX)
})
</script>