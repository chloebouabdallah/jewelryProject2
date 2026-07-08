<!-- src/views/CheckoutView.vue -->
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
      
      <!-- Loading State -->
      <div v-else-if="isLoadingData" class="text-center py-20">
        <i class="fas fa-spinner fa-spin text-4xl text-amber-600"></i>
        <p class="text-stone-500 mt-4">Loading checkout data...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
        <h2 class="text-xl font-semibold text-red-700 mb-2">Failed to Load Checkout Data</h2>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button @click="loadCheckoutData" class="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition">
          Try Again
        </button>
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
                  v-model="shippingInfo.countryId" 
                  @change="onCountryChange"
                  required
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
                  <option value="">Select Country</option>
                  <option v-for="country in countries" :key="country.id" :value="country.id">
                    {{ country.country_name }}
                  </option>
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
            
            <div v-if="paymentMethods.length === 0" class="text-center py-4 text-stone-500">
              No payment methods available
            </div>
            
            <div v-else class="space-y-3">
              <label 
                v-for="method in paymentMethods" 
                :key="method.id"
                class="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-amber-50 transition"
                :class="paymentMethod === method.id ? 'border-amber-400 bg-amber-50' : 'border-amber-200'"
              >
                <input 
                  type="radio" 
                  :value="method.id" 
                  v-model="paymentMethod" 
                  class="w-4 h-4 text-amber-600 flex-shrink-0"
                >
                <div class="flex items-center gap-3 flex-1">
                  <!-- Payment Method Icon -->
                  <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <i :class="getPaymentIcon(method)" class="text-amber-600 text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-stone-700 font-medium">{{ method.display_name || method.name }}</span>
                      <span v-if="method.is_cod" class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        <i class="fas fa-money-bill-wave mr-1"></i> Cash on Delivery
                      </span>
                      <span v-if="method.is_default" class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Recommended</span>
                    </div>
                    <p class="text-xs text-stone-500">{{ method.description || 'Select this payment method' }}</p>
                  </div>
                  <div v-if="method.fee && method.fee > 0" class="text-xs text-stone-500 flex-shrink-0">
                    +${{ method.fee.toFixed(2) }}
                  </div>
                </div>
              </label>
            </div>
            
            <!-- Selected Payment Method Details -->
            <div v-if="selectedPaymentMethod" class="mt-6 pt-4 border-t border-amber-100">
              <div class="bg-amber-50 p-4 rounded-lg">
                <div class="flex items-start gap-3">
                  <i class="fas fa-info-circle text-amber-600 mt-0.5"></i>
                  <div>
                    <p class="text-sm text-stone-700">
                      <span class="font-semibold">{{ selectedPaymentMethod.display_name || selectedPaymentMethod.name }}</span>
                      {{ selectedPaymentMethod.detailed_description || selectedPaymentMethod.description || 'Selected payment method will be processed.' }}
                    </p>
                    <p v-if="selectedPaymentMethod.is_cod" class="text-sm text-green-600 mt-1">
                      <i class="fas fa-check-circle mr-1"></i>
                      Pay in cash when your order is delivered
                    </p>
                    <p v-if="selectedPaymentMethod.fee && selectedPaymentMethod.fee > 0" class="text-sm text-stone-600 mt-1">
                      <i class="fas fa-dollar-sign text-amber-600 mr-1"></i>
                      Processing Fee: ${{ selectedPaymentMethod.fee.toFixed(2) }}
                    </p>
                  </div>
                </div>
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
                <span v-if="selectedCountry?.shipment_price">${{ selectedCountry.shipment_price.toFixed(2) }}</span>
                <span v-else>Free</span>
              </div>
              <div v-if="selectedPaymentMethod?.fee && selectedPaymentMethod.fee > 0" class="flex justify-between text-stone-600">
                <span>Payment Fee</span>
                <span>${{ selectedPaymentMethod.fee.toFixed(2) }}</span>
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
              :disabled="isProcessing || !shippingInfo.countryId || !paymentMethod"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useScrollAnimation } from '@/composables/useScrollAnimation'
