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
      
      <!-- Back to Cart Link -->
      <div class="mb-6">
        <router-link to="/cart" class="text-amber-600 hover:text-amber-700 transition">
          <i class="fas fa-arrow-left mr-2"></i> Back to Cart
        </router-link>
      </div>
      
      <!-- Logged In Notice -->
      <div v-if="authStore.isAuthenticated" class="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
        <p class="text-green-700">
          <i class="fas fa-check-circle mr-2"></i>
          Logged in as <span class="font-semibold">{{ authStore.currentUser?.email }}</span>
          - Contact information auto-filled from your account.
        </p>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoadingData" class="text-center py-20">
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
      
      <!-- Checkout Content -->
      <div v-else class="flex flex-col lg:flex-row gap-10">
        
        <!-- Left Column: Checkout Form -->
        <div class="flex-1">
          
          <!-- Contact Information -->
          <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h3 class="text-xl font-playfair font-semibold text-stone-800 mb-4">Contact Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-stone-700 text-sm mb-2">First Name *</label>
                <input 
                  type="text" 
                  v-model="checkoutForm.firstName" 
                  required
                  :disabled="authStore.isAuthenticated"
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  :class="{ 'bg-stone-50 text-stone-500 cursor-not-allowed': authStore.isAuthenticated }"
                  placeholder="First name"
                >
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">Last Name *</label>
                <input 
                  type="text" 
                  v-model="checkoutForm.lastName" 
                  required
                  :disabled="authStore.isAuthenticated"
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  :class="{ 'bg-stone-50 text-stone-500 cursor-not-allowed': authStore.isAuthenticated }"
                  placeholder="Last name"
                >
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">Email *</label>
                <input 
                  type="email" 
                  v-model="checkoutForm.email" 
                  required
                  :disabled="authStore.isAuthenticated"
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  :class="{ 'bg-stone-50 text-stone-500 cursor-not-allowed': authStore.isAuthenticated }"
                  placeholder="your@email.com"
                >
              </div>
            </div>
            
            <!-- Phone Number - Required -->
            <div class="mt-4">
              <label class="block text-stone-700 text-sm mb-2">Phone Number *</label>
              <div class="flex gap-2">
                <select 
                  v-model="checkoutForm.countryCode" 
                  :disabled="authStore.isAuthenticated"
                  class="w-24 px-2 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  :class="{ 'bg-stone-50 text-stone-500 cursor-not-allowed': authStore.isAuthenticated }"
                >
                  <option value="+961">+961</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+33">+33</option>
                  <option value="+971">+971</option>
                  <option value="+966">+966</option>
                  <option value="+20">+20</option>
                  <option value="+90">+90</option>
                  <option value="+972">+972</option>
                </select>
                <input 
                  type="tel" 
                  v-model="checkoutForm.phone" 
                  required
                  :disabled="authStore.isAuthenticated"
                  class="flex-1 px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  :class="{ 'bg-stone-50 text-stone-500 cursor-not-allowed': authStore.isAuthenticated }"
                  placeholder="Phone number"
                >
              </div>
            </div>
            
            <!-- Newsletter Signup -->
            <div class="mt-4 pt-4 border-t border-amber-100">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="checkoutForm.newsletter" class="w-4 h-4 text-amber-600 rounded">
                <span class="text-sm text-stone-600">Sign up for exclusive discounts and updates via email. Unsubscribe anytime.</span>
              </label>
            </div>
          </div>
          
          <!-- Delivery Address -->
          <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-playfair font-semibold text-stone-800">Delivery Address</h3>
              <button 
                v-if="!authStore.isAuthenticated"
                @click="handleLoginRedirect"
                class="text-sm text-amber-600 hover:text-amber-700 hover:underline transition"
              >
                Already have an address? log in
              </button>
              <span v-else class="text-sm text-green-600">
                <i class="fas fa-check-circle mr-1"></i> Address from your account
              </span>
            </div>
            
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-stone-700 text-sm mb-2">Country *</label>
                <select 
                  v-model="checkoutForm.countryId" 
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
                <label class="block text-stone-700 text-sm mb-2">Address *</label>
                <input 
                  type="text" 
                  v-model="checkoutForm.address" 
                  required
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  placeholder="Street address"
                >
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">Post Code / Zip Code *</label>
                <input 
                  type="text" 
                  v-model="checkoutForm.postalCode" 
                  required
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  placeholder="Postal / Zip code"
                >
              </div>
            </div>
          </div>
          
          <!-- Select Payment Method -->
          <div class="bg-white rounded-2xl shadow-md p-6">
            <h3 class="text-xl font-playfair font-semibold text-stone-800 mb-4">Select Payment Method</h3>
            
            <div v-if="paymentMethods.length === 0" class="text-center py-4 text-stone-500">
              No payment methods available
            </div>
            
            <div v-else class="space-y-3">
              <label 
                v-for="method in paymentMethods" 
                :key="method.id"
                class="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-amber-50 transition"
                :class="checkoutForm.paymentMethod === method.id ? 'border-amber-400 bg-amber-50' : 'border-amber-200'"
              >
                <input 
                  type="radio" 
                  :value="method.id" 
                  v-model="checkoutForm.paymentMethod" 
                  class="w-4 h-4 text-amber-600 flex-shrink-0"
                >
                <div class="flex items-center gap-3 flex-1">
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
          </div>
        </div>
        
        <!-- Right Column: Order Summary -->
        <div class="lg:w-96">
          <div class="bg-white rounded-2xl shadow-md p-6 sticky top-32">
            <h3 class="text-xl font-playfair font-semibold text-stone-800 mb-4">Order Summary</h3>
            
            <!-- Order Items -->
            <div class="max-h-60 overflow-y-auto mb-4 space-y-2 border-b border-amber-100 pb-4">
              <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between text-sm">
                <span class="text-stone-600">{{ item.quantity }} x {{ item.name }}</span>
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
              <span>Order Total</span>
              <span>${{ calculateTotal().toFixed(2) }}</span>
            </div>
            
            <!-- Complete Order Button -->
            <button 
              @click="placeOrder" 
              :disabled="isProcessing || !isFormValid || cartStore.items.length === 0"
              class="w-full mt-6 bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-full font-semibold hover:scale-[1.02] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isProcessing">Complete Order</span>
              <span v-else><i class="fas fa-spinner fa-spin mr-2"></i> Processing...</span>
            </button>
            
            <p class="text-xs text-stone-500 text-center mt-4">
              By signing up or placing an order, you're consenting to our privacy policy.
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
import { shippingAPI, paymentAPI, checkoutAPI, osimartApi, getAccessToken } from '@/services/osimart'
import emailjs from '@emailjs/browser'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
useScrollAnimation()

