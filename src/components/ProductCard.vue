<template>
  <router-link :to="`/product/${product.id}`" class="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 block">
    <div class="relative overflow-hidden h-44 sm:h-52 md:h-64 bg-[#e8d9cc]">
      <img 
        :src="product.image" 
        :alt="product.name" 
        class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
      >
      <div v-if="product.badge" class="absolute top-2 right-2 bg-amber-100/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[8px] md:text-[10px] font-semibold text-amber-800">
        {{ product.badge }}
      </div>
    </div>
    <div class="p-2 md:p-3">
      <h3 class="font-playfair font-semibold text-stone-800 text-xs sm:text-sm md:text-base">{{ product.name }}</h3>
      <p class="text-stone-500 text-[9px] sm:text-xs mt-0.5">{{ product.type }}</p>
      <div class="flex justify-between items-center mt-1.5 md:mt-2">
        <div class="flex items-center gap-1 sm:gap-2">
          <span class="text-amber-700 font-bold text-xs sm:text-sm md:text-base">${{ product.price.toLocaleString() }}</span>
          <span v-if="product.oldPrice" class="text-stone-400 text-[8px] sm:text-xs line-through">${{ product.oldPrice.toLocaleString() }}</span>
        </div>
        <div class="flex gap-1">
          <button 
            @click.prevent="toggleFavorite" 
            class="heart-btn w-5 h-5 md:w-7 md:h-7 rounded-full bg-amber-100 transition flex items-center justify-center"
            :class="isFavorited ? 'text-pink-600 bg-pink-100' : 'text-amber-600 hover:bg-pink-100 hover:text-pink-600'"
          >
            <i :class="isFavorited ? 'fas fa-heart' : 'far fa-heart'" class="text-[9px] md:text-xs"></i>
          </button>
          <button 
            @click.prevent="handleAddToCart" 
            class="w-5 h-5 md:w-7 md:h-7 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white transition flex items-center justify-center"
          >
            <i class="fas fa-shopping-bag text-[9px] md:text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()
const isFavorited = ref(false)

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
}

const handleAddToCart = (e) => {
  e.preventDefault()
  cartStore.addToCart({
    id: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: props.product.image
  })
}
</script>