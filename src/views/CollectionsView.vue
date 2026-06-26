<template>
  <main>
    <!-- Hero -->
    <section
      class="pt-28 md:pt-32 pb-12 md:pb-20 px-5 bg-gradient-to-br from-[#f5e6d8] via-[#efe0d2] to-[#f5e6d8]"
    >
      <div class="max-w-7xl mx-auto text-center">
        <span
          class="text-amber-700 tracking-[0.2em] text-xs md:text-sm uppercase font-semibold animate-fade-scale"
          >Discover By Category</span
        >
        <h1
          class="font-playfair text-3xl md:text-5xl lg:text-7xl font-light text-stone-800 mb-3 md:mb-4 animate-fade-scale"
        >
          Shop by Collection
        </h1>
        <div
          class="w-16 md:w-24 h-0.5 bg-amber-500 mx-auto mb-4 md:mb-6 rounded-full animate-fade-scale"
        ></div>
        <p
          class="text-stone-600 text-sm md:text-lg max-w-2xl mx-auto animate-fade-scale"
        >
          Find the perfect piece that speaks to your soul, curated by category.
        </p>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- CATEGORIES - Dynamically fetched from Osimart -->
    <!-- ============================================ -->

    <!-- Loading State -->
    <div v-if="categoryStore.isLoading" class="py-20 text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-amber-600"></i>
      <p class="text-stone-500 mt-4">Loading collections...</p>
    </div>

    <!-- No Categories -->
    <div v-else-if="displayCategories.length === 0" class="py-20 text-center">
      <i class="fas fa-box-open text-4xl text-amber-300 mb-4"></i>
      <p class="text-stone-500">No collections available</p>
    </div>

    <!-- Categories Grid - Same styling as before -->
    <template v-else>
      <section
        v-for="(category, index) in displayCategories"
        :key="category.id"
        class="py-12 md:py-28 overflow-hidden"
        :class="index % 2 === 0 ? 'bg-gradient-to-r from-[#f5e6d8] to-[#efe0d2]' : 'bg-gradient-to-l from-[#f5e6d8] to-[#efe0d2]'"
      >
        <div class="max-w-7xl mx-auto px-5 md:px-8">
          <div
            class="flex flex-col md:flex-row items-center gap-6 md:gap-0 group"
            :class="index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'"
          >
            <!-- Image -->
            <div class="md:w-1/2 relative group/image fade-on-scroll fade-right">
              <div
                class="relative w-full max-w-sm md:max-w-md mx-auto"
                :class="index % 2 === 0 ? 'md:mr-auto md:ml-0' : 'md:ml-auto md:mr-0'"
              >
                <div
                  class="relative overflow-hidden shadow-2xl transition-all duration-500 group-hover/image:shadow-2xl group-hover/image:shadow-amber-900/30 group-hover/image:scale-[1.02]"
                  :class="index % 2 === 0 
                    ? 'rounded-tr-[40px] md:rounded-tr-[80px] rounded-bl-[40px] md:rounded-bl-[80px] rounded-tl-xl rounded-bl-xl' 
                    : 'rounded-tl-[40px] md:rounded-tl-[80px] rounded-br-[40px] md:rounded-br-[80px] rounded-tr-xl rounded-bl-xl'"
                >
                  <img
                    :src="getCategoryImage(category)"
                    :alt="category.name + ' Collection'"
                    class="w-full h-auto object-cover aspect-[4/5] transition-all duration-700 ease-out group-hover/image:scale-110"
                    @error="(e) => { e.target.src = '/placeholder-collection.jpg' }"
                  />
                </div>
                <!-- Decorative corner - matches your original styling -->
                <div
                  class="absolute w-10 h-10 md:w-20 md:h-20 border-amber-300/50 pointer-events-none transition-all duration-300 group-hover/image:border-amber-500/70 group-hover/image:w-14 md:group-hover/image:w-24 group-hover/image:h-14 md:group-hover/image:h-24"
                  :class="index % 2 === 0 
                    ? '-top-3 -left-3 md:-top-4 md:-left-4 border-t-2 border-l-2 rounded-tl-xl md:rounded-tl-2xl' 
                    : '-top-3 -right-3 md:-top-4 md:-right-4 border-t-2 border-r-2 rounded-tr-xl md:rounded-tr-2xl'"
                ></div>
              </div>
            </div>

            <!-- Content -->
            <div
              class="md:w-1/2 flex items-center px-0 md:px-12 lg:px-16 fade-on-scroll fade-left"
              :class="index % 2 === 0 ? 'justify-start pl-0 md:pl-12 lg:pl-16' : 'justify-end pr-0 md:pr-12 lg:pr-16'"
            >
              <div class="max-w-md py-6 md:py-12" :class="index % 2 === 0 ? 'text-left' : 'text-right'">
                
                <!-- Icon & Label - matches your original -->
                <div class="flex items-center gap-2 mb-3 md:mb-4" :class="index % 2 === 0 ? 'justify-start' : 'justify-end'">
                  <i class="fas fa-gem text-xl md:text-2xl text-amber-600"></i>
                  <span
                    class="text-amber-700 tracking-[0.2em] text-[10px] md:text-xs uppercase font-semibold"
                  >
                    {{ getCategoryLabel(category) }}
                  </span>
                </div>
                
                <!-- Title - matches your original -->
                <h2
                  class="font-playfair text-2xl md:text-4xl lg:text-5xl font-light text-stone-800 leading-tight mb-3 md:mb-5"
                >
                  {{ getCategoryTitle(category) }}
                  <span class="font-bold text-amber-800/90">{{ getCategorySuffix(category) }}</span>
                </h2>
                
                <!-- Description - matches your original -->
                <p
                  class="text-stone-700 text-sm md:text-base lg:text-lg leading-relaxed mb-4 md:mb-6"
                >
                  {{ category.description || getDefaultDescription(category) }}
                </p>
                
                <!-- Tags - matches your original -->
                <div class="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6" :class="index % 2 === 0 ? 'justify-start' : 'justify-end'">
                  <span
                    v-for="tag in getCategoryTags(category)"
                    :key="tag"
                    class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold"
                  >
                    {{ tag }}
                  </span>
                </div>
                
                <!-- Buttons - matches your original -->
                <div class="flex flex-wrap gap-3" :class="index % 2 === 0 ? 'justify-start' : 'justify-end'">
                  <router-link
                    :to="`/category/${category.slug}`"
                    class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold transition-all duration-300 hover:gap-3 hover:scale-105 shadow-md text-sm md:text-base"
                  >
                    Explore {{ getCategoryName(category) }}
                    <i class="fas fa-arrow-right text-xs md:text-sm"></i>
                  </router-link>
                  <router-link
                    :to="`/customize?category=${category.slug}`"
                    class="inline-flex items-center gap-2 border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 text-sm md:text-base"
                  >
                    <i class="fas fa-pen-fancy text-xs md:text-sm"></i> Customize
                  </router-link>
                </div>
                
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </template>
    
  </main>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useOsimartCategoriesStore } from '@/stores/osimartCategories'