const isProcessing = ref(false)
const isLoadingData = ref(false)
const error = ref(null)
const countries = ref([])
const paymentMethods = ref([])

// Checkout Form
const checkoutForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  postalCode: '',
  countryId: '',
  phone: '',
  countryCode: '+961',
  paymentMethod: '',
  newsletter: false
})

// Form validation
const isFormValid = computed(() => {
  const form = checkoutForm.value
  return form.firstName && 
         form.lastName && 
         form.email && 
         form.address && 
         form.postalCode && 
         form.countryId && 
         form.phone && 
         form.paymentMethod
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
  return countries.value.find(c => c.id === checkoutForm.value.countryId)
})

// Get selected payment method details
const selectedPaymentMethod = computed(() => {
  return paymentMethods.value.find(m => m.id === checkoutForm.value.paymentMethod)
})

// Calculate total with fees
const calculateTotal = () => {
  let total = cartStore.total
  
  if (selectedCountry.value?.shipment_price) {
    total += selectedCountry.value.shipment_price
  }
  
  if (selectedPaymentMethod.value?.fee) {
    total += selectedPaymentMethod.value.fee
  }
  
  return total
}

// Handle country change
const onCountryChange = () => {
  if (selectedCountry.value?.default_payment_method_id) {
    const defaultMethod = paymentMethods.value.find(m => m.id === selectedCountry.value.default_payment_method_id)
    if (defaultMethod) {
      checkoutForm.value.paymentMethod = defaultMethod.id
    }
  }
}

// Handle Login Redirect
const handleLoginRedirect = () => {
  authStore.openAuthModal('login')
}

// ✅ Get token from multiple sources
const getToken = () => {
  // Try from osimart's getAccessToken first
  let token = getAccessToken()
  
  // If not in memory, try from auth store
  if (!token && authStore.token) {
    token = authStore.token
  }
  
  // If still no token, try from localStorage
  if (!token) {
    try {
      const authData = localStorage.getItem('soutou_auth')
      if (authData) {
        const parsed = JSON.parse(authData)
        token = parsed.token || parsed.access_token || null
        console.log('🔑 Token loaded from localStorage:', !!token)
      }
    } catch (e) {
      console.warn('Failed to get token from localStorage:', e)
    }
  }
  
  return token
}

