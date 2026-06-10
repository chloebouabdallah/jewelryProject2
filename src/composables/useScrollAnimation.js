import { onMounted, onUnmounted } from 'vue'

export function useScrollAnimation() {
  const checkFadeIn = () => {
    const elements = document.querySelectorAll('.fade-on-scroll')
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Check if element is in viewport (works for both up and down scroll)
      if (rect.top < windowHeight - 100 && rect.bottom > 0) {
        element.classList.add('visible')
      } else {
        // Remove class when element is out of view (so it animates again when scrolling back up)
        element.classList.remove('visible')
      }
    })
  }
  
  onMounted(() => {
    // Initial check
    setTimeout(checkFadeIn, 100)
    
    // Add scroll listener
    window.addEventListener('scroll', checkFadeIn)
    window.addEventListener('resize', checkFadeIn)
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', checkFadeIn)
    window.removeEventListener('resize', checkFadeIn)
  })
  
  return { checkFadeIn }
}