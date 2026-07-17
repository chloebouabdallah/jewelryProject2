<template>
  <section class="py-12 md:py-20 px-4 md:px-5 bg-[#f5e6d8] overflow-hidden">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-8 md:mb-12 fade-on-scroll fade-up">
        <span class="text-amber-700 tracking-widest text-[10px] md:text-sm uppercase font-semibold">our curated edit</span>
        <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold font-playfair mt-2 text-stone-800">{{ sectionTitle || 'Bestselling Treasures' }}</h2>
        <div class="w-16 md:w-20 h-0.5 bg-amber-400 mx-auto mt-2 md:mt-3 rounded-full"></div>
        <p class="text-stone-500 text-xs md:text-sm mt-2 md:mt-3">✨ Infinite circular rotation ✨</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-10">
        <i class="fas fa-spinner fa-spin text-3xl text-amber-600"></i>
        <p class="text-stone-500 mt-2">Loading products...</p>
      </div>
      
      <!-- Products -->
      <div v-else-if="displayProducts.length > 0" class="relative overflow-hidden">
        <div class="infinite-scroll-container">
          <div class="infinite-scroll-track">
            <!-- First set of products -->
            <div 
              v-for="product in displayProducts" 
              :key="'first-' + product.id"
              class="product-card group w-[170px] sm:w-[200px] md:w-[220px] lg:w-[230px] flex-shrink-0"
            >
              <router-link :to="`/product/${product.slug || product.id}`" class="block bg-white rounded-xl overflow-hidden shadow-md transition-all duration-400 hover:shadow-2xl hover:-translate-y-3">
                <div class="relative overflow-hidden h-44 sm:h-52 bg-[#e8d9cc]">
                  <img :src="product.image" :alt="product.name" class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110" @error="handleImageError">
                  <div v-if="product.badge && product.badge !== 'none'" class="absolute top-2 right-2 bg-amber-100/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[8px] font-semibold text-amber-800">
                    {{ product.badge.replace('_', ' ').toUpperCase() }}
                  </div>
                </div>
                <div class="p-2 md:p-3 text-center">
                  <h3 class="font-playfair font-semibold text-stone-800 text-xs sm:text-sm">{{ product.name }}</h3>
                  <p class="text-stone-500 text-[10px] sm:text-xs mt-0.5">{{ product.displayText || product.category || '' }}</p>
                  <div class="flex justify-center items-center gap-1 sm:gap-2 mt-1">
                    <span class="text-amber-700 font-bold text-xs sm:text-sm">${{ product.price.toLocaleString() }}</span>
                    <span v-if="product.oldPrice" class="text-stone-400 text-[8px] sm:text-xs line-through">${{ product.oldPrice.toLocaleString() }}</span>
                  </div>
                  <button @click.prevent="quickAddToCart(product)" class="mt-2 w-full py-1 rounded-full border border-amber-300 text-amber-700 text-[10px] sm:text-xs font-semibold hover:bg-amber-600 hover:text-white transition">
                    Quick Shop
                  </button>
                </div>
              </router-link>
            </div>
            <!-- Duplicate set for seamless loop -->
            <div 
              v-for="product in displayProducts" 
              :key="'second-' + product.id"
              class="product-card group w-[170px] sm:w-[200px] md:w-[220px] lg:w-[230px] flex-shrink-0"
            >
              <router-link :to="`/product/${product.slug || product.id}`" class="block bg-white rounded-xl overflow-hidden shadow-md transition-all duration-400 hover:shadow-2xl hover:-translate-y-3">
                <div class="relative overflow-hidden h-44 sm:h-52 bg-[#e8d9cc]">
                  <img :src="product.image" :alt="product.name" class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110" @error="handleImageError">
                  <div v-if="product.badge && product.badge !== 'none'" class="absolute top-2 right-2 bg-amber-100/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[8px] font-semibold text-amber-800">
                    {{ product.badge.replace('_', ' ').toUpperCase() }}
                  </div>
                </div>
                <div class="p-2 md:p-3 text-center">
                  <h3 class="font-playfair font-semibold text-stone-800 text-xs sm:text-sm">{{ product.name }}</h3>
                  <p class="text-stone-500 text-[10px] sm:text-xs mt-0.5">{{ product.displayText || product.category || '' }}</p>
                  <div class="flex justify-center items-center gap-1 sm:gap-2 mt-1">
                    <span class="text-amber-700 font-bold text-xs sm:text-sm">${{ product.price.toLocaleString() }}</span>
                    <span v-if="product.oldPrice" class="text-stone-400 text-[8px] sm:text-xs line-through">${{ product.oldPrice.toLocaleString() }}</span>
                  </div>
                  <button @click.prevent="quickAddToCart(product)" class="mt-2 w-full py-1 rounded-full border border-amber-300 text-amber-700 text-[10px] sm:text-xs font-semibold hover:bg-amber-600 hover:text-white transition">
                    Quick Shop
                  </button>
                </div>
              </router-link>
            </div>
            <!-- Third set for extra smoothness -->
            <div 
              v-for="product in displayProducts" 
              :key="'third-' + product.id"
              class="product-card group w-[170px] sm:w-[200px] md:w-[220px] lg:w-[230px] flex-shrink-0"
            >
              <router-link :to="`/product/${product.slug || product.id}`" class="block bg-white rounded-xl overflow-hidden shadow-md transition-all duration-400 hover:shadow-2xl hover:-translate-y-3">
                <div class="relative overflow-hidden h-44 sm:h-52 bg-[#e8d9cc]">
                  <img :src="product.image" :alt="product.name" class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110" @error="handleImageError">
                  <div v-if="product.badge && product.badge !== 'none'" class="absolute top-2 right-2 bg-amber-100/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[8px] font-semibold text-amber-800">
                    {{ product.badge.replace('_', ' ').toUpperCase() }}
                  </div>
                </div>
                <div class="p-2 md:p-3 text-center">
                  <h3 class="font-playfair font-semibold text-stone-800 text-xs sm:text-sm">{{ product.name }}</h3>
                  <p class="text-stone-500 text-[10px] sm:text-xs mt-0.5">{{ product.displayText || product.category || '' }}</p>
                  <div class="flex justify-center items-center gap-1 sm:gap-2 mt-1">
                    <span class="text-amber-700 font-bold text-xs sm:text-sm">${{ product.price.toLocaleString() }}</span>
                    <span v-if="product.oldPrice" class="text-stone-400 text-[8px] sm:text-xs line-through">${{ product.oldPrice.toLocaleString() }}</span>
                  </div>
                  <button @click.prevent="quickAddToCart(product)" class="mt-2 w-full py-1 rounded-full border border-amber-300 text-amber-700 text-[10px] sm:text-xs font-semibold hover:bg-amber-600 hover:text-white transition">
                    Quick Shop
                  </button>
                </div>
              </router-link>
            </div>
            <!-- Fourth set for even smoother loop -->
            <div 
              v-for="product in displayProducts" 
              :key="'fourth-' + product.id"
              class="product-card group w-[170px] sm:w-[200px] md:w-[220px] lg:w-[230px] flex-shrink-0"
            >
              <router-link :to="`/product/${product.slug || product.id}`" class="block bg-white rounded-xl overflow-hidden shadow-md transition-all duration-400 hover:shadow-2xl hover:-translate-y-3">
                <div class="relative overflow-hidden h-44 sm:h-52 bg-[#e8d9cc]">
                  <img :src="product.image" :alt="product.name" class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110" @error="handleImageError">
                  <div v-if="product.badge && product.badge !== 'none'" class="absolute top-2 right-2 bg-amber-100/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[8px] font-semibold text-amber-800">
                    {{ product.badge.replace('_', ' ').toUpperCase() }}
                  </div>
                </div>
                <div class="p-2 md:p-3 text-center">
                  <h3 class="font-playfair font-semibold text-stone-800 text-xs sm:text-sm">{{ product.name }}</h3>
                  <p class="text-stone-500 text-[10px] sm:text-xs mt-0.5">{{ product.displayText || product.category || '' }}</p>
                  <div class="flex justify-center items-center gap-1 sm:gap-2 mt-1">
                    <span class="text-amber-700 font-bold text-xs sm:text-sm">${{ product.price.toLocaleString() }}</span>
                    <span v-if="product.oldPrice" class="text-stone-400 text-[8px] sm:text-xs line-through">${{ product.oldPrice.toLocaleString() }}</span>
                  </div>
                  <button @click.prevent="quickAddToCart(product)" class="mt-2 w-full py-1 rounded-full border border-amber-300 text-amber-700 text-[10px] sm:text-xs font-semibold hover:bg-amber-600 hover:text-white transition">
                    Quick Shop
                  </button>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-10">
        <p class="text-stone-500">No products available.</p>
      </div>
      
      <div class="text-center mt-6 md:mt-8 fade-on-scroll fade-up">
        <router-link to="/collections" class="inline-flex items-center gap-2 text-amber-700 font-semibold text-xs md:text-sm tracking-wider uppercase border-b border-amber-400 pb-1 hover:gap-3 transition-all duration-300">
          See All Products <i class="fas fa-arrow-right text-xs"></i>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useOsimartProductsStore } from '@/stores/osimartProducts'

