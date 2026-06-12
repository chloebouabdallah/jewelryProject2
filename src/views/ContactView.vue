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
            
            <button type="submit" :disabled="sending" class="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-full font-semibold hover:scale-[1.02] transition shadow-md disabled:opacity-50">
              <span v-if="!sending">Send Message <i class="fas fa-paper-plane ml-2"></i></span>
              <span v-else><i class="fas fa-spinner fa-spin mr-2"></i> Sending...</span>
            </button>
            
            <Transition name="fade">
              <p v-if="message" class="text-sm text-center mt-3" :class="messageClass">{{ message }}</p>
            </Transition>
          </form>
        </div>
        
      </div>
    </section>

    <!-- Map Section - Google Maps -->
    <section class="py-10 px-5">
      <div class="max-w-6xl mx-auto">
        <div class="rounded-2xl overflow-hidden shadow-xl">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.329292!3d48.866667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e3f0b3b4b6b%3A0x0!2zNDjCsDUyJzAwLjAiTiAywrAxOSc0NS4wIkU!5e0!3m2!1sen!2sfr!4v1700000000000!5m2!1sen!2sfr" 
            width="100%" 
            height="400" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
        <div class="text-center mt-4">
          <p class="text-stone-600 text-sm">
            <i class="fas fa-map-pin text-amber-600 mr-2"></i>
            123 Rue de la Paix, 75002 Paris, France
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useScrollAnimation } from '@/composables/useScrollAnimation'
import emailjs from '@emailjs/browser'

useScrollAnimation()

// Your EmailJS credentials
const EMAILJS_PUBLIC_KEY = 'z5w_dazQn07KNShHA'
const EMAILJS_SERVICE_ID = 'service_823cc9l'
const EMAILJS_TEMPLATE_ID = 'template_a2qx607'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const message = ref('')
const messageClass = ref('')
const sending = ref(false)

const handleSubmit = async () => {
  if (!form.value.name || !form.value.email || !form.value.message) {
    messageClass.value = 'text-red-600'
    message.value = 'Please fill in all required fields.'
    setTimeout(() => {
      message.value = ''
    }, 3000)
    return
  }

  sending.value = true

  try {
    const templateParams = {
      to_email: 'chloebouabdallah1@gmail.com',
      from_name: form.value.name,
      from_email: form.value.email,
      subject: form.value.subject || 'New Contact Form Message',
      message: form.value.message,
      reply_to: form.value.email
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID, 
      EMAILJS_TEMPLATE_ID, 
      templateParams,
      EMAILJS_PUBLIC_KEY
    )
    
    messageClass.value = 'text-green-600'
    message.value = `✨ Thank you ${form.value.name}! Your message has been sent. We'll reply within 24 hours. ✨`
    
    form.value = { name: '', email: '', subject: '', message: '' }
    
    setTimeout(() => {
      message.value = ''
    }, 5000)
  } catch (error) {
    console.error('EmailJS Error:', error)
    messageClass.value = 'text-red-600'
    message.value = error.text || 'Sorry, there was an error sending your message. Please try again later.'
    setTimeout(() => {
      message.value = ''
    }, 5000)
  } finally {
    sending.value = false
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

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>