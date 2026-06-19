<template>
  <main>
    <!-- Hero Section -->
    <section class="pt-32 pb-8 px-5 bg-gradient-to-r from-[#f5e6d8] to-[#e8d5c0]">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="font-playfair text-4xl md:text-5xl lg:text-6xl font-light text-stone-800 mb-3 animate-fade-scale">{{ pageTitle }}</h1>
        <div class="w-20 h-0.5 bg-amber-500 mx-auto rounded-full"></div>
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
            
            <!-- Metal Color Filter -->
            <div class="mb-4">
              <h4 class="font-semibold text-stone-800 text-sm mb-2 flex items-center gap-1">
                <i class="fas fa-palette text-amber-600 text-xs"></i> Metal Color
              </h4>
              <div class="grid grid-cols-2 gap-1">
                <label v-for="metal in metals" :key="metal.value" class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" :value="metal.value" v-model="filters.metal" class="w-3.5 h-3.5 text-amber-600">
                  <span class="text-stone-600 text-sm">{{ metal.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- Price Range Filter -->
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
            
            <!-- Gemstone Filter -->
            <div class="mb-4">
              <h4 class="font-semibold text-stone-800 text-sm mb-2 flex items-center gap-1">
                <i class="fas fa-gem text-amber-600 text-xs"></i> Gemstone
              </h4>
              <div class="grid grid-cols-2 gap-1">
                <label v-for="gem in gems" :key="gem.value" class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" :value="gem.value" v-model="filters.gem" class="w-3.5 h-3.5 text-amber-600">
                  <span class="text-stone-600 text-sm">{{ gem.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- Style Filter -->
            <div class="mb-3">
              <h4 class="font-semibold text-stone-800 text-sm mb-2 flex items-center gap-1">
                <i class="fas fa-feather-alt text-amber-600 text-xs"></i> Style
              </h4>
              <div class="grid grid-cols-2 gap-1">
                <label v-for="style in styles" :key="style.value" class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" :value="style.value" v-model="filters.style" class="w-3.5 h-3.5 text-amber-600">
                  <span class="text-stone-600 text-sm">{{ style.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- Active Filters Display -->
            <div class="mt-3 pt-3 border-t border-amber-100">
              <p class="text-xs text-stone-500 mb-1">Active:</p>
              <div class="flex flex-wrap gap-1">
                <span v-if="filters.metal !== 'all'" class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  {{ getMetalLabel(filters.metal) }} <i @click="filters.metal = 'all'" class="fas fa-times cursor-pointer hover:text-amber-950"></i>
                </span>
                <span v-if="filters.price !== 'all'" class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  {{ getPriceLabel(filters.price) }} <i @click="filters.price = 'all'" class="fas fa-times cursor-pointer hover:text-amber-950"></i>
                </span>
                <span v-if="filters.gem !== 'all'" class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  {{ getGemLabel(filters.gem) }} <i @click="filters.gem = 'all'" class="fas fa-times cursor-pointer hover:text-amber-950"></i>
                </span>
                <span v-if="filters.style !== 'all'" class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  {{ getStyleLabel(filters.style) }} <i @click="filters.style = 'all'" class="fas fa-times cursor-pointer hover:text-amber-950"></i>
                </span>
                <span v-if="activeFilterCount === 0" class="text-stone-400 text-[10px]">No active filters</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- PRODUCTS GRID -->
        <div class="flex-1">
          <p class="text-stone-500 text-sm mb-3">Showing {{ filteredProducts.length }} of {{ allProducts.length }} products</p>
          <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            <div v-for="product in filteredProducts" :key="product.id" class="product-card group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <router-link :to="`/product/${product.id}`" class="block">
                <div class="h-44 sm:h-52 md:h-64 overflow-hidden relative">
                  <img :src="product.image" :alt="product.name" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" @error="handleImageError">
                  <div v-if="product.badge" class="absolute top-1 right-1 bg-amber-100/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[8px] md:text-[10px] font-semibold text-amber-800">
                    {{ product.badge }}
                  </div>
                </div>
                <div class="p-2 md:p-3">
                  <h3 class="font-playfair text-xs sm:text-sm md:text-base font-semibold text-stone-800 leading-tight">{{ product.name }}</h3>
                  <p class="text-stone-500 text-[9px] sm:text-xs mt-0.5">{{ product.metal || 'N/A' }} · {{ product.gemstone || 'N/A' }}</p>
                  <div class="flex justify-between items-center mt-1.5 md:mt-2">
                    <!-- Display dynamic price if available, otherwise use original -->
                    <span class="text-amber-700 font-bold text-xs sm:text-sm md:text-base">
                      ${{ (product.dynamicPrice || product.price || 0).toLocaleString() }}
                    </span>
                    <div class="flex gap-1">
                      <button @click.prevent="toggleWishlist(product)" class="w-5 h-5 md:w-7 md:h-7 rounded-full bg-amber-100 transition flex items-center justify-center" :class="isInWishlist(product.id) ? 'text-pink-600 bg-pink-100' : 'text-amber-600 hover:bg-pink-100 hover:text-pink-600'">
                        <i :class="isInWishlist(product.id) ? 'fas fa-heart' : 'far fa-heart'" class="text-[9px] md:text-xs"></i>
                      </button>
                      <button @click.prevent="addToCart(product)" class="w-5 h-5 md:w-7 md:h-7 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white transition flex items-center justify-center">
                        <i class="fas fa-shopping-bag text-[9px] md:text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <!-- Live price indicator for metal items -->
                  <div v-if="product.goldWeight || product.silverWeight" class="text-[8px] text-green-500 mt-0.5 flex items-center gap-1">
                    <span class="w-1 h-1 bg-green-500 rounded-full"></span>
                    Live price
                  </div>
                </div>
              </router-link>
            </div>
          </div>
          
          <div v-if="filteredProducts.length === 0" class="text-center py-10">
            <i class="fas fa-search text-4xl text-amber-300 mb-3"></i>
            <p class="text-stone-600">No products match your filters.</p>
            <button @click="clearAllFilters" class="mt-3 text-amber-600 underline text-sm">Clear all filters</button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()

// Initialize scroll animations
useScrollAnimation()

// Get category from URL
const currentCategory = computed(() => route.params.category)

// Gold and Silver prices for dynamic pricing
const goldPrice = ref(85.50)
const silverPrice = ref(0.85)
const DEFAULT_GOLD_PRICE = 85.50
const DEFAULT_SILVER_PRICE = 0.85

// Fetch metal prices
const fetchMetalPrices = async () => {
  try {
    // Try cache first
    const cachedGold = localStorage.getItem('soutou_gold_price')
    const cachedSilver = localStorage.getItem('soutou_silver_price')
    const cachedDate = localStorage.getItem('soutou_metal_price_date')
    
    if (cachedGold && cachedSilver && cachedDate) {
      const hoursOld = (Date.now() - parseInt(cachedDate)) / (1000 * 60 * 60)
      if (hoursOld < 6) {
        goldPrice.value = parseFloat(cachedGold)
        silverPrice.value = parseFloat(cachedSilver)
        return
      }
    }
    
    // Fetch from API
    const [goldRes, silverRes] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU'),
      fetch('https://api.gold-api.com/price/XAG')
    ])
    
    if (goldRes.ok) {
      const data = await goldRes.json()
      goldPrice.value = data.price || DEFAULT_GOLD_PRICE
      localStorage.setItem('soutou_gold_price', String(goldPrice.value))
    }
    
    if (silverRes.ok) {
      const data = await silverRes.json()
      silverPrice.value = data.price || DEFAULT_SILVER_PRICE
      localStorage.setItem('soutou_silver_price', String(silverPrice.value))
    }
    
    localStorage.setItem('soutou_metal_price_date', String(Date.now()))
    
  } catch (error) {
    console.error('Error fetching metal prices:', error)
    goldPrice.value = DEFAULT_GOLD_PRICE
    silverPrice.value = DEFAULT_SILVER_PRICE
  }
}

// Calculate dynamic price for a product
const calculateDynamicPrice = (product) => {
  if (!product) return product?.price || 0
  
  let price = product.price || 0
  const goldWeight = product.goldWeight || 0
  const silverWeight = product.silverWeight || 0
  
  // If product has gold, calculate based on current gold price
  if (goldWeight > 0 && goldPrice.value) {
    const originalGoldCost = goldWeight * DEFAULT_GOLD_PRICE
    const goldCost = goldWeight * goldPrice.value
    const otherCosts = Math.max(0, price - originalGoldCost)
    price = Math.round(goldCost + otherCosts)
  }
  
  // If product has silver, calculate based on current silver price
  if (silverWeight > 0 && silverPrice.value) {
    const originalSilverCost = silverWeight * DEFAULT_SILVER_PRICE
    const silverCost = silverWeight * silverPrice.value
    const otherCosts = Math.max(0, price - originalSilverCost)
    price = Math.round(silverCost + otherCosts)
  }
  
  // If product has BOTH gold and silver
  if (goldWeight > 0 && silverWeight > 0 && goldPrice.value && silverPrice.value) {
    const originalGoldCost = goldWeight * DEFAULT_GOLD_PRICE
    const originalSilverCost = silverWeight * DEFAULT_SILVER_PRICE
    const goldCost = goldWeight * goldPrice.value
    const silverCost = silverWeight * silverPrice.value
    const otherCosts = Math.max(0, price - originalGoldCost - originalSilverCost)
    price = Math.round(goldCost + silverCost + otherCosts)
  }
  
  return price
}

// Define all products by category with filter properties and metal weights
const productsByCategory = {
  necklaces: [
    { id: 1, name: 'Celestial Diamond Necklace', price: 3850, image: '/necklace2.webp', metal: 'Gold', gemstone: 'Diamond', badge: 'Best Seller', metalFilter: 'gold', priceRange: '3000-plus', gemFilter: 'diamond', styleFilter: 'classic', goldWeight: 3.8 },
    { id: 2, name: 'Silver Diamond Pendant', price: 2450, image: '/necklace3.jpg', metal: 'Silver', gemstone: 'Diamond', badge: 'New', metalFilter: 'silver', priceRange: '1500-3000', gemFilter: 'diamond', styleFilter: 'modern', silverWeight: 4.5 },
    { id: 3, name: 'Gold Necklace', price: 1890, image: '/necklace4.jpg', metal: 'Gold', gemstone: 'None', badge: null, metalFilter: 'gold', priceRange: '1500-3000', gemFilter: 'none', styleFilter: 'minimalist', goldWeight: 2.0 },
    { id: 4, name: 'Gold Necklace', price: 5290, image: '/necklace5.jpg', metal: 'Gold', gemstone: 'None', badge: 'Limited', metalFilter: 'gold', priceRange: '3000-plus', gemFilter: 'none', styleFilter: 'classic', goldWeight: 5.5 },
    { id: 5, name: 'Gold Diamond Necklace', price: 5290, image: '/necklace6.jpg', metal: 'Gold', gemstone: 'Diamond', badge: 'Limited', metalFilter: 'gold', priceRange: '3000-plus', gemFilter: 'diamond', styleFilter: 'vintage', goldWeight: 4.2 },
    { id: 6, name: 'Silver Diamond Necklace', price: 5290, image: '/necklace7.jpg', metal: 'Silver', gemstone: 'Diamond', badge: 'Limited', metalFilter: 'silver', priceRange: '3000-plus', gemFilter: 'diamond', styleFilter: 'classic', silverWeight: 6.0 }
  ],
  earrings: [
    { id: 101, name: 'Gold Earrings', price: 5290, image: '/earring1.avif', metal: 'Gold', gemstone: 'None', badge: 'Best Seller', metalFilter: 'gold', priceRange: '3000-plus', gemFilter: 'none', styleFilter: 'classic', goldWeight: 5.2 },
    { id: 102, name: 'Rose Gold Diamond Earrings', price: 1890, image: '/earring2.jpg', metal: 'Rose Gold', gemstone: 'Diamond', badge: 'New', metalFilter: 'rose-gold', priceRange: '1500-3000', gemFilter: 'diamond', styleFilter: 'modern', goldWeight: 2.8 },
    { id: 103, name: 'Rose Gold Diamond Hoops', price: 890, image: '/earring3.jpg', metal: 'Rose Gold', gemstone: 'Diamond', badge: null, metalFilter: 'rose-gold', priceRange: '500-1500', gemFilter: 'diamond', styleFilter: 'minimalist', goldWeight: 0 },
    { id: 104, name: 'Gold Diamond Studs', price: 2450, image: '/earring4.jpg', metal: 'Gold', gemstone: 'Diamond', badge: 'Limited', metalFilter: 'gold', priceRange: '1500-3000', gemFilter: 'diamond', styleFilter: 'classic', goldWeight: 1.5 },
    { id: 105, name: 'Gold Earrings', price: 2450, image: '/earring5.jpg', metal: 'Gold', gemstone: 'None', badge: 'Limited', metalFilter: 'gold', priceRange: '1500-3000', gemFilter: 'none', styleFilter: 'vintage', goldWeight: 3.2 },
    { id: 106, name: 'Gold Earrings', price: 2450, image: '/earring6.jpg', metal: 'Gold', gemstone: 'None', badge: 'Limited', metalFilter: 'gold', priceRange: '1500-3000', gemFilter: 'none', styleFilter: 'modern', goldWeight: 2.9 }
  ],
  rings: [
    { id: 201, name: 'Silver Diamond Ring', price: 2975, image: '/ring1.jpg', metal: 'Silver', gemstone: 'Diamond', badge: 'Best Seller', metalFilter: 'silver', priceRange: '1500-3000', gemFilter: 'diamond', styleFilter: 'classic', silverWeight: 3.5 },
    { id: 202, name: 'Rose Gold Morganite Ring', price: 1590, image: '/ring2.webp', metal: 'Rose Gold', gemstone: 'Morganite', badge: 'New', metalFilter: 'rose-gold', priceRange: '1500-3000', gemFilter: 'morganite', styleFilter: 'modern', goldWeight: 2.8 },
    { id: 203, name: 'Silver Diamond Ring', price: 2250, image: '/ring3.jpg', metal: 'Silver', gemstone: 'Diamond', badge: null, metalFilter: 'silver', priceRange: '1500-3000', gemFilter: 'diamond', styleFilter: 'classic', silverWeight: 2.5 },
    { id: 204, name: 'Gold Ring', price: 3450, image: '/ring4.jpg', metal: 'Gold', gemstone: 'None', badge: 'Limited', metalFilter: 'gold', priceRange: '3000-plus', gemFilter: 'none', styleFilter: 'classic', goldWeight: 4.5 },
    { id: 205, name: 'Gold Ring', price: 450, image: '/ring5.jpg', metal: 'Gold', gemstone: 'None', badge: null, metalFilter: 'gold', priceRange: 'under-500', gemFilter: 'none', styleFilter: 'minimalist', goldWeight: 1.2 },
    { id: 206, name: 'Gold Diamond Ring', price: 2450, image: '/ring6.jpg', metal: 'Gold', gemstone: 'Diamond', badge: 'Limited', metalFilter: 'gold', priceRange: '1500-3000', gemFilter: 'diamond', styleFilter: 'vintage', goldWeight: 3.2 }
  ],
  bracelets: [
    { id: 301, name: 'Silver Diamond Bracelet', price: 299, image: '/bracelet1.webp', metal: 'Silver', gemstone: 'Diamond', badge: 'Best Seller', metalFilter: 'silver', priceRange: 'under-500', gemFilter: 'diamond', styleFilter: 'classic', silverWeight: 1.8 },
    { id: 302, name: 'Gold Diamond Tennis Bracelet', price: 2890, image: '/bracelet2.jpg', metal: 'Gold', gemstone: 'Diamond', badge: 'New', metalFilter: 'gold', priceRange: '1500-3000', gemFilter: 'diamond', styleFilter: 'classic', goldWeight: 5.0 },
    { id: 303, name: 'Gold Diamond Chain Bracelet', price: 590, image: '/bracelet3.jpg', metal: 'Gold', gemstone: 'Diamond', badge: null, metalFilter: 'gold', priceRange: '500-1500', gemFilter: 'diamond', styleFilter: 'modern', goldWeight: 0.8 },
    { id: 304, name: 'Silver Diamond Bracelet', price: 450, image: '/bracelet4.jpg', metal: 'Silver', gemstone: 'Diamond', badge: 'Limited', metalFilter: 'silver', priceRange: 'under-500', gemFilter: 'diamond', styleFilter: 'vintage', silverWeight: 2.0 },
    { id: 305, name: 'Silver Diamond Bracelet', price: 450, image: '/bracelet5.jpg', metal: 'Silver', gemstone: 'Diamond', badge: 'Limited', metalFilter: 'silver', priceRange: 'under-500', gemFilter: 'diamond', styleFilter: 'minimalist', silverWeight: 1.8 },
    { id: 306, name: 'Silver Diamond Bracelet', price: 450, image: '/bracelet6.jpg', metal: 'Silver', gemstone: 'Diamond', badge: 'Limited', metalFilter: 'silver', priceRange: 'under-500', gemFilter: 'diamond', styleFilter: 'classic', silverWeight: 2.2 }
  ]
}

// Page title based on category
const pageTitle = computed(() => {
  const titles = {
    necklaces: 'Necklaces & Pendants',
    earrings: 'Earrings & Drops',
    rings: 'Rings & Bands',
    bracelets: 'Bracelets & Bangles'
  }
  return titles[currentCategory.value] || 'Products'
})

// Get products for current category with dynamic prices
const allProducts = computed(() => {
  const category = currentCategory.value
  if (category && productsByCategory[category]) {
    return productsByCategory[category].map(product => ({
      ...product,
      dynamicPrice: calculateDynamicPrice(product)
    }))
  }
  return []
})

// Check if product is in wishlist
const isInWishlist = (productId) => {
  return wishlistStore.isInWishlist(productId)
}

// Toggle wishlist
const toggleWishlist = (product) => {
  wishlistStore.toggleWishlist({
    id: product.id,
    name: product.name,
    price: product.dynamicPrice || product.price,
    image: product.image,
    category: currentCategory.value,
    badge: product.badge
  })
}

// Filter options
const metals = [
  { value: 'all', label: 'All' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'rose-gold', label: 'Rose Gold' },
  { value: 'platinum', label: 'Platinum' }
]

const priceRanges = [
  { value: 'all', label: 'All' },
  { value: 'under-500', label: 'Under $500' },
  { value: '500-1500', label: '$500 - $1.5k' },
  { value: '1500-3000', label: '$1.5k - $3k' },
  { value: '3000-plus', label: '$3k+' }
]

const gems = [
  { value: 'all', label: 'All' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'pearl', label: 'Pearl' },
  { value: 'sapphire', label: 'Sapphire' },
  { value: 'morganite', label: 'Morganite' },
  { value: 'none', label: 'No Gemstone' }
]

const styles = [
  { value: 'all', label: 'All' },
  { value: 'classic', label: 'Classic' },
  { value: 'modern', label: 'Modern' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'minimalist', label: 'Minimalist' }
]

// Filters state
const filters = ref({
  metal: 'all',
  price: 'all',
  gem: 'all',
  style: 'all'
})

// Computed
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.metal !== 'all') count++
  if (filters.value.price !== 'all') count++
  if (filters.value.gem !== 'all') count++
  if (filters.value.style !== 'all') count++
  return count
})

const filteredProducts = computed(() => {
  return allProducts.value.filter(product => {
    const matchMetal = filters.value.metal === 'all' || product.metalFilter === filters.value.metal
    const matchPrice = filters.value.price === 'all' || product.priceRange === filters.value.price
    const matchGem = filters.value.gem === 'all' || product.gemFilter === filters.value.gem
    const matchStyle = filters.value.style === 'all' || product.styleFilter === filters.value.style
    return matchMetal && matchPrice && matchGem && matchStyle
  })
})

// Helper functions
const getMetalLabel = (value) => {
  return metals.find(m => m.value === value)?.label || value
}

const getPriceLabel = (value) => {
  return priceRanges.find(p => p.value === value)?.label || value
}

const getGemLabel = (value) => {
  return gems.find(g => g.value === value)?.label || value
}

const getStyleLabel = (value) => {
  return styles.find(s => s.value === value)?.label || value
}

const clearAllFilters = () => {
  filters.value = {
    metal: 'all',
    price: 'all',
    gem: 'all',
    style: 'all'
  }
}

// ========== ✅ ADD TO CART - USES DYNAMIC PRICE ==========
const addToCart = (product) => {
  const dynamicPrice = product.dynamicPrice || product.price || 0;
  
  cartStore.addToCart(
    {
      id: product.id,
      name: product.name,
      price: dynamicPrice, // ✅ Use dynamic price
      image: product.image,
      quantity: 1,
      goldPrice: goldPrice.value || null,
      silverPrice: silverPrice.value || null,
      goldWeight: product.goldWeight || 0,
      silverWeight: product.silverWeight || 0,
      metalType: product.metal || 'none',
      originalPrice: product.price // Store original for reference
    },
    authStore.isAuthenticated,
    authStore.openAuthModal
  )
}

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/400x500/amber/white?text=Image+Not+Found'
}

// Reset filters when category changes
watch(currentCategory, () => {
  clearAllFilters()
})

// Fetch metal prices on mount
onMounted(() => {
  fetchMetalPrices()
})
</script>