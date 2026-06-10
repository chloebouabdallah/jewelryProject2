import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Create a singleton instance outside the function
const isSearchOpen = ref(false)
const searchQuery = ref('')

export function useSearch() {
  const router = useRouter()
  
  const categoryMap = [
    { keywords: ['ring', 'rings', 'engagement ring'], url: '/rings' },
    { keywords: ['necklace', 'necklaces', 'pendant'], url: '/necklaces' },
    { keywords: ['earring', 'earrings', 'studs'], url: '/earrings' },
    { keywords: ['bracelet', 'bracelets', 'bangle'], url: '/bracelets' }
  ]
  
  function openSearch() {
    console.log('Opening search') // Debug log
    isSearchOpen.value = true
  }
  
  function closeSearch() {
    console.log('Closing search') // Debug log
    isSearchOpen.value = false
    searchQuery.value = ''
  }
  
  function handleSearch() {
    const query = searchQuery.value.trim().toLowerCase()
    console.log('Searching for:', query) // Debug log
    if (query === '') {
      closeSearch()
      return
    }
    
    let matchedUrl = null
    for (const category of categoryMap) {
      for (const keyword of category.keywords) {
        if (query.includes(keyword)) {
          matchedUrl = category.url
          break
        }
      }
      if (matchedUrl) break
    }
    
    if (!matchedUrl) matchedUrl = '/collections'
    
    closeSearch()
    router.push(matchedUrl)
  }
  
  return {
    isSearchOpen,
    searchQuery,
    openSearch,
    closeSearch,
    handleSearch
  }
}