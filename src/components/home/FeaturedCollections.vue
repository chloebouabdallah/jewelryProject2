<template>
  <section class="py-16 md:py-24 px-4 md:px-5 bg-[#f5e6d8]">
    <div class="max-w-7xl mx-auto text-center mb-10 md:mb-16 fade-on-scroll fade-up">
      <span class="text-amber-700 tracking-widest text-[10px] md:text-sm uppercase font-semibold">Timeless treasures</span>
      <h2 class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold font-playfair mt-2 text-stone-800">{{ sectionTitle || 'Signature Collections' }}</h2>
      <div class="w-16 md:w-24 h-0.5 bg-amber-500 mx-auto mt-3 md:mt-4 rounded-full"></div>
      <p class="text-stone-600 text-sm md:text-base max-w-2xl mx-auto mt-3 md:mt-5">Each piece is a masterpiece of rare gemstones and delicate craftsmanship.</p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-10">
      <i class="fas fa-spinner fa-spin text-3xl text-amber-600"></i>
      <p class="text-stone-500 mt-2">Loading collections...</p>
    </div>
    
    <!-- Collections Grid -->
    <div v-else-if="displayCollections.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
      <router-link 
        v-for="(collection, index) in displayCollections" 
        :key="collection.id || index"
        :to="`/product/${collection.slug || collection.id}`"
        class="group rounded-2xl overflow-hidden shadow-md bg-white cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 fade-on-scroll fade-up"
        :style="{ transitionDelay: `${(index + 1) * 0.1}s` }"
      >
        <div class="h-64 md:h-72 overflow-hidden relative">
          <img :src="collection.image" :alt="collection.name" class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110" @error="handleImageError">
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div v-if="collection.badge && collection.badge !== 'none'" class="absolute top-3 right-3 bg-amber-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {{ collection.badge.replace('_', ' ').toUpperCase() }}
          </div>
        </div>
        <div class="p-4 md:p-6">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl md:text-2xl font-bold font-playfair">{{ collection.name }}</h3>
              <p class="text-gray-500 text-xs md:text-sm mt-1">{{ collection.category || collection.displayText || '' }}</p>
            </div>
            <span class="text-amber-700 font-semibold text-base md:text-lg">${{ collection.price.toLocaleString() }}</span>
          </div>
          <div class="flex mt-3 md:mt-4 gap-2 flex-wrap">
            <span v-for="tag in getCollectionTags(collection)" :key="tag" class="text-[10px] md:text-xs bg-amber-50 px-2 md:px-3 py-1 rounded-full text-amber-700">{{ tag }}</span>
          </div>
        </div>
      </router-link>
    </div>
    
    <div v-else class="text-center py-10">
      <p class="text-stone-500">No collections available.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOsimartProductsStore } from '@/stores/osimartProducts'

const productStore = useOsimartProductsStore()
const isLoading = ref(true)
const sectionTitle = ref('Signature Collections')
const sectionProducts = ref([])

// ============================================
// FETCH PRODUCTS - 1 Necklace, 1 Earring, 1 Ring
// ============================================
const fetchProducts = async () => {
  try {
    isLoading.value = true
    
    // Load products if not loaded
    let allProducts = productStore.products || []
    if (allProducts.length === 0) {
      await productStore.fetchProducts()
      allProducts = productStore.products || []
    }
    
    const mappedProducts = productStore.mapProducts(allProducts)
    console.log(`📦 Total products: ${mappedProducts.length}`)
    
    // Filter valid products (with name and image)
    const validProducts = mappedProducts.filter(p => p.name && p.image)
    
    // Group products by category
    const necklaces = validProducts.filter(p => 
      p.category && (p.category.toLowerCase().includes('necklace') || 
                     p.category.toLowerCase().includes('pendant'))
    )
    
    const earrings = validProducts.filter(p => 
      p.category && (p.category.toLowerCase().includes('earring') || 
                     p.category.toLowerCase().includes('ear'))
    )
    
    const rings = validProducts.filter(p => 
      p.category && (p.category.toLowerCase().includes('ring') || 
                     p.category.toLowerCase().includes('band'))
    )
    
    console.log(`📦 Found: ${necklaces.length} necklaces, ${earrings.length} earrings, ${rings.length} rings`)
    
    // Select one from each category
    const selected = []
    
    // Pick a necklace (prefer with badge)
    if (necklaces.length > 0) {
      const bestNecklace = necklaces.find(p => p.badge && p.badge !== 'none') || necklaces[1]
      selected.push(bestNecklace)
    }
    
    // Pick an earring (prefer with badge)
    if (earrings.length > 0) {
      const bestEarring = earrings.find(p => p.badge && p.badge !== 'none') || earrings[4]
      selected.push(bestEarring)
    }
    
    // Pick a ring (prefer with badge)
    if (rings.length > 0) {
      const bestRing = rings.find(p => p.badge && p.badge !== 'none') || rings[10]
      selected.push(bestRing)
    }
    
    // If we don't have 3 products, fill with any products
    if (selected.length < 3) {
      const existingIds = selected.map(p => p.id)
      const remaining = validProducts.filter(p => !existingIds.includes(p.id))
      const needed = 3 - selected.length
      selected.push(...remaining.slice(0, needed))
    }
    
    sectionProducts.value = selected.slice(0, 3)
    console.log(`✅ Selected ${sectionProducts.value.length} products for Signature Collections`)
    
  } catch (error) {
    console.error('❌ Failed to fetch products:', error)
    sectionProducts.value = []
  } finally {
    isLoading.value = false
  }
}

const displayCollections = computed(() => sectionProducts.value)

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/600x800/amber/white?text=Image+Not+Found'
}

const getCollectionTags = (product) => {
  const tags = []
  
  if (product.metalType && product.metalType !== 'none') {
    tags.push(product.metalType.replace('-', ' ').toUpperCase())
  }
  
  if (product.gemstone && product.gemstone !== 'none') {
    tags.push(product.gemstone)
  }
  
  if (product.badge && product.badge !== 'none') {
    tags.push(product.badge.replace('_', ' ').toUpperCase())
  }
  
  if (tags.length === 0) {
    tags.push('Luxury', 'Handcrafted')
  }
  
  return tags.slice(0, 3)
}

onMounted(async () => {
  await fetchProducts()
})
</script>