const cartStore = useCartStore()
const authStore = useAuthStore()
const productStore = useOsimartProductsStore()

const isLoading = ref(true)
const sectionTitle = ref('Bestselling Treasures')
const sectionProducts = ref([])

let animationId = null
let scrollPosition = 0
let isHovering = false

// ============================================
// FETCH PRODUCTS BY BADGE OR SECTION
// ============================================
const fetchProducts = async () => {
  try {
    isLoading.value = true
    
    // First, load products if not loaded
    let allProducts = productStore.products || []
    if (allProducts.length === 0) {
      await productStore.fetchProducts()
      allProducts = productStore.products || []
    }
    
    const mappedProducts = productStore.mapProducts(allProducts)
    
    // Filter products with "Best Seller" badge
    const bestSellers = mappedProducts.filter(p => 
      p.badge && p.badge !== 'none' && 
      (p.badge.toLowerCase().includes('best') || 
       p.badge.toLowerCase().includes('seller') ||
       p.badge === 'best_seller')
    )
    
    // If we have best sellers, use them
    if (bestSellers.length > 0) {
      sectionProducts.value = bestSellers.slice(0, 6)
      console.log(`✅ Found ${bestSellers.length} best seller products`)
    } else {
      // Fallback: use products with any badge
      const anyBadge = mappedProducts.filter(p => 
        p.badge && p.badge !== 'none' && p.name && p.image
      ).slice(0, 6)
      
      if (anyBadge.length > 0) {
        sectionProducts.value = anyBadge
        console.log(`✅ Found ${anyBadge.length} products with badges`)
      } else {
        // Fallback: use first products
        const firstProducts = mappedProducts.filter(p => p.name && p.image).slice(0, 6)
        sectionProducts.value = firstProducts
        console.log(`✅ Using first ${firstProducts.length} products`)
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch products:', error)
    sectionProducts.value = []
  } finally {
    isLoading.value = false
  }
}

const displayProducts = computed(() => {
  return sectionProducts.value
})

const quickAddToCart = (product) => {
  cartStore.addToCart(
    {
      id: product.id,
      variant_id: product.variant_id || product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      stock: product.stock
    },
    authStore.isAuthenticated,
    authStore.openAuthModal
  )
}

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/400x500/amber/white?text=Image+Not+Found'
}

const startInfiniteScroll = () => {
  const container = document.querySelector('.infinite-scroll-container')
  const track = document.querySelector('.infinite-scroll-track')
  
  if (!container || !track) return
  
  const speed = 1.2
  let trackWidth = track.scrollWidth / 4
  
  const animate = () => {
    if (!isHovering && displayProducts.value.length > 0) {
      scrollPosition += speed
      
      if (scrollPosition >= trackWidth) {
        scrollPosition = 0
      }
      
      container.scrollLeft = scrollPosition
    }
    animationId = requestAnimationFrame(animate)
  }
  
  animate()
}

const stopInfiniteScroll = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

const handleMouseEnter = () => {
  isHovering = true
}

const handleMouseLeave = () => {
  isHovering = false
}

onMounted(async () => {
  await fetchProducts()
  
  setTimeout(() => {
    startInfiniteScroll()
    
    const container = document.querySelector('.infinite-scroll-container')
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mouseleave', handleMouseLeave)
    }
  }, 300)
})

onUnmounted(() => {
  stopInfiniteScroll()
  const container = document.querySelector('.infinite-scroll-container')
  if (container) {
    container.removeEventListener('mouseenter', handleMouseEnter)
    container.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<style scoped>
.infinite-scroll-container {
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
}

.infinite-scroll-container::-webkit-scrollbar {
  display: none;
}

.infinite-scroll-track {
  display: flex;
  gap: 1rem;
  width: max-content;
}

@media (min-width: 768px) {
  .infinite-scroll-track {
    gap: 1.5rem;
  }
}

.product-card {
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-8px);
}
</style>