import { shippingAPI, paymentAPI, checkoutAPI } from '@/services/osimart'
import emailjs from '@emailjs/browser'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
useScrollAnimation()

const isProcessing = ref(false)
const isLoadingData = ref(false)
const error = ref(null)
const paymentMethod = ref('')
const countries = ref([])
const paymentMethods = ref([])

const shippingInfo = ref({
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  countryId: '',
  phone: ''
})

const cardInfo = ref({
  number: '',
  expiry: '',
  cvv: ''
})

// Payment method icon mapping
const getPaymentIcon = (method) => {
  const iconMap = {
    'credit_card': 'fas fa-credit-card',
    'debit_card': 'fas fa-credit-card',
    'paypal': 'fab fa-paypal',
    'apple_pay': 'fab fa-apple-pay',
    'google_pay': 'fab fa-google-pay',
    'cod': 'fas fa-money-bill-wave',
    'cash_on_delivery': 'fas fa-money-bill-wave',
    'bank_transfer': 'fas fa-university',
    'cash': 'fas fa-money-bill',
    'crypto': 'fab fa-bitcoin',
  }
  
  const key = (method.code || method.name || '').toLowerCase().replace(/\s+/g, '_')
  return iconMap[key] || method.icon || 'fas fa-credit-card'
}

// Check if payment method is COD
const isCODPayment = (method) => {
  if (!method) return false
  const name = (method.name || '').toLowerCase()
  const code = (method.code || '').toLowerCase()
  return name.includes('cash') || name.includes('cod') || name.includes('delivery') ||
         code === 'cod' || code === 'cash_on_delivery' || method.is_cod === true
}

// Get selected country details
const selectedCountry = computed(() => {
  return countries.value.find(c => c.id === shippingInfo.value.countryId)
})

// Get selected payment method details
const selectedPaymentMethod = computed(() => {
  return paymentMethods.value.find(m => m.id === paymentMethod.value)
})

// Calculate total with fees
const calculateTotal = () => {
  let total = cartStore.total
  
  // Add shipping fee
  if (selectedCountry.value?.shipment_price) {
    total += selectedCountry.value.shipment_price
  }
  
  // Add payment method fee
  if (selectedPaymentMethod.value?.fee) {
    total += selectedPaymentMethod.value.fee
  }
  
  return total
}

// Handle country change
const onCountryChange = () => {
  // If country has a default payment method, auto-select it
  if (selectedCountry.value?.default_payment_method_id) {
    const defaultMethod = paymentMethods.value.find(m => m.id === selectedCountry.value.default_payment_method_id)
    if (defaultMethod) {
      paymentMethod.value = defaultMethod.id
    }
  }
}

