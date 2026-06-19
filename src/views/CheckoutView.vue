<template>
  <main class="pt-32 pb-20 px-5">
    <div class="max-w-7xl mx-auto">
      
      <!-- Page Title -->
      <div class="text-center mb-12">
        <h1 class="font-playfair text-4xl md:text-5xl font-light text-stone-800 mb-3">Checkout</h1>
        <div class="w-20 h-0.5 bg-amber-500 mx-auto rounded-full"></div>
        <p class="text-stone-600 mt-4">Complete your order to receive your beautiful jewelry</p>
      </div>
      
      <!-- Login Required for Checkout -->
      <div v-if="!authStore.isAuthenticated" class="bg-white rounded-2xl shadow-md p-8 text-center">
        <i class="fas fa-lock text-5xl text-amber-400 mb-4"></i>
        <h2 class="text-xl font-semibold text-stone-800 mb-2">Login to Checkout</h2>
        <p class="text-stone-600 mb-6">Please login or sign up to complete your purchase.</p>
        <div class="flex gap-4 justify-center">
          <button @click="authStore.openAuthModal('login')" class="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition">
            Login
          </button>
          <button @click="authStore.openAuthModal('signup')" class="border-2 border-amber-600 text-amber-600 px-6 py-2 rounded-full hover:bg-amber-600 hover:text-white transition">
            Sign Up
          </button>
        </div>
      </div>
      
      <!-- Checkout Content (when logged in) -->
      <div v-else class="flex flex-col lg:flex-row gap-10">
        
        <!-- Left Column: Checkout Form -->
        <div class="flex-1">
          <!-- Shipping Information -->
          <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h3 class="text-xl font-playfair font-semibold text-stone-800 mb-4">Shipping Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-stone-700 text-sm mb-2">First Name *</label>
                <input 
                  type="text" 
                  v-model="shippingInfo.firstName" 
                  required
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">Last Name *</label>
                <input 
                  type="text" 
                  v-model="shippingInfo.lastName" 
                  required
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
              </div>
              <div class="md:col-span-2">
                <label class="block text-stone-700 text-sm mb-2">Email Address *</label>
                <input 
                  type="email" 
                  v-model="shippingInfo.email" 
                  required
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
              </div>
              <div class="md:col-span-2">
                <label class="block text-stone-700 text-sm mb-2">Street Address *</label>
                <input 
                  type="text" 
                  v-model="shippingInfo.address" 
                  required
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">City *</label>
                <input 
                  type="text" 
                  v-model="shippingInfo.city" 
                  required
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">Postal Code *</label>
                <input 
                  type="text" 
                  v-model="shippingInfo.postalCode" 
                  required
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">Country *</label>
                <select 
                  v-model="shippingInfo.country" 
                  @change="onCountryChange"
                  required
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
                  <option value="">Select Country</option>
                  <option value="LB">Lebanon</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="FR">France</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                  <option value="JP">Japan</option>
                  <option value="CN">China</option>
                  <option value="AE">UAE</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="QA">Qatar</option>
                  <option value="KW">Kuwait</option>
                </select>
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  v-model="shippingInfo.phone" 
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
              </div>
            </div>
          </div>
          
          <!-- Payment Method -->
          <div class="bg-white rounded-2xl shadow-md p-6">
            <h3 class="text-xl font-playfair font-semibold text-stone-800 mb-4">Payment Method</h3>
            
            <div class="space-y-3">
              <!-- Card Payment (Available for all countries) -->
              <label class="flex items-center gap-3 cursor-pointer p-3 border border-amber-200 rounded-lg hover:bg-amber-50 transition">
                <input type="radio" value="credit_card" v-model="paymentMethod" class="w-4 h-4 text-amber-600">
                <i class="fas fa-credit-card text-amber-600 text-xl"></i>
                <span class="text-stone-700">Credit / Debit Card</span>
                <div class="flex gap-2 ml-auto">
                  <i class="fab fa-cc-visa text-gray-400 text-xl"></i>
                  <i class="fab fa-cc-mastercard text-gray-400 text-xl"></i>
                  <i class="fab fa-cc-amex text-gray-400 text-xl"></i>
                </div>
              </label>
              
              <!-- Cash on Delivery (Only for Lebanon) -->
              <label 
                v-if="shippingInfo.country === 'LB'" 
                class="flex items-center gap-3 cursor-pointer p-3 border border-amber-200 rounded-lg hover:bg-amber-50 transition"
              >
                <input type="radio" value="cod" v-model="paymentMethod" class="w-4 h-4 text-amber-600">
                <i class="fas fa-money-bill-wave text-amber-600 text-xl"></i>
                <span class="text-stone-700">Cash on Delivery (COD)</span>
                <span class="text-xs text-green-600 ml-auto">Available in Lebanon only</span>
              </label>
              
              <label class="flex items-center gap-3 cursor-pointer p-3 border border-amber-200 rounded-lg hover:bg-amber-50 transition">
                <input type="radio" value="paypal" v-model="paymentMethod" class="w-4 h-4 text-amber-600">
                <i class="fab fa-paypal text-amber-600 text-xl"></i>
                <span class="text-stone-700">PayPal</span>
              </label>
              
              <label class="flex items-center gap-3 cursor-pointer p-3 border border-amber-200 rounded-lg hover:bg-amber-50 transition">
                <input type="radio" value="apple_pay" v-model="paymentMethod" class="w-4 h-4 text-amber-600">
                <i class="fab fa-apple-pay text-amber-600 text-xl"></i>
                <span class="text-stone-700">Apple Pay</span>
              </label>
              
              <label class="flex items-center gap-3 cursor-pointer p-3 border border-amber-200 rounded-lg hover:bg-amber-50 transition">
                <input type="radio" value="google_pay" v-model="paymentMethod" class="w-4 h-4 text-amber-600">
                <i class="fab fa-google-pay text-amber-600 text-xl"></i>
                <span class="text-stone-700">Google Pay</span>
              </label>
            </div>
            
            <!-- Credit Card Details (shown when credit card is selected) -->
            <div v-if="paymentMethod === 'credit_card'" class="mt-6 pt-4 border-t border-amber-100">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-stone-700 text-sm mb-2">Card Number</label>
                  <input 
                    type="text" 
                    v-model="cardInfo.number" 
                    placeholder="1234 5678 9012 3456"
                    class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  >
                </div>
                <div>
                  <label class="block text-stone-700 text-sm mb-2">Expiry Date</label>
                  <input 
                    type="text" 
                    v-model="cardInfo.expiry" 
                    placeholder="MM/YY"
                    class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  >
                </div>
                <div>
                  <label class="block text-stone-700 text-sm mb-2">CVV</label>
                  <input 
                    type="text" 
                    v-model="cardInfo.cvv" 
                    placeholder="123"
                    class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  >
                </div>
              </div>
            </div>
            
            <!-- Cash on Delivery Info -->
            <div v-if="paymentMethod === 'cod'" class="mt-6 pt-4 border-t border-amber-100">
              <div class="bg-amber-50 p-4 rounded-lg">
                <p class="text-sm text-stone-700">
                  <i class="fas fa-info-circle text-amber-600 mr-2"></i>
                  You will pay in cash when your order is delivered. A delivery fee of $5 applies for COD orders within Lebanon.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        
        
        <!-- Right Column: Order Summary -->
        <div class="lg:w-96">
          <div class="bg-white rounded-2xl shadow-md p-6 sticky top-32">
            <h3 class="text-xl font-playfair font-semibold text-stone-800 mb-4">Order Summary</h3>
            
            <!-- Order Items Preview -->
            <div class="max-h-60 overflow-y-auto mb-4 space-y-2 border-b border-amber-100 pb-4">
              <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between text-sm">
                <span class="text-stone-600">{{ item.name }} x{{ item.quantity }}</span>
                <span class="text-stone-800">${{ (item.price * item.quantity).toLocaleString() }}</span>
              </div>
            </div>
            
            <div class="space-y-3 border-b border-amber-100 pb-4">
              <div class="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>${{ cartStore.subtotal.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div v-if="paymentMethod === 'cod'" class="flex justify-between text-stone-600">
                <span>COD Fee</span>
                <span>$5.00</span>
              </div>
              <div class="flex justify-between text-stone-600">
                <span>Tax (8%)</span>
                <span>${{ cartStore.tax.toFixed(2) }}</span>
              </div>
            </div>
            
            <div class="flex justify-between text-stone-800 font-bold text-lg pt-4">
              <span>Total</span>
              <span>${{ calculateTotal().toFixed(2) }}</span>
            </div>
            
            <button 
              @click="placeOrder" 
              :disabled="isProcessing"
              class="w-full mt-6 bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-full font-semibold hover:scale-[1.02] transition shadow-md disabled:opacity-50"
            >
              <span v-if="!isProcessing">Place Order</span>
              <span v-else><i class="fas fa-spinner fa-spin mr-2"></i> Processing...</span>
            </button>
            
            <p class="text-xs text-stone-500 text-center mt-4">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
        
      </div>
      
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useScrollAnimation } from '@/composables/useScrollAnimation'
import emailjs from '@emailjs/browser'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
useScrollAnimation()