// ✅ Fetch user profile from Osimart API to get complete user data
const fetchUserProfile = async () => {
  if (!authStore.isAuthenticated) {
    console.log('⚠️ User not authenticated, skipping profile fetch')
    return null
  }
  
  try {
    console.log('👤 Fetching user profile from Osimart API...')
    
    const token = getToken()
    
    if (!token) {
      console.warn('⚠️ No token available, cannot fetch profile')
      return null
    }
    
    console.log('🔑 Token available:', !!token)
    
    const response = await osimartApi.get('/customer-info/', {
      params: { store: '92ea209b-b32c-448e-85af-7296eb8eea00' },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('✅ Profile response:', response.data)
    return response.data
    
  } catch (err) {
    console.error('❌ Failed to fetch user profile:', err)
    console.error('❌ Error details:', err.response?.status, err.response?.data)
    return null
  }
}

// ✅ Auto-fill ONLY contact information (NOT address)
const autoFillUserData = async () => {
  if (!authStore.isAuthenticated || !authStore.currentUser) {
    console.log('⚠️ User not authenticated, skipping auto-fill')
    return
  }
  
  const user = authStore.currentUser
  console.log('📝 User data from auth store:', user)
  
  // ✅ First, fill from auth store data
  checkoutForm.value.firstName = user.firstName || user.name?.split(' ')[0] || user.first_name || ''
  checkoutForm.value.lastName = user.lastName || user.name?.split(' ').slice(1).join(' ') || user.last_name || ''
  checkoutForm.value.email = user.email || ''
  checkoutForm.value.phone = user.phone || user.mobile || user.mobile_number || ''
  
  console.log('📝 Contact info filled from auth store:', {
    firstName: checkoutForm.value.firstName,
    lastName: checkoutForm.value.lastName,
    email: checkoutForm.value.email,
    phone: checkoutForm.value.phone
  })
  
  // ✅ Try to fetch from profile API to get complete/updated data
  try {
    console.log('🔄 Fetching profile for complete user data...')
    const profileData = await fetchUserProfile()
    
    if (profileData) {
      const profile = profileData.user || profileData
      console.log('📝 Profile data:', profile)
      
      // ✅ Extract all fields from profile
      const firstName = profile.first_name || profile.firstName || ''
      const lastName = profile.last_name || profile.lastName || ''
      const email = profile.email || ''
      const phone = profile.phone || profile.mobile || profile.mobile_number || profile.phone_number || ''
      
      // ✅ Update form with profile data (overrides auth store if available)
      if (firstName) checkoutForm.value.firstName = firstName
      if (lastName) checkoutForm.value.lastName = lastName
      if (email) checkoutForm.value.email = email
      if (phone) checkoutForm.value.phone = phone
      
      console.log('✅ Contact info updated from profile:', {
        firstName: checkoutForm.value.firstName,
        lastName: checkoutForm.value.lastName,
        email: checkoutForm.value.email,
        phone: checkoutForm.value.phone
      })
    } else {
      console.log('⚠️ No profile data received, keeping auth store data')
    }
  } catch (err) {
    console.error('❌ Failed to fetch profile for user data:', err)
  }
  
  // ✅ DO NOT fill address fields - user must fill them manually
  console.log('✅ Address fields remain empty for user to fill')
}

// Load checkout data
const loadCheckoutData = async () => {
  isLoadingData.value = true
  error.value = null
  
  try {
    // Fetch countries
    const countriesResponse = await shippingAPI.getCountries()
    
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
    
    // Fetch payment methods
    const paymentResponse = await paymentAPI.getAvailablePaymentMethods()
    
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
    
    // Auto-select default payment method
    const defaultMethod = paymentMethods.value.find(m => m.is_default)
    if (defaultMethod) {
      checkoutForm.value.paymentMethod = defaultMethod.id
    } else if (paymentMethods.value.length > 0) {
      checkoutForm.value.paymentMethod = paymentMethods.value[0].id
    }
    
    // Set default country
    const defaultCountry = countries.value.find(c => c.country_name === 'Lebanon') || countries.value[0]
    if (defaultCountry) {
      checkoutForm.value.countryId = defaultCountry.id
    }
    
    // ✅ Auto-fill user data from auth store if logged in
    if (authStore.isAuthenticated) {
      await autoFillUserData()
    }
    
  } catch (err) {
    console.error('❌ Failed to load checkout data:', err)
    error.value = err.message || 'Failed to load checkout data. Please try again.'
  } finally {
    isLoadingData.value = false
  }
}

// Send order emails
const sendOrderEmail = async () => {
  const orderItems = cartStore.items.map(item => 
    `${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`
  ).join('\n')

  const templateParams = {
    to_email: 'chloebouabdallah1@gmail.com',
    customer_email: checkoutForm.value.email,
    subject: `New Order from ${checkoutForm.value.firstName} ${checkoutForm.value.lastName}`,
    message: `
=====================================
NEW ORDER RECEIVED
=====================================

CUSTOMER INFORMATION:
-------------------
Name: ${checkoutForm.value.firstName} ${checkoutForm.value.lastName}
Email: ${checkoutForm.value.email}
Phone: ${checkoutForm.value.countryCode || ''} ${checkoutForm.value.phone || 'Not provided'}

SHIPPING ADDRESS:
----------------
${checkoutForm.value.address}
${selectedCountry.value?.country_name || checkoutForm.value.countryId}
Post Code: ${checkoutForm.value.postalCode}

ORDER DETAILS:
-------------
${orderItems}

PAYMENT METHOD:
--------------
${selectedPaymentMethod.value?.display_name || selectedPaymentMethod.value?.name || checkoutForm.value.paymentMethod}
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
    reply_to: checkoutForm.value.email
  }

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
    return true
  } catch (error) {
    console.error('Failed to send order email:', error)
    return false
  }
}

const sendCustomerConfirmationEmail = async () => {
  const orderItems = cartStore.items.map(item => 
    `${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`
  ).join('\n')

  const templateParams = {
    to_email: checkoutForm.value.email,
    customer_name: `${checkoutForm.value.firstName} ${checkoutForm.value.lastName}`,
    subject: 'Your SOUTOU Order Confirmation',
    message: `
=====================================
ORDER CONFIRMATION - SOUTOU
=====================================

Dear ${checkoutForm.value.firstName},

Thank you for your order! We're preparing your beautiful jewelry.

ORDER DETAILS:
-------------
${orderItems}

SHIPPING ADDRESS:
----------------
${checkoutForm.value.address}
${selectedCountry.value?.country_name || checkoutForm.value.countryId}
Post Code: ${checkoutForm.value.postalCode}

PAYMENT METHOD:
--------------
${selectedPaymentMethod.value?.display_name || selectedPaymentMethod.value?.name || checkoutForm.value.paymentMethod}

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
    return true
  } catch (error) {
    console.error('Failed to send customer confirmation email:', error)
    return false
  }
}

// Place Order
const placeOrder = async () => {
  if (!isFormValid.value) {
    alert('Please fill in all required fields.')
    return
  }

  if (cartStore.items.length === 0) {
    alert('Your cart is empty.')
    return
  }

  isProcessing.value = true
  
  try {
    // ✅ STEP 1: Add all items to server cart first
    console.log('🔄 Adding items to server cart...')
    
    for (const item of cartStore.items) {
      const variantId = item.variant_id || item.id
      try {
        await cartAPI.addItem(variantId, item.quantity)
        console.log(`✅ Added ${item.name} x${item.quantity} to server cart`)
      } catch (err) {
        console.warn(`⚠️ Failed to add ${item.name}:`, err)
        // Continue with other items
      }
    }
    
    // ✅ STEP 2: Wait a moment for server to process
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // ✅ STEP 3: Sync cart to get server's version
    await cartStore.syncWithApi()
    
    // ✅ STEP 4: Now checkout with the server cart
    const orderData = {
      first_name: checkoutForm.value.firstName,
      last_name: checkoutForm.value.lastName,
      email: checkoutForm.value.email,
      address: checkoutForm.value.address,
      postal_code: checkoutForm.value.postalCode,
      country_id: checkoutForm.value.countryId,
      phone: checkoutForm.value.phone || '',
      phone_code: checkoutForm.value.countryCode || '+961',
      payment_method_id: checkoutForm.value.paymentMethod,
      subscribe_newsletter: checkoutForm.value.newsletter || false,
    }
    
    console.log('📦 Sending order to Osimart:', orderData)
    
    const checkoutResponse = await checkoutAPI.createCheckout(orderData)
    console.log('✅ Checkout response:', checkoutResponse.data)
    
    await sendOrderEmail()
    await sendCustomerConfirmationEmail()
    await cartStore.clearCart()
    
    const isCOD = selectedPaymentMethod.value?.is_cod
    const successMessage = isCOD 
      ? '🎉 Thank you for your order! You will pay cash upon delivery. A confirmation email has been sent.'
      : '🎉 Thank you for your order! Your jewelry will be shipped soon. A confirmation email has been sent.'
    
    alert(successMessage)
    router.push('/')
  } catch (error) {
    console.error('❌ Order failed:', error)
    console.error('❌ Error response:', error.response?.data)
    
    // Check if error is about empty cart
    if (error.response?.data?.cart && error.response.data.cart[0] === 'Your cart is empty.') {
      alert('Your cart is empty. Please add items to your cart before checking out.')
    } else {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data?.detail || error.message || 'There was an error processing your order. Please try again.'
      alert(errorMsg)
    }
  } finally {
    isProcessing.value = false
  }
}

onMounted(async () => {
  await authStore.checkAuth()
  await loadCheckoutData()
})
</script>