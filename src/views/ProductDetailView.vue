<!-- src/views/ProductDetailView.vue -->
<template>
  <main class="pt-32 pb-20 px-5">
    <div class="max-w-7xl mx-auto">
      
      <!-- Breadcrumb -->
      <div class="mb-6 md:mb-8 fade-on-scroll fade-up">
        <div class="flex items-center gap-2 text-xs md:text-sm text-stone-500 flex-wrap">
          <router-link to="/" class="hover:text-amber-600 transition">Home</router-link>
          <i class="fas fa-chevron-right text-[10px] md:text-xs"></i>
          <router-link :to="`/category/${product?.category_slug}`" class="hover:text-amber-600 transition">{{ product?.category || 'Category' }}</router-link>
          <i class="fas fa-chevron-right text-[10px] md:text-xs"></i>
          <span class="text-amber-700">{{ product?.name }}</span>
        </div>
      </div>
      
      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-20">
        <i class="fas fa-spinner fa-spin text-4xl text-amber-600"></i>
        <p class="text-stone-500 mt-4">Loading product...</p>
      </div>
      
      <!-- Not Found -->
      <div v-else-if="!product" class="text-center py-20 fade-on-scroll fade-up">
        <i class="fas fa-search text-6xl text-amber-300 mb-4"></i>
        <h2 class="text-2xl font-playfair text-stone-800 mb-2">Product Not Found</h2>
        <p class="text-stone-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <router-link to="/collections" class="inline-block bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition">
          Continue Shopping
        </router-link>
      </div>
      
      <!-- Product Detail -->
      <div v-else class="flex flex-col lg:flex-row gap-8 md:gap-12">
        
        <!-- LEFT: Image -->
        <div class="lg:w-1/2 fade-on-scroll fade-left">
          <div class="sticky top-28 md:top-32">
            <div class="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50 shadow-2xl group">
              <img :src="currentImage || product.image" :alt="product.name" class="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105" @error="handleImageError">
              <div v-if="product.badge && product.badge !== 'none'" class="absolute top-3 left-3 md:top-4 md:left-4 bg-amber-600 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
                {{ product.badge.replace('_', ' ').toUpperCase() }}
              </div>
            </div>
            
            <!-- Thumbnails -->
            <div v-if="product.images && product.images.length > 0" class="flex gap-2 md:gap-4 mt-3 md:mt-4">
              <div 
                v-for="(thumb, index) in product.images" 
                :key="index"
                @click="currentImage = thumb"
                class="w-14 h-14 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105"
                :class="currentImage === thumb ? 'border-2 border-amber-600' : 'border-2 border-transparent hover:border-amber-600'"
              >
                <img :src="thumb" :alt="product.name" class="w-full h-full object-cover" @error="handleImageError">
              </div>
            </div>
          </div>
        </div>
        
        <!-- RIGHT: Info -->
        <div class="lg:w-1/2 fade-on-scroll fade-right">
          <!-- Tags -->
          <div v-if="product.tags && product.tags.length" class="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
            <span v-for="tag in product.tags" :key="tag" class="bg-amber-100 text-amber-800 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
              {{ tag }}
            </span>
          </div>
          
          <h1 class="font-playfair text-2xl md:text-4xl lg:text-5xl font-light text-stone-800 mb-2">
            {{ product.name }}
          </h1>
          
          <div class="text-sm text-stone-500 mb-3">
            {{ product.category }}
            <span v-if="product.displayText" class="ml-2 text-amber-600">· {{ product.displayText }}</span>
          </div>
          
          <div class="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div class="flex gap-0.5 md:gap-1 text-amber-500 text-sm md:text-base">
              <template v-for="star in 5" :key="star">
                <i v-if="star <= Math.floor(product.rating || 5)" class="fas fa-star text-amber-500"></i>
                <i v-else-if="star === Math.ceil(product.rating || 5) && (product.rating || 5) % 1 !== 0" class="fas fa-star-half-alt text-amber-500"></i>
                <i v-else class="fas fa-star text-amber-200"></i>
              </template>
            </div>
            <span class="text-stone-500 text-xs md:text-sm">({{ product.review_count || 0 }} reviews)</span>
          </div>
          
          <!-- Price -->
          <div class="mb-4 md:mb-6">
            <div class="flex items-baseline gap-3 flex-wrap">
              <span class="text-2xl md:text-3xl lg:text-4xl font-bold text-amber-700">
                ${{ product.price.toLocaleString() }}
              </span>
              <span v-if="product.oldPrice" class="text-stone-400 line-through text-sm md:text-base">
                ${{ product.oldPrice.toLocaleString() }}
              </span>
            </div>
          </div>
          
          <p class="text-stone-600 text-sm md:text-base leading-relaxed mb-4 md:mb-6">
            {{ product.description || 'Beautiful piece crafted with precision and care.' }}
          </p>
          
          <!-- Features -->
          <div v-if="product.features && product.features.length" class="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6 p-3 md:p-4 bg-amber-50/50 rounded-xl md:rounded-2xl">
            <div v-for="feature in product.features" :key="feature.label" class="flex items-center gap-2 md:gap-3">
              <i :class="feature.icon || 'fas fa-gem'" class="text-amber-600 text-base md:text-xl"></i>
              <div>
                <p class="text-[10px] md:text-xs text-stone-500">{{ feature.label }}</p>
                <p class="font-semibold text-stone-800 text-xs md:text-sm">{{ feature.value }}</p>
              </div>
            </div>
          </div>
          
          <!-- Stock Status -->
          <div class="mb-4 md:mb-6">
            <div class="flex items-center gap-2">
              <div 
                class="w-3 h-3 rounded-full"
                :class="{
                  'bg-green-500': product.stock > 10,
                  'bg-amber-500': product.stock > 0 && product.stock <= 10,
                  'bg-red-500': product.stock === 0
                }"
              ></div>
              <span class="text-sm font-medium" :class="{
                'text-green-600': product.stock > 10,
                'text-amber-600': product.stock > 0 && product.stock <= 10,
                'text-red-600': product.stock === 0
              }">
                {{ product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock' }}
              </span>
            </div>
          </div>
          
          <!-- Quantity -->
          <div class="mb-4 md:mb-6">
            <span class="font-semibold text-stone-800 block mb-1.5 md:mb-2 text-sm md:text-base">Quantity</span>
            <div class="flex items-center gap-3 md:gap-4">
              <div class="flex items-center border-2 border-amber-300 rounded-full overflow-hidden">
                <button 
                  @click="decrementQuantity" 
                  class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-white transition text-lg md:text-xl"
                  :disabled="quantity <= 1"
                >
                  -
                </button>
                <span class="w-10 md:w-12 text-center text-stone-800 font-semibold text-sm md:text-base">{{ quantity }}</span>
                <button 
                  @click="incrementQuantity" 
                  class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-white transition text-lg md:text-xl"
                  :disabled="quantity >= product.stock"
                >
                  +
                </button>
              </div>
              <span class="text-stone-500 text-xs md:text-sm">{{ product.stock || 0 }} available</span>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
            <button 
              @click="addToCart" 
              class="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white py-2.5 md:py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              :disabled="product.stock === 0 || isAddingToCart"
            >
              <i class="fas fa-shopping-bag text-xs md:text-sm"></i>
              {{ product.stock === 0 ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart' }}
            </button>
            <button 
              @click="toggleWishlist" 
              class="flex-1 border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white py-2.5 md:py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <i :class="isInWishlist ? 'fas fa-heart' : 'far fa-heart'" class="text-xs md:text-sm"></i> 
              {{ isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist' }}
            </button>
          </div>
          
          <!-- Delivery -->
          <div class="border-t border-amber-200 pt-4 md:pt-6 flex flex-col gap-2 md:gap-3">
            <div class="flex items-center gap-2 md:gap-3">
              <i class="fas fa-truck text-amber-600 text-base md:text-xl animate-float"></i>
              <div>
                <p class="text-xs md:text-sm font-semibold text-stone-800">Free Express Shipping</p>
                <p class="text-[10px] md:text-xs text-stone-500">Delivery in 3-5 business days</p>
              </div>
            </div>
            <div class="flex items-center gap-2 md:gap-3">
              <i class="fas fa-undo-alt text-amber-600 text-base md:text-xl animate-float" style="animation-delay: 0.5s"></i>
              <div>
                <p class="text-xs md:text-sm font-semibold text-stone-800">30-Day Returns</p>
                <p class="text-[10px] md:text-xs text-stone-500">Easy returns within 30 days</p>
              </div>
            </div>
            <div class="flex items-center gap-2 md:gap-3">
              <i class="fas fa-shield-alt text-amber-600 text-base md:text-xl animate-float" style="animation-delay: 1s"></i>
              <div>
                <p class="text-xs md:text-sm font-semibold text-stone-800">Lifetime Warranty</p>
                <p class="text-[10px] md:text-xs text-stone-500">Included with every purchase</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Related Products -->
      <section v-if="relatedProducts.length > 0" class="mt-12 md:mt-20 fade-on-scroll fade-up">
        <div class="text-center mb-6 md:mb-10">
          <span class="text-amber-700 tracking-widest text-[10px] md:text-sm uppercase font-semibold">You May Also Like</span>
          <h2 class="text-xl md:text-2xl lg:text-3xl font-bold font-playfair mt-1 md:mt-2 text-stone-800">Complete Your Look</h2>
          <div class="w-12 md:w-20 h-0.5 bg-amber-500 mx-auto mt-2 md:mt-3 rounded-full"></div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <div v-for="related in relatedProducts" :key="related.id" class="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
            <router-link :to="`/product/${related.slug}`" class="block">
              <div class="h-40 sm:h-48 md:h-56 overflow-hidden relative">
                <img :src="related.image" :alt="related.name" class="w-full h-full object-cover transition duration-700 group-hover:scale-110" @error="handleImageError">
                <div v-if="related.badge && related.badge !== 'none'" class="absolute top-1 right-1 bg-amber-100/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[8px] md:text-[10px] font-semibold text-amber-800">
                  {{ related.badge.replace('_', ' ').toUpperCase() }}
                </div>
                <div v-if="related.stock === 0" class="absolute bottom-1 left-1 bg-red-500/90 backdrop-blur-sm text-white text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-full">
                  Out of Stock
                </div>
                <div v-else-if="related.stock <= 5" class="absolute bottom-1 left-1 bg-amber-500/90 backdrop-blur-sm text-white text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-full">
                  {{ related.stock }} left
                </div>
              </div>
              <div class="p-2 md:p-3">
                <h3 class="font-semibold text-stone-800 text-xs sm:text-sm">{{ related.name }}</h3>
                <p class="text-amber-700 font-bold text-xs sm:text-sm mt-0.5 md:mt-1">${{ related.price.toLocaleString() }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </section>
      
      <!-- Review Section -->
      <div class="fade-on-scroll fade-up">
        <ReviewSection 
          :productId="product?.id" 
          :productName="product?.name" 
          :productImage="product?.image" 
        />
      </div>
      
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useOsimartProductsStore } from '@/stores/osimartProducts'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useScrollAnimation } from '@/composables/useScrollAnimation'
import ReviewSection from '@/components/ReviewSection.vue'

const route = useRoute()
const productStore = useOsimartProductsStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()

useScrollAnimation()

// ============================================
// STATE
// ============================================
const quantity = ref(1)
const currentImage = ref('')
const product = ref(null)
const relatedProducts = ref([])
const isLoading = ref(false)
const isAddingToCart = ref(false)

// ============================================
// COMPUTED
// ============================================
const isInWishlist = computed(() => {
  if (!product.value) return false
  return wishlistStore.isInWishlist(product.value.id)
})

// ============================================
// METHODS
// ============================================
function incrementQuantity() {
  if (quantity.value < (product.value?.stock || 0)) {
    quantity.value++
  }
}

function decrementQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

async function addToCart() {
  if (!product.value || product.value.stock === 0 || isAddingToCart.value) return
  
  isAddingToCart.value = true
  
  try {
    const cartItem = {
      id: product.value.id,
      variant_id: product.value.variant_id,
      product_id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      quantity: quantity.value,
      goldWeight: product.value.goldWeight || 0,
      silverWeight: product.value.silverWeight || 0,
      metalType: product.value.metalType || 'none',
      originalPrice: product.value.originalPrice || product.value.price,
      displayText: product.value.displayText || '',
      slug: product.value.slug || '',
      category: product.value.category || '',
      category_slug: product.value.category_slug || '',
      badge: product.value.badge || '',
      stock: product.value.stock || 0,
    }
    
    const result = await cartStore.addToCart(
      cartItem, 
      authStore.isAuthenticated, 
      authStore.openAuthModal
    )
    
  } catch (error) {
    console.error('❌ Failed to add to cart:', error)
  } finally {
    isAddingToCart.value = false
  }
}

function toggleWishlist() {
  if (product.value) {
    wishlistStore.toggleWishlist({
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      category: product.value.category_slug,
      badge: product.value.badge
    })
  }
}

function handleImageError(event) {
  event.target.src = 'https://placehold.co/400x500/amber/white?text=Image+Not+Found'
}

async function loadProduct(id) {
  try {
    isLoading.value = true
    product.value = null
    quantity.value = 1
    
    console.log('🔍 Loading product with ID/slug:', id)
    
    let productData = null
    
    // Try to find in existing products
    if (productStore.products && productStore.products.length > 0) {
      productData = productStore.products.find(p => 
        p.slugified_name === id || 
        p.slug === id || 
        p.id === id
      )
    }
    
    // If not found, fetch all products
    if (!productData) {
      console.log('🔄 Product not found locally, fetching all products...')
      await productStore.fetchProducts()
      productData = productStore.products.find(p => 
        p.slugified_name === id || 
        p.slug === id || 
        p.id === id
      )
    }
    
    // If still not found, try direct API call
    if (!productData) {
      console.log('🔄 Product not found by slug, trying direct API call...')
      try {
        productData = await productStore.fetchProduct(id)
      } catch (e) {
        console.warn('⚠️ Direct fetch failed, trying to find by slug in all products...')
        await productStore.fetchProducts()
        productData = productStore.products.find(p => 
          p.slugified_name === id || 
          p.slug === id
        )
      }
    }
    
    if (productData) {
      // Map product data (stock is mapped directly from product data)
      product.value = productStore.mapProduct(productData)
      
      // Set main image
      if (product.value && product.value.image) {
        currentImage.value = product.value.image
      }
      
      // Load related products
      if (product.value.category_id) {
        await productStore.fetchProducts({ category: product.value.category_id })
        const allProducts = productStore.mapProducts(productStore.products)
        relatedProducts.value = allProducts
          .filter(p => p.id !== product.value.id)
          .slice(0, 4)
      }
      
      console.log('✅ Product loaded:', product.value.name)
      console.log('📦 Stock:', product.value.stock)
    } else {
      console.warn('⚠️ Product not found:', id)
      product.value = null
    }
  } catch (error) {
    console.error('❌ Failed to load product:', error)
    product.value = null  } finally {
    isLoading.value = false
  }
}

// ============================================
// WATCHERS
// ============================================
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadProduct(newId)
  }
}, { immediate: true })

// ============================================
// LIFECYCLE
// ============================================
onMounted(() => {
  const id = route.params.id
  if (id) {
    loadProduct(id)
  }
})
</script>

<style scoped>
.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