// EmailJS credentials
const EMAILJS_PUBLIC_KEY = 'z5w_dazQn07KNShHA'
const EMAILJS_SERVICE_ID = 'service_823cc9l'
const EMAILJS_TEMPLATE_ID = 'template_ilcmsch'

const isProcessing = ref(false)
const paymentMethod = ref('credit_card')

const shippingInfo = ref({
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  phone: ''
})

const cardInfo = ref({
  number: '',
  expiry: '',
  cvv: ''
})

// Calculate total with COD fee if applicable
const calculateTotal = () => {
  let total = cartStore.total
  if (paymentMethod.value === 'cod') {
    total += 5
  }
  return total
}

// Handle country change - auto select card payment for non-Lebanon
const onCountryChange = () => {
  if (shippingInfo.value.country !== 'LB') {
    paymentMethod.value = 'credit_card'
  }
}

// Send order email
const sendOrderEmail = async () => {
  const orderItems = cartStore.items.map(item => 
    `${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`
  ).join('\n')

  const templateParams = {
    to_email: 'chloebouabdallah1@gmail.com',
    customer_email: shippingInfo.value.email,
    subject: `New Order from ${shippingInfo.value.firstName} ${shippingInfo.value.lastName}`,
    message: `
=====================================
NEW ORDER RECEIVED
=====================================

CUSTOMER INFORMATION:
-------------------
Name: ${shippingInfo.value.firstName} ${shippingInfo.value.lastName}
Email: ${shippingInfo.value.email}
Phone: ${shippingInfo.value.phone || 'Not provided'}

SHIPPING ADDRESS:
----------------
${shippingInfo.value.address}
${shippingInfo.value.city}, ${shippingInfo.value.postalCode}
${shippingInfo.value.country}

ORDER DETAILS:
-------------
${orderItems}

PAYMENT METHOD:
--------------
${paymentMethod.value === 'cod' ? 'Cash on Delivery (Lebanon only)' : 'Credit/Debit Card'}

ORDER SUMMARY:
-------------
Subtotal: $${cartStore.subtotal.toLocaleString()}
Shipping: Free
Tax (8%): $${cartStore.tax.toFixed(2)}
${paymentMethod.value === 'cod' ? 'COD Fee: $5.00\n' : ''}
TOTAL: $${calculateTotal().toFixed(2)}

=====================================
Thank you for shopping at SOUTOU!
=====================================
    `,
    reply_to: shippingInfo.value.email
  }

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
    console.log('Order email sent successfully')
    return true
  } catch (error) {
    console.error('Failed to send order email:', error)
    return false
  }
}

