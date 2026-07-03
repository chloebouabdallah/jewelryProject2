<!-- src/views/CategoryView.vue -->
<template>
  <main>
    <!-- Hero Section -->
    <section class="pt-32 pb-8 px-5 bg-gradient-to-r from-[#f5e6d8] to-[#e8d5c0]">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="font-playfair text-4xl md:text-5xl lg:text-6xl font-light text-stone-800 mb-3 animate-fade-scale">
          {{ pageTitle }}
        </h1>
        <div class="w-20 h-0.5 bg-amber-500 mx-auto rounded-full"></div>
        <p class="text-stone-600 mt-2 text-sm">
          Showing {{ filteredProducts.length }} of {{ allProducts.length }} products
        </p>
      </div>
    </section>

    <section class="py-8 px-5">
      <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        <!-- FILTER SIDEBAR -->
        <div class="lg:w-64 flex-shrink-0">
          <div class="bg-white rounded-xl p-4 shadow-md sticky top-28">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-playfair text-lg font-semibold text-stone-800">Filters</h3>
              <button @click="clearAllFilters" class="text-xs text-amber-600 hover:text-amber-800 underline">Clear All</button>
            </div>
            
            <!-- Category Filter -->
            <div class="mb-4">
              <h4 class="font-semibold text-stone-800 text-sm mb-2 flex items-center gap-1">
                <i class="fas fa-tag text-amber-600 text-xs"></i> Category
              </h4>
              <div v-if="categoryStore.isLoading" class="text-center py-4">
                <i class="fas fa-spinner fa-spin text-amber-600"></i>
                <p class="text-xs text-stone-400 mt-1">Loading categories...</p>
              </div>
              <div v-else-if="displayCategories.length > 0" class="grid grid-cols-1 gap-1">
                <label v-for="category in displayCategories" :key="category.id" class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    :value="category.slug" 
                    v-model="filters.category" 
                    @change="onCategoryChange(category)"
                    class="w-3.5 h-3.5 text-amber-600"
                  >
                  <span class="text-stone-600 text-sm">{{ category.name }}</span>
                  <span class="text-xs text-stone-400 ml-auto">{{ getProductCount(category.id) }}</span>
                </label>
              </div>
            </div>
            
            <!-- Price Range -->
            <div class="mb-4">
              <h4 class="font-semibold text-stone-800 text-sm mb-2 flex items-center gap-1">
                <i class="fas fa-dollar-sign text-amber-600 text-xs"></i> Price Range
              </h4>
              <div class="grid grid-cols-2 gap-1">
                <label v-for="price in priceRanges" :key="price.value" class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" :value="price.value" v-model="filters.price" class="w-3.5 h-3.5 text-amber-600">
                  <span class="text-stone-600 text-sm">{{ price.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- Metal -->
            <div class="mb-4">
              <h4 class="font-semibold text-stone-800 text-sm mb-2 flex items-center gap-1">
                <i class="fas fa-circle text-amber-600 text-xs"></i> Metal
              </h4>
              <div class="grid grid-cols-2 gap-1">
                <label v-for="metal in metals" :key="metal.value" class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" :value="metal.value" v-model="filters.metal" class="w-3.5 h-3.5 text-amber-600">
                  <span class="text-stone-600 text-sm">{{ metal.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- Badge -->
            <div class="mb-3">
              <h4 class="font-semibold text-stone-800 text-sm mb-2 flex items-center gap-1">
                <i class="fas fa-trophy text-amber-600 text-xs"></i> Badge
              </h4>
              <div class="grid grid-cols-2 gap-1">
                <label v-for="badge in badges" :key="badge.value" class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" :value="badge.value" v-model="filters.badge" class="w-3.5 h-3.5 text-amber-600">
                  <span class="text-stone-600 text-sm">{{ badge.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- Active Filters -->
            <div class="mt-3 pt-3 border-t border-amber-100">
              <p class="text-xs text-stone-500 mb-1">Active:</p>
              <div class="flex flex-wrap gap-1">
                <span v-if="filters.category !== 'all'" class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  {{ getCategoryName(filters.category) }} <i @click="filters.category = 'all'; refetchProducts()" class="fas fa-times cursor-pointer hover:text-amber-950"></i>
                </span>
                <span v-if="filters.price !== 'all'" class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  {{ getPriceLabel(filters.price) }} <i @click="filters.price = 'all'" class="fas fa-times cursor-pointer hover:text-amber-950"></i>
                </span>
                <span v-if="filters.metal !== 'all'" class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  {{ getMetalLabel(filters.metal) }} <i @click="filters.metal = 'all'" class="fas fa-times cursor-pointer hover:text-amber-950"></i>
                </span>
                <span v-if="filters.badge !== 'all'" class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  {{ getBadgeLabel(filters.badge) }} <i @click="filters.badge = 'all'" class="fas fa-times cursor-pointer hover:text-amber-950"></i>
                </span>
                <span v-if="activeFilterCount === 0" class="text-stone-400 text-[10px]">No active filters</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- PRODUCTS GRID -->
        <div class="flex-1">
          <p class="text-stone-500 text-sm mb-3">Showing {{ filteredProducts.length }} of {{ allProducts.length }} products</p>
          
          <div v-if="productStore.isLoading || stockStore.isLoading" class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-3xl text-amber-600"></i>
            <p class="text-stone-500 mt-2">Loading products...</p>
          </div>
          
          <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            <div v-for="product in filteredProducts" :key="product.id" class="product-card group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <router-link :to="`/product/${product.slug}`" class="block">
                <div class="h-44 sm:h-52 md:h-64 overflow-hidden relative">
                  <img :src="product.image" :alt="product.name" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" @error="handleImageError">
                  
                  <!-- Badge only - no stock overlay -->
                  <div v-if="product.badge && product.badge !== 'none'" class="absolute top-1 right-1 bg-amber-100/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[8px] md:text-[10px] font-semibold text-amber-800">
                    {{ product.badge.replace('_', ' ').toUpperCase() }}
                  </div>
                </div>
                
                <div class="p-2 md:p-3">
                  <h3 class="font-playfair text-xs sm:text-sm md:text-base font-semibold text-stone-800 leading-tight">{{ product.name }}</h3>
                  <p class="text-stone-500 text-[9px] sm:text-xs mt-0.5">
                    {{ product.displayText || product.metalType || 'N/A' }}
                  </p>
                  
                  <!-- Price and Actions -->
                  <div class="flex justify-between items-center mt-1.5 md:mt-2">
                    <div>
                      <span class="text-amber-700 font-bold text-xs sm:text-sm md:text-base">
                        ${{ product.price.toLocaleString() }}
                      </span>
                      <!-- Stock under price -->
                      <p v-if="product.stock === 0" class="text-red-500 text-[8px] sm:text-[10px] font-semibold mt-0.5">
                        Out of Stock
                      </p>
                      <p v-else-if="product.stock <= 5" class="text-amber-500 text-[8px] sm:text-[10px] mt-0.5">
                        Only {{ product.stock }} left
                      </p>
                    </div>
                    <div class="flex gap-1">
                      <button @click.prevent="toggleWishlist(product)" class="w-5 h-5 md:w-7 md:h-7 rounded-full bg-amber-100 transition flex items-center justify-center" :class="isInWishlist(product.id) ? 'text-pink-600 bg-pink-100' : 'text-amber-600 hover:bg-pink-100 hover:text-pink-600'">
                        <i :class="isInWishlist(product.id) ? 'fas fa-heart' : 'far fa-heart'" class="text-[9px] md:text-xs"></i>
                      </button>
                      <button 
                        @click.prevent="addToCart(product)" 
                        class="w-5 h-5 md:w-7 md:h-7 rounded-full transition flex items-center justify-center"
                        :class="product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white'"
                        :disabled="product.stock === 0"
                      >
                        <i class="fas fa-shopping-bag text-[9px] md:text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
          
          <div v-else class="text-center py-10">
            <i class="fas fa-search text-4xl text-amber-300 mb-3"></i>
            <p class="text-stone-600">No products in this category.</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOsimartCategoriesStore } from '@/stores/osimartCategories'
import { useOsimartProductsStore } from '@/stores/osimartProducts'
import { useOsimartStockStore } from '@/stores/osimartStock'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const route = useRoute()
const router = useRouter()
const categoryStore = useOsimartCategoriesStore()
const productStore = useOsimartProductsStore()
const stockStore = useOsimartStockStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()

useScrollAnimation()

const displayCategories = ref([])

const filters = ref({
  category: 'all',
  price: 'all',
  metal: 'all',
  badge: 'all'
})

const priceRanges = [
  { value: 'all', label: 'All' },
  { value: 'under-500', label: 'Under $500' },
  { value: '500-1500', label: '$500 - $1.5k' },
  { value: '1500-3000', label: '$1.5k - $3k' },
  { value: '3000-plus', label: '$3k+' }
]

const metals = [
  { value: 'all', label: 'All' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'rose-gold', label: 'Rose Gold' },
  { value: 'platinum', label: 'Platinum' }
]

const badges = [
  { value: 'all', label: 'All' },
  { value: 'best_seller', label: 'Best Seller' },
  { value: 'new', label: 'New' },
  { value: 'limited', label: 'Limited' },
  { value: 'sale', label: 'Sale' }
]

const pageTitle = computed(() => {
  const slug = route.params.category
  const category = displayCategories.value.find(c => c.slug === slug)
  return category ? category.name : slug?.charAt(0).toUpperCase() + slug?.slice(1) || 'Products'
})

const mappedCategories = computed(() => {
  return categoryStore.mapCategories(categoryStore.categories)
})

const allProducts = computed(() => {
  const productList = productStore.products || []
  const mapped = productStore.mapProducts(productList)
  
  return mapped.map(product => ({
    ...product,
    stock: stockStore.getProductStock(product.id)
  }))
})

const filteredProducts = computed(() => {
  let products = allProducts.value
  
  const categorySlug = route.params.category
  if (categorySlug && categorySlug !== 'all') {
    const category = displayCategories.value.find(c => c.slug === categorySlug)
    if (category) {
      products = products.filter(p => p.category_id === category.id)
    }
  }
  
  if (filters.value.price !== 'all') {
    const price = filters.value.price
    switch(price) {
      case 'under-500':
        products = products.filter(p => p.price < 500)
        break
      case '500-1500':
        products = products.filter(p => p.price >= 500 && p.price < 1500)
        break
      case '1500-3000':
        products = products.filter(p => p.price >= 1500 && p.price < 3000)
        break
      case '3000-plus':
        products = products.filter(p => p.price >= 3000)
        break
    }
  }
  
  if (filters.value.metal !== 'all') {
    products = products.filter(p => p.metalType === filters.value.metal)
  }
  
  if (filters.value.badge !== 'all') {
    products = products.filter(p => p.badge === filters.value.badge)
  }
  
  return products
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.price !== 'all') count++
  if (filters.value.metal !== 'all') count++
  if (filters.value.badge !== 'all') count++
  return count
})

async function loadProducts() {
  try {
    await productStore.fetchProducts()
    const products = productStore.products || []
    const productIds = products.map(p => p.id).filter(id => id)
    
    if (productIds.length > 0) {
      await stockStore.fetchProductsStock(productIds)
    }
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

function onCategoryChange(category) {
  if (category && category.slug) {
    router.push(`/category/${category.slug}`)
  }
}

function refetchProducts() {
  loadProducts()
}

function getProductCount(categoryId) {
  return allProducts.value.filter(p => p.category_id === categoryId).length
}

function getCategoryName(slug) {
  const category = displayCategories.value.find(c => c.slug === slug)
  return category ? category.name : slug
}

function getPriceLabel(value) {
  return priceRanges.find(p => p.value === value)?.label || value
}

function getMetalLabel(value) {
  return metals.find(m => m.value === value)?.label || value
}

function getBadgeLabel(value) {
  return badges.find(b => b.value === value)?.label || value
}

function clearAllFilters() {
  filters.value = { category: 'all', price: 'all', metal: 'all', badge: 'all' }
}

function isInWishlist(productId) {
  return wishlistStore.isInWishlist(productId)
}

function toggleWishlist(product) {
  wishlistStore.toggleWishlist({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category_slug,
    badge: product.badge
  })
}

function addToCart(product) {
  if (product.stock === 0) return
  
  cartStore.addToCart(
    {
      id: product.id,
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

function handleImageError(event) {
  event.target.src = 'https://placehold.co/400x500/amber/white?text=Image+Not+Found'
}

watch(() => route.params.category, (newSlug) => {
  if (newSlug) {
    filters.value.category = newSlug
  }
}, { immediate: true })

watch(mappedCategories, (newCategories) => {
  if (newCategories && newCategories.length > 0) {
    displayCategories.value = newCategories
    const slug = route.params.category
    if (slug) {
      filters.value.category = slug
    }
  }
}, { immediate: true })

onMounted(async () => {
  try {
    await categoryStore.fetchCategories()
    displayCategories.value = categoryStore.mapCategories(categoryStore.categories)
    await loadProducts()
  } catch (error) {
    console.error('Failed to load data:', error)
  }
})
</script>

<style scoped>
.animate-fade-scale {
  animation: fadeScale 0.6s ease-out;
}

@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>