import { useOsimartProductsStore } from '@/stores/osimartProducts'
import { mediaAPI } from '@/services/osimart'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

// ============================================
// STORES
// ============================================
const categoryStore = useOsimartCategoriesStore()
const productStore = useOsimartProductsStore()
const displayCategories = ref([])

useScrollAnimation()

// ============================================
// COMPUTED
// ============================================
const mappedCategories = computed(() => {
  return categoryStore.mapCategories(categoryStore.categories)
})

// ============================================
// METHODS
// ============================================
function getCategoryImage(category) {
  if (!category) return '/placeholder-collection.jpg'
  const imageUrl = mediaAPI.getImageUrl(category.image)
  return imageUrl
}

function getCategoryName(category) {
  if (!category) return ''
  return category.name
}

function getCategoryLabel(category) {
  if (!category) return 'Collection'
  const name = category.name
  // Map category names to your original labels
  const labels = {
    'Necklaces & Pendants': 'Elegance Defined',
    'Rings & Bands': 'Symbol of Forever',
    'Earrings & Drops': 'Framing Beauty',
    'Bracelets & Bangles': 'Wrist Poetry',
  }
  return labels[name] || 'Timeless Collection'
}

function getCategoryTitle(category) {
  if (!category) return 'Collection'
  const name = category.name
  // Extract main part (e.g., "Necklaces" from "Necklaces & Pendants")
  if (name.includes(' & ')) {
    return name.split(' & ')[0]
  }
  return name
}

function getCategorySuffix(category) {
  if (!category) return ''
  const name = category.name
  if (name.includes(' & ')) {
    return '& ' + name.split(' & ')[1]
  }
  return ''
}

function getDefaultDescription(category) {
  const descriptions = {
    'Necklaces & Pendants': 'Each necklace drapes like a whispered secret, cradling the light as if it were morning dew. From delicate chains to statement pieces, find your perfect layer of elegance.',
    'Rings & Bands': 'Each ring cradles your story — from engagement brilliance to everyday elegance. Our master artisans shape precious metals into organic forms that feel like a second skin.',
    'Earrings & Drops': 'From delicate studs to cascading chandeliers, our earrings frame your face with light and elegance. Each pair is designed to catch every glance and spark conversation.',
    'Bracelets & Bangles': 'Adorn your wrist with timeless elegance. From delicate chains to bold cuffs, each bracelet is crafted to move with you — catching light with every gesture.',
  }
  return descriptions[category.name] || 'Explore our exquisite collection of handcrafted jewelry pieces.'
}

function getCategoryTags(category) {
  if (!category) return []
  const tags = {
    'Necklaces & Pendants': ['18k Gold', 'Diamond', 'Pearl', 'Custom'],
    'Rings & Bands': ['Platinum', 'Sapphire', 'Emerald', 'Rose Gold'],
    'Earrings & Drops': ['Diamond', 'Pearl', 'Hoops', 'Studs'],
    'Bracelets & Bangles': ['Gold', 'Silver', 'Tennis', 'Charm'],
  }
  return tags[category.name] || ['Handcrafted', 'Luxury', 'Timeless']
}

// ============================================
// WATCHERS
// ============================================
watch(mappedCategories, (newCategories) => {
  if (newCategories && newCategories.length > 0) {
    displayCategories.value = newCategories
    console.log('📂 Categories loaded for Collections:', displayCategories.value.length)
  }
}, { immediate: true })

// ============================================
// LIFECYCLE
// ============================================
onMounted(async () => {
  try {
    await categoryStore.fetchCategories()
    console.log('✅ Categories loaded:', categoryStore.categories.length)
    
    await productStore.fetchProducts()
    console.log('✅ Products loaded:', productStore.products.length)
    
  } catch (error) {
    console.error('❌ Failed to load data:', error)
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