const placeOrder = async () => {
  // Validate shipping info
  if (!shippingInfo.value.firstName || !shippingInfo.value.lastName || !shippingInfo.value.email || 
      !shippingInfo.value.address || !shippingInfo.value.city || !shippingInfo.value.postalCode || 
      !shippingInfo.value.country) {
    alert('Please fill in all shipping information fields.')
    return
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(shippingInfo.value.email)) {
    alert('Please enter a valid email address.')
    return
  }
  
  // Validate credit card if selected and not COD
  if (paymentMethod.value === 'credit_card') {
    if (!cardInfo.value.number || !cardInfo.value.expiry || !cardInfo.value.cvv) {
      alert('Please enter your credit card information.')
      return
    }
    if (cardInfo.value.number.replace(/\s/g, '').length < 15) {
      alert('Please enter a valid card number.')
      return
    }
  }
  
  isProcessing.value = true
  
  try {
    const emailSent = await sendOrderEmail()
    
    if (emailSent) {
      cartStore.clearCart()
      
      const successMessage = paymentMethod.value === 'cod' 
        ? '🎉 Thank you for your order! You will pay cash upon delivery. A confirmation email has been sent.'
        : '🎉 Thank you for your order! Your jewelry will be shipped soon. A confirmation email has been sent.'
      
      alert(successMessage)
      router.push('/')
    } else {
      alert('There was an issue processing your order. Please try again or contact support.')
    }
  } catch (error) {
    console.error('Order failed:', error)
    alert('There was an error processing your order. Please try again.')
  } finally {
    isProcessing.value = false
  }
}
</script>