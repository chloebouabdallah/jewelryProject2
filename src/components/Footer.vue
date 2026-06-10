<template>
  <!-- Contact Section -->
  <section id="contact" class="py-12 md:py-20 px-5 md:px-6 bg-[#a67c52] text-white relative overflow-hidden shadow-inner">
    <div class="absolute top-0 right-0 w-60 h-60 md:w-80 md:h-80 bg-amber-100/50 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-60 h-60 md:w-80 md:h-80 bg-amber-50/60 rounded-full blur-3xl"></div>
    <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
      <div class="fade-on-scroll fade-right text-center md:text-left">
        <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold font-playfair text-white">Let Light Find You</h2>
        <div class="w-16 md:w-20 h-0.5 bg-amber-500 my-4 md:my-5 mx-auto md:mx-0"></div>
        <p class="text-white text-sm md:text-base">Subscribe for exclusive previews, private sale access, and stories from the atelier.</p>
        <div class="flex gap-4 md:gap-5 mt-6 md:mt-8 justify-center md:justify-start">
          <i class="fab fa-instagram text-xl md:text-2xl text-stone-600 hover:text-amber-600 cursor-pointer transition"></i>
          <i class="fab fa-pinterest text-xl md:text-2xl text-stone-600 hover:text-amber-600 cursor-pointer transition"></i>
          <i class="fab fa-facebook-f text-xl md:text-2xl text-stone-600 hover:text-amber-600 cursor-pointer transition"></i>
        </div>
      </div>
      <div class="bg-amber-50/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-5 md:p-6 lg:p-8 shadow-lg border border-amber-100 fade-on-scroll fade-left">
        <h3 class="text-lg md:text-xl lg:text-2xl font-playfair text-stone-800 mb-3 md:mb-4">Receive the Radiance</h3>
        <form @submit.prevent="handleSubmit" class="space-y-3 md:space-y-4">
          <input 
            v-model="email"
            type="email" 
            placeholder="Email address" 
            required 
            class="w-full px-4 md:px-5 py-2.5 md:py-3 rounded-full bg-white border border-amber-200 text-stone-800 focus:ring-2 focus:ring-amber-400 focus:outline-none text-sm md:text-base"
          >
          <button type="submit" class="w-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full py-2.5 md:py-3 font-semibold text-white transition hover:scale-[1.02] text-sm md:text-base">
            Subscribe →
          </button>
          <Transition name="fade">
            <p v-if="message" class="text-xs md:text-sm text-amber-700 text-center mt-2">{{ message }}</p>
          </Transition>
        </form>
      </div>
    </div>
  </section>

  <!-- Footer Bar -->
  <footer class="bg-[#a67c52] text-white py-8 md:py-12 px-5 md:px-6 border-t border-stone-200 text-center text-sm md:text-base">
    <p>&copy; 2025 SOUTOU — Timeless Radiance</p>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const message = ref('')

const handleSubmit = () => {
  if (email.value.trim() && email.value.includes('@')) {
    message.value = '✨ Thank you! A radiant welcome awaits your inbox. ✨'
    email.value = ''
    setTimeout(() => {
      message.value = ''
    }, 4000)
  } else {
    message.value = 'Please enter a valid email address.'
    setTimeout(() => {
      message.value = ''
    }, 3000)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>