// Load checkout data from Osimart
const loadCheckoutData = async () => {
  isLoadingData.value = true
  error.value = null
  
  try {
    // Fetch countries
    const countriesResponse = await shippingAPI.getCountries()
    console.log('✅ Countries fetched:', countriesResponse.data)
    
    let countryData = []
    if (countriesResponse.data && countriesResponse.data.results) {
      countryData = countriesResponse.data.results
    } else if (Array.isArray(countriesResponse.data)) {
      countryData = countriesResponse.data
    } else if (countriesResponse.data) {
      countryData = [countriesResponse.data]
    }
    
    countries.value = countryData.map(country => ({
      id: country.id,
      country_name: country.country_name || country.name || '',
      shipment_price: country.shipment_price || 0,
      cod_available: country.cod_available !== undefined ? country.cod_available : false,
      cod_fee: country.cod_fee || 0,
      default_payment_method_id: country.default_payment_method_id || null,
      is_active: country.is_active !== false,
    }))
    
    console.log('✅ Countries loaded:', countries.value.length)
    
    // Fetch payment methods
    const paymentResponse = await paymentAPI.getAvailablePaymentMethods()
    console.log('✅ Payment methods fetched:', paymentResponse.data)
    
    let paymentData = []
    if (paymentResponse.data && paymentResponse.data.results) {
      paymentData = paymentResponse.data.results
    } else if (Array.isArray(paymentResponse.data)) {
      paymentData = paymentResponse.data
    } else if (paymentResponse.data) {
      paymentData = [paymentResponse.data]
    }
    
    paymentMethods.value = paymentData.map(method => {
      const isCOD = isCODPayment(method)
      return {
        id: method.id,
        name: method.name || '',
        display_name: isCOD ? 'Cash on Delivery' : (method.display_name || method.name || ''),
        code: method.code || method.name?.toLowerCase().replace(/\s+/g, '_') || '',
        description: isCOD ? 'Pay in cash when your order is delivered' : (method.description || ''),
        detailed_description: isCOD ? 'You will pay in cash when your order arrives at your door.' : (method.detailed_description || method.description || ''),
        icon: method.icon || getPaymentIcon(method),
        fee: method.fee || 0,
        is_active: method.is_active !== false,
        is_default: method.is_default || false,
        is_cod: isCOD,
        config: method.config || {},
      }
    })
    
    console.log('✅ Payment methods loaded:', paymentMethods.value.length)
    console.log('📋 Payment methods:', paymentMethods.value.map(m => ({ name: m.name, display_name: m.display_name, is_cod: m.is_cod })))
    
    // Auto-select default payment method
    const defaultMethod = paymentMethods.value.find(m => m.is_default)
    if (defaultMethod) {
      paymentMethod.value = defaultMethod.id
    } else if (paymentMethods.value.length > 0) {
      paymentMethod.value = paymentMethods.value[0].id
    }
    
    // Set default country (Lebanon if available, otherwise first)
    const defaultCountry = countries.value.find(c => c.country_name === 'Lebanon') || countries.value[0]
    if (defaultCountry) {
      shippingInfo.value.countryId = defaultCountry.id
    }
    
  } catch (err) {
    console.error('❌ Failed to load checkout data:', err)
    error.value = err.message || 'Failed to load checkout data. Please try again.'
  } finally {
    isLoadingData.value = false
  }
}

// Send order notification email to store owner
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
${selectedCountry.value?.country_name || shippingInfo.value.countryId}

ORDER DETAILS:
-------------
${orderItems}

PAYMENT METHOD:
--------------
${selectedPaymentMethod.value?.display_name || selectedPaymentMethod.value?.name || paymentMethod.value}
${selectedPaymentMethod.value?.is_cod ? ' (Cash on Delivery)' : ''}

ORDER SUMMARY:
-------------
Subtotal: $${cartStore.subtotal.toLocaleString()}
Shipping: $${selectedCountry.value?.shipment_price ? selectedCountry.value.shipment_price.toFixed(2) : '0.00'}
Tax (8%): $${cartStore.tax.toFixed(2)}
${selectedPaymentMethod.value?.fee ? `Payment Fee: $${selectedPaymentMethod.value.fee.toFixed(2)}\n` : ''}
TOTAL: $${calculateTotal().toFixed(2)}

