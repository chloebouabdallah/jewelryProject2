<template>
  <main class="pt-32 pb-20 px-5">
    <div class="max-w-7xl mx-auto">
      <!-- Page Title -->
      <div class="text-center mb-12">
        <h1 class="font-playfair text-4xl md:text-5xl font-light text-stone-800 mb-3">Your Shopping Cart</h1>
        <div class="w-20 h-0.5 bg-amber-500 mx-auto rounded-full"></div>
      </div>
      
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
                <img :src="item.image" :alt="item.name" class="w-24 h-24 object-cover rounded-xl">
                <div class="flex-1">
                  <h3 class="font-semibold text-stone-800">{{ item.name }}</h3>
                  <p class="text-amber-700 font-bold text-lg mt-1">${{ item.price.toLocaleString() }}</p>
                  <div class="flex items-center gap-3 mt-2">
                    <button @click="updateQuantity(item.id, -1)" class="cart-qty-btn w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-600 hover:text-white transition">-</button>
                    <span class="w-8 text-center text-stone-700">{{ item.quantity }}</span>
                    <button @click="updateQuantity(item.id, 1)" class="cart-qty-btn w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-600 hover:text-white transition">+</button>
                    <button @click="removeItem(item.id)" class="ml-4 text-stone-400 hover:text-red-500 transition text-sm">
                      <i class="fas fa-trash-alt"></i> Remove
                    </button>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-bold text-stone-800">${{ (item.price * item.quantity).toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Order Summary Section -->
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
            
            <button @click="checkout" class="w-full mt-6 bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-full font-semibold hover:scale-[1.02] transition shadow-md">
              Proceed to Checkout
            </button>
            
            <router-link to="/collections" class="block text-center mt-4 text-sm text-amber-600 hover:underline">
              ← Continue Shopping
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>

import { useScrollAnimation } from '@/composables/useScrollAnimation'

useScrollAnimation()

import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

const updateQuantity = (productId, delta) => {
  cartStore.updateQuantity(productId, delta)
}

const removeItem = (productId) => {
  cartStore.removeItem(productId)
}

const checkout = () => {
  if (cartStore.items.length === 0) {
    alert('Your cart is empty. Add some items first!')
  } else {
    alert('Thank you for your order! This would proceed to checkout.')
  }
}
</script>