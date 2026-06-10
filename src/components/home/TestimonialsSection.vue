<template>
  <section class="py-12 md:py-20 px-4 md:px-5 bg-[#f5e6d8]">
    <div class="max-w-7xl mx-auto text-center">
      <i class="fas fa-quote-left text-3xl md:text-4xl text-amber-400 mb-3 md:mb-4 fade-on-scroll fade-up"></i>
      <div class="relative overflow-hidden max-w-3xl mx-auto fade-on-scroll fade-up">
        <div 
          class="transition-all duration-500 flex"
          :style="{ transform: `translateX(-${testimonialIndex * 100}%)` }"
        >
          <div v-for="(testimonial, index) in testimonials" :key="index" class="min-w-full px-3 md:px-4">
            <p class="text-base md:text-xl lg:text-2xl font-medium text-stone-700 italic">"{{ testimonial.text }}"</p>
            <div class="mt-4 md:mt-6">
              <span class="font-bold text-stone-800 text-sm md:text-base">— {{ testimonial.author }}</span>
              <div class="flex justify-center gap-1 text-amber-500 mt-1 md:mt-2">
                <i v-for="star in 5" :key="star" class="fas fa-star text-xs md:text-sm"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-center gap-2 md:gap-3 mt-6 md:mt-8">
          <button @click="prevTestimonial" class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition">
            <i class="fas fa-chevron-left text-xs md:text-sm"></i>
          </button>
          <button @click="nextTestimonial" class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition">
            <i class="fas fa-chevron-right text-xs md:text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const testimonials = [
  { text: "SOUTOU's ring captured the exact radiance of our love story — it feels like wearing a constellation.", author: "Camille & Adrien" },
  { text: "Exquisite craftsmanship — the necklace feels like an heirloom from another era, yet so modern.", author: "Priya K." },
  { text: "I've never seen such ethereal sapphires. A true work of art — beyond my expectations.", author: "Margaret Chen" }
]

const testimonialIndex = ref(0)
let autoInterval = null

const nextTestimonial = () => {
  testimonialIndex.value = (testimonialIndex.value + 1) % testimonials.length
}

const prevTestimonial = () => {
  testimonialIndex.value = (testimonialIndex.value - 1 + testimonials.length) % testimonials.length
}

const startAutoRotate = () => {
  autoInterval = setInterval(nextTestimonial, 6000)
}

onMounted(() => {
  startAutoRotate()
})

onUnmounted(() => {
  if (autoInterval) clearInterval(autoInterval)
})
</script>