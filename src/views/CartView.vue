<!-- src/views/CartView.vue -->
<template>
  <main class="pt-32 pb-20 px-5">
    <div class="max-w-7xl mx-auto">
      
      <!-- Page Title -->
      <div class="text-center mb-12">
        <h1 class="font-playfair text-4xl md:text-5xl font-light text-stone-800 mb-3">Your Shopping Cart</h1>
        <div class="w-20 h-0.5 bg-amber-500 mx-auto rounded-full"></div>
        <p v-if="cartStore.items.length > 0" class="text-stone-500 text-sm mt-2">
          <i class="fas fa-chart-line text-amber-500 mr-1"></i>
          {{ cartStore.items.length }} items in your cart
        </p>
      </div>
      
      <!-- Cart Content -->
      <div>
        <div class="flex flex-col lg:flex-row gap-10">
          <!-- Cart Items Section -->
          <div class="flex-1">
            <div class="bg-white rounded-2xl shadow-md overflow-hidden">
              <div v-if="cartStore.items.length === 0" class="text-center py-16 text-stone-400">
                <i class="fas fa-shopping-bag text-5xl mb-4 opacity-50"></i>
                <p>Your cart is empty</p>
                <router-link to="/collections" class="inline-block mt-4 px-6 py-2 bg-amber-600 text-white rounded-full text-sm hover:bg-amber-700 transition">
                  Continue Shopping
                </router-link>
              </div>
              
              <div v-else class="divide-y divide-amber-100">
                <div v-for="item in cartStore.items" :key="item.id" class="p-5 flex gap-4 items-center">
                  <!-- Product Image -->
                  <router-link :to="getProductLink(item)" class="block flex-shrink-0">
                    <img :src="item.image" :alt="item.name" class="w-24 h-24 object-cover rounded-xl hover:opacity-80 transition">
                  </router-link>
                  
                  <div class="flex-1 min-w-0">
                    <router-link :to="getProductLink(item)" class="hover:text-amber-600 transition">
                      <h3 class="font-semibold text-stone-800 hover:text-amber-600 truncate">{{ item.name }}</h3>
                    </router-link>
                    
                    <p v-if="item.displayText" class="text-xs text-stone-500 mt-0.5">{{ item.displayText }}</p>
                    
                    <div v-if="item.goldWeight || item.silverWeight" class="flex flex-wrap gap-2 mt-1">
                      <span v-if="item.goldWeight && item.goldWeight > 0" class="text-[10px] bg-amber-50 text-stone-500 px-2 py-0.5 rounded-full border border-amber-100">
                        Gold: {{ item.goldWeight }}g
                      </span>
                      <span v-if="item.silverWeight && item.silverWeight > 0" class="text-[10px] bg-stone-50 text-stone-500 px-2 py-0.5 rounded-full border border-stone-200">
                        Silver: {{ item.silverWeight }}g
                      </span>
                    </div>
                    
                    <span v-if="item.isCustom" class="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Custom</span>
                    
                    <div class="flex items-baseline gap-2 mt-1">
                      <p class="text-amber-700 font-bold text-lg">${{ (item.price || 0).toLocaleString() }}</p>
                    </div>
                    
                    <div class="flex items-center gap-3 mt-2">
                      <button @click="updateQuantity(item.id, -1)" class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-600 hover:text-white transition">-</button>
                      <span class="w-8 text-center text-stone-700">{{ item.quantity }}</span>
                      <button @click="updateQuantity(item.id, 1)" class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-600 hover:text-white transition">+</button>
                      <button @click="removeItem(item.id)" class="ml-4 text-stone-400 hover:text-red-500 transition text-sm">
                        <i class="fas fa-trash-alt"></i> Remove
                      </button>
                    </div>
                  </div>
                  
                  <div class="text-right flex-shrink-0">
                    <span class="font-bold text-stone-800">${{ ((item.price || 0) * item.quantity).toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Order Summary -->
          <div class="lg:w-96">
            <div class="bg-white rounded-2xl shadow-md p-6 sticky top-32">
              <h3 class="text-xl font-playfair font-semibold text-stone-800 mb-4">Order Summary</h3>
              
              <div class="space-y-3 border-b border-amber-100 pb-4">
                <div class="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>${{ cartStore.subtotal.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>Tax (8%)</span>
                  <span>${{ cartStore.tax.toFixed(2) }}</span>
                </div>
              </div>
              
              <div class="flex justify-between text-stone-800 font-bold text-lg pt-4">
                <span>Total</span>
                <span>${{ cartStore.total.toFixed(2) }}</span>
              </div>
              
              <!-- ✅ Proceed to Checkout Button - Direct navigation -->
              <router-link 
                to="/checkout"
                class="block w-full mt-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-full font-semibold hover:scale-[1.02] transition shadow-md text-center"
              >
                Proceed to Checkout
              </router-link>
              
              <router-link to="/collections" class="block text-center mt-4 text-sm text-amber-600 hover:underline">
                ← Continue Shopping
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const cartStore = useCartStore()
useScrollAnimation()

// ============================================
// Get product link from cart item
// ============================================
function getProductLink(item) {
  if (!item) return '/collections'
  if (item.product_slug) {
    return `/product/${item.product_slug}`
  }
  if (item.product_id) {
    return `/product/${item.product_id}`
  }
  return `/product/${item.id}`
}

// ============================================
// Cart Actions
// ============================================
const updateQuantity = (id, delta) => {
  cartStore.updateQuantity(id, delta)
}

const removeItem = (id) => {
  cartStore.removeItem(id)
}

onMounted(() => {
  cartStore.fetchCart()
})
</script>