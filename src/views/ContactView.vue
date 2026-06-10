<template>
  <main>
    <!-- Hero -->
    <section class="pt-32 pb-20 px-5">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="font-playfair text-5xl md:text-7xl font-light text-stone-800 mb-4 animate-fade-scale">Let's Connect</h1>
        <div class="w-24 h-0.5 bg-amber-500 mx-auto mb-6"></div>
        <p class="text-stone-600 max-w-2xl mx-auto text-lg">We'd love to hear from you. Whether you have a question about our collections or need assistance with an order.</p>
      </div>
    </section>

    <!-- Contact Content -->
    <section class="py-10 px-5">
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        
        <!-- Left Column - Contact Info -->
        <div>
          <h2 class="font-playfair text-3xl text-stone-800 mb-6">Visit Our Atelier</h2>
          <div class="space-y-6">
            <div class="flex gap-4 items-start">
              <i class="fas fa-map-marker-alt text-2xl text-amber-600 mt-1"></i>
              <div>
                <h3 class="font-semibold text-stone-800">Address</h3>
                <p class="text-stone-600">123 Rue de la Paix<br>75002 Paris, France</p>
              </div>
            </div>
            
            <div class="flex gap-4 items-start">
              <i class="fas fa-phone text-2xl text-amber-600 mt-1"></i>
              <div>
                <h3 class="font-semibold text-stone-800">Phone</h3>
                <p class="text-stone-600">+33 (0)1 23 45 67 89</p>
              </div>
            </div>
            
            <div class="flex gap-4 items-start">
              <i class="fas fa-envelope text-2xl text-amber-600 mt-1"></i>
              <div>
                <h3 class="font-semibold text-stone-800">Email</h3>
                <p class="text-stone-600">hello@soutou.com<br>concierge@soutou.com</p>
              </div>
            </div>
            
            <div class="flex gap-4 items-start">
              <i class="fas fa-clock text-2xl text-amber-600 mt-1"></i>
              <div>
                <h3 class="font-semibold text-stone-800">Hours</h3>
                <p class="text-stone-600">Monday - Friday: 10am - 7pm<br>Saturday: 11am - 6pm<br>Sunday: Closed</p>
              </div>
            </div>
          </div>
          
          <div class="mt-10">
            <h3 class="font-semibold text-stone-800 mb-4">Follow Our Journey</h3>
            <div class="flex gap-4">
              <a href="#" class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center hover:bg-amber-200 transition">
                <i class="fab fa-instagram text-xl text-amber-700"></i>
              </a>
              <a href="#" class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center hover:bg-amber-200 transition">
                <i class="fab fa-pinterest text-xl text-amber-700"></i>
              </a>
              <a href="#" class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center hover:bg-amber-200 transition">
                <i class="fab fa-facebook-f text-xl text-amber-700"></i>
              </a>
              <a href="#" class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center hover:bg-amber-200 transition">
                <i class="fab fa-youtube text-xl text-amber-700"></i>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Right Column - Contact Form -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="font-playfair text-2xl text-stone-800 mb-6">Send Us a Message</h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-stone-700 text-sm mb-2">Name *</label>
              <input type="text" v-model="form.name" required class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none">
            </div>
            
            <div>
              <label class="block text-stone-700 text-sm mb-2">Email *</label>
              <input type="email" v-model="form.email" required class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none">
            </div>
            
            <div>
              <label class="block text-stone-700 text-sm mb-2">Subject</label>
              <input type="text" v-model="form.subject" class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none">
            </div>
            
            <div>
              <label class="block text-stone-700 text-sm mb-2">Message *</label>
              <textarea v-model="form.message" rows="5" required class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"></textarea>
            </div>
            
            <button type="submit" class="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-full font-semibold hover:scale-[1.02] transition shadow-md">
              Send Message <i class="fas fa-paper-plane ml-2"></i>
            </button>
            
            <Transition name="fade">
              <p v-if="message" class="text-sm text-center mt-3" :class="messageClass">{{ message }}</p>
            </Transition>
          </form>
        </div>
        
      </div>
    </section>

    <!-- Map Section -->
    <section class="py-10 px-5">
      <div class="max-w-6xl mx-auto">
        <div class="rounded-2xl overflow-hidden shadow-xl h-96 bg-stone-300 flex items-center justify-center">
          <p class="text-stone-500"><i class="fas fa-map"></i> Interactive Map Would Load Here</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>

import { useScrollAnimation } from '@/composables/useScrollAnimation'

useScrollAnimation()

import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const message = ref('')
const messageClass = ref('')

const handleSubmit = () => {
  if (form.value.name && form.value.email && form.value.message) {
    messageClass.value = 'text-green-600'
    message.value = `✨ Thank you ${form.value.name}! We'll reply within 24 hours. ✨`
    form.value = { name: '', email: '', subject: '', message: '' }
    setTimeout(() => {
      message.value = ''
    }, 5000)
  } else {
    messageClass.value = 'text-red-600'
    message.value = 'Please fill in all required fields.'
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

