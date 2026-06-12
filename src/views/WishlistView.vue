<template>
  <main class="pt-28 md:pt-32 pb-12 md:pb-20 px-4 md:px-5">
    <div class="max-w-7xl mx-auto">
      
      <!-- Page Title -->
      <div class="text-center mb-8 md:mb-12">
        <h1 class="font-playfair text-3xl md:text-4xl lg:text-5xl font-light text-stone-800 mb-3">My Wishlist</h1>
        <div class="w-16 md:w-20 h-0.5 bg-amber-500 mx-auto rounded-full"></div>
        <p class="text-stone-500 text-sm md:text-base mt-2 md:mt-3">{{ wishlistStore.itemCount }} items in your wishlist</p>
      </div>
      
      <!-- Wishlist Items -->
      <div v-if="wishlistStore.items.length === 0" class="text-center py-12 md:py-16">
        <i class="far fa-heart text-5xl md:text-6xl text-amber-300 mb-3 md:mb-4"></i>
        <h2 class="text-xl md:text-2xl font-playfair text-stone-800 mb-2">Your wishlist is empty</h2>
        <p class="text-stone-600 text-sm md:text-base mb-4 md:mb-6">Save your favorite items here to shop later.</p>
        <router-link to="/collections" class="inline-block bg-amber-600 text-white px-5 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base hover:bg-amber-700 transition">
          Start Shopping
        </router-link>
      </div>
      
      <!-- Wishlist Grid - Responsive -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <div v-for="item in wishlistStore.items" :key="item.id" class="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
          <!-- Product Image -->
          <router-link :to="`/product/${item.id}`" class="block relative overflow-hidden aspect-square">
            <img :src="item.image" :alt="item.name" class="w-full h-full object-cover transition duration-500 group-hover:scale-105">
            <div v-if="item.badge" class="absolute top-1 left-1 md:top-2 md:left-2 bg-amber-600 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs">
              {{ item.badge }}
            </div>
            <button 
              @click.prevent="removeFromWishlist(item.id)" 
              class="absolute top-1 right-1 md:top-2 md:right-2 w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/80 hover:bg-red-500 hover:text-white transition flex items-center justify-center"
            >
              <i class="fas fa-trash-alt text-[10px] md:text-xs"></i>
            </button>
          </router-link>
          
          <!-- Product Info -->
          <div class="p-2 md:p-3">
            <router-link :to="`/product/${item.id}`" class="block">
              <h3 class="font-playfair font-semibold text-stone-800 text-xs sm:text-sm md:text-base mb-0.5 md:mb-1 hover:text-amber-600 transition line-clamp-2">{{ item.name }}</h3>
            </router-link>
            <p class="text-amber-700 font-bold text-sm md:text-base lg:text-lg mb-2 md:mb-3">${{ item.price.toLocaleString() }}</p>
            
            <div class="flex gap-2">
              <button 
                @click="addToCart(item)" 
                class="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white py-1.5 md:py-2 rounded-full font-semibold hover:scale-[1.02] transition text-[10px] sm:text-xs md:text-sm"
              >
                <i class="fas fa-shopping-bag mr-1 text-[8px] md:text-xs"></i> Add
              </button>
              <button 
                @click="removeFromWishlist(item.id)" 
                class="px-2 md:px-3 py-1.5 md:py-2 rounded-full border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition text-[10px] sm:text-xs md:text-sm"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </main>
</template>

<script setup>
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const wishlistStore = useWishlistStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
useScrollAnimation()

const addToCart = (product) => {
  cartStore.addToCart(
    {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    },
    authStore.isAuthenticated,
    authStore.openAuthModal
  )
}

const removeFromWishlist = (productId) => {
  wishlistStore.removeFromWishlist(productId)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>