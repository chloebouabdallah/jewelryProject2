<template>
  <div id="searchBarContainer" class="search-bar-container" :class="{ active: isSearchOpen }">
    <div class="py-3 px-5">
      <div class="max-w-[400px] mx-auto">
        <div class="relative">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
          <input 
            type="text" 
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            placeholder="Search for rings, necklaces, earrings..." 
            class="w-full pl-10 pr-10 py-2.5 rounded-full border border-amber-300 focus:border-amber-500 focus:outline-none text-stone-800 text-sm bg-white shadow-lg"
            ref="searchInputRef"
          >
          <button @click="closeSearch" class="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600 transition">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSearchOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)

// Category mapping for search - order matters! More specific first
const categoryMap = [
  { keywords: ['earring', 'earrings', 'studs', 'hoops', 'drops', 'chandelier'], route: '/earrings', exact: true },
  { keywords: ['necklace', 'necklaces', 'pendant', 'chain', 'choker'], route: '/necklaces', exact: true },
  { keywords: ['bracelet', 'bracelets', 'bangle', 'tennis bracelet', 'cuff'], route: '/bracelets', exact: true },
  { keywords: ['ring', 'rings', 'engagement ring', 'wedding ring', 'band'], route: '/rings', exact: true }
]

const openSearch = () => {
  isSearchOpen.value = true
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

const closeSearch = () => {
  isSearchOpen.value = false
  searchQuery.value = ''
}

const handleSearch = () => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    closeSearch()
    return
  }
  
  let matchedRoute = null
  
  // Check each category
  for (const category of categoryMap) {
    for (const keyword of category.keywords) {
      // Check if the query matches the keyword exactly or if the keyword is the whole word
      // This prevents "earring" matching "ring"
      if (query === keyword || query.includes(keyword) && !keyword.includes(query) && keyword.length > 3) {
        // Additional check: if query contains "earring" and keyword is "ring", skip
        if (query.includes('earring') && keyword === 'ring') {
          continue
        }
        if (query.includes('earrings') && keyword === 'ring') {
          continue
        }
        matchedRoute = category.route
        break
      }
    }
    if (matchedRoute) break
  }
  
  // If no exact match, try partial match but avoid conflicts
  if (!matchedRoute) {
    if (query.includes('earring') || query.includes('studs') || query.includes('hoops')) {
      matchedRoute = '/earrings'
    } else if (query.includes('necklace') || query.includes('pendant')) {
      matchedRoute = '/necklaces'
    } else if (query.includes('bracelet') || query.includes('bangle')) {
      matchedRoute = '/bracelets'
    } else if (query.includes('ring')) {
      matchedRoute = '/rings'
    }
  }
  
  closeSearch()
  
  if (matchedRoute) {
    router.push(matchedRoute)
  } else {
    router.push('/collections')
  }
}

// Handle escape key
const handleEscape = (e) => {
  if (e.key === 'Escape' && isSearchOpen.value) {
    closeSearch()
  }
}

// Expose methods to parent component
defineExpose({
  openSearch,
  closeSearch
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.search-bar-container {
  position: fixed;
  top: 73px;
  left: 0;
  right: 0;
  z-index: 49;
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s ease-out;
  background-color: transparent;
}

.search-bar-container.active {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}
</style>