=====================================
Thank you for shopping at SOUTOU!
=====================================
    `,
    reply_to: shippingInfo.value.email
  }

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
    console.log('Order email sent successfully')
    return true
  } catch (error) {
    console.error('Failed to send order email:', error)
    return false
  }
}

// Send order confirmation email to customer
const sendCustomerConfirmationEmail = async () => {
  const orderItems = cartStore.items.map(item => 
    `${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`
  ).join('\n')

  const templateParams = {
    to_email: shippingInfo.value.email,
    customer_name: `${shippingInfo.value.firstName} ${shippingInfo.value.lastName}`,
    subject: 'Your SOUTOU Order Confirmation',
    message: `
=====================================
ORDER CONFIRMATION - SOUTOU
=====================================

Dear ${shippingInfo.value.firstName},

Thank you for your order! We're preparing your beautiful jewelry.

ORDER DETAILS:
-------------
${orderItems}

SHIPPING ADDRESS:
----------------
${shippingInfo.value.address}
${shippingInfo.value.city}, ${shippingInfo.value.postalCode}
${selectedCountry.value?.country_name || shippingInfo.value.countryId}

PAYMENT METHOD:
--------------
${selectedPaymentMethod.value?.display_name || selectedPaymentMethod.value?.name || paymentMethod.value}

ORDER SUMMARY:
-------------
Subtotal: $${cartStore.subtotal.toLocaleString()}
Shipping: $${selectedCountry.value?.shipment_price ? selectedCountry.value.shipment_price.toFixed(2) : 'Free'}
Tax (8%): $${cartStore.tax.toFixed(2)}
${selectedPaymentMethod.value?.fee ? `Payment Fee: $${selectedPaymentMethod.value.fee.toFixed(2)}\n` : ''}
TOTAL: $${calculateTotal().toFixed(2)}

Delivery: ${selectedCountry.value?.country_name ? '3-5 business days' : 'varies by location'}

=====================================
We'll notify you when your order ships!
=====================================
    `,
    reply_to: 'chloebouabdallah1@gmail.com'
  }

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
    console.log('Customer confirmation email sent')
    return true
  } catch (error) {
    console.error('Failed to send customer confirmation email:', error)
    return false
  }
}

const placeOrder = async () => {
  // Validate shipping info
  if (!shippingInfo.value.firstName || !shippingInfo.value.lastName || !shippingInfo.value.email || 
      !shippingInfo.value.address || !shippingInfo.value.city || !shippingInfo.value.postalCode || 
      !shippingInfo.value.countryId) {
    alert('Please fill in all shipping information fields.')
    return
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(shippingInfo.value.email)) {
    alert('Please enter a valid email address.')
    return
  }
  
  // Validate payment method
  if (!paymentMethod.value) {
    alert('Please select a payment method.')
    return
  }
  
  isProcessing.value = true
  
  try {
    // Build order data for Osimart API
    const orderData = {
      shipping_first_name: shippingInfo.value.firstName,
      shipping_last_name: shippingInfo.value.lastName,
      shipping_email: shippingInfo.value.email,
      shipping_address: shippingInfo.value.address,
      shipping_city: shippingInfo.value.city,
      shipping_postal_code: shippingInfo.value.postalCode,
      shipping_country_id: shippingInfo.value.countryId,
      shipping_phone: shippingInfo.value.phone || '',
      payment_method_id: paymentMethod.value,
    }
    
    // Call Osimart checkout API
    console.log('📦 Submitting order to Osimart API...')
    const checkoutResponse = await checkoutAPI.createCheckout(orderData)
    console.log('✅ Checkout response:', checkoutResponse.data)
    
    // Send notification email to store owner
    const emailSent = await sendOrderEmail()
    if (emailSent) {
      console.log('✅ Store owner notified')
    }
    
    // Send confirmation email to customer
    const customerEmailSent = await sendCustomerConfirmationEmail()
    if (customerEmailSent) {
      console.log('✅ Customer confirmation sent')
    }
    
    // Clear cart after successful order
    await cartStore.clearCart()
    
    const isCOD = selectedPaymentMethod.value?.is_cod
    const successMessage = isCOD 
      ? '🎉 Thank you for your order! You will pay cash upon delivery. A confirmation email has been sent.'
      : '🎉 Thank you for your order! Your jewelry will be shipped soon. A confirmation email has been sent.'
    
    alert(successMessage)
    router.push('/')
  } catch (error) {
    console.error('Order failed:', error)
    const errorMsg = error.response?.data?.message || error.message || 'There was an error processing your order. Please try again.'
    alert(errorMsg)
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  loadCheckoutData()
})
</script>