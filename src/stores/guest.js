// src/stores/guest.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGuestStore = defineStore('guest', () => {
  // State
  const guest = ref(null)
  const isGuest = ref(false)

  // Getters
  const isGuestUser = computed(() => isGuest.value)
  const currentGuest = computed(() => guest.value)
  const guestName = computed(() => {
    if (!guest.value) return 'Guest'
    return `${guest.value.firstName || ''} ${guest.value.lastName || ''}`.trim() || 'Guest'
  })

  // ============================================
  // SET GUEST
  // ============================================
  function setGuest(guestData) {
    console.log('👤 Setting guest user:', guestData)
    guest.value = guestData
    isGuest.value = true
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('soutou_guest', JSON.stringify(guestData))
      console.log('💾 Guest data saved to localStorage')
    } catch (e) {
      console.warn('Failed to save guest data:', e)
    }
  }

  // ============================================
  // CLEAR GUEST
  // ============================================
  function clearGuest() {
    console.log('🗑️ Clearing guest user')
    guest.value = null
    isGuest.value = false
    try {
      localStorage.removeItem('soutou_guest')
    } catch (e) {
      console.warn('Failed to clear guest data:', e)
    }
  }

  // ============================================
  // LOAD GUEST FROM LOCALSTORAGE
  // ============================================
  function loadGuestFromLocalStorage() {
    try {
      const saved = localStorage.getItem('soutou_guest')
      if (saved) {
        const guestData = JSON.parse(saved)
        console.log('📂 Loading guest from localStorage:', guestData)
        guest.value = guestData
        isGuest.value = true
        return true
      }
    } catch (e) {
      console.warn('Failed to load guest data:', e)
    }
    return false
  }

  // ============================================
  // UPDATE GUEST
  // ============================================
  function updateGuest(guestData) {
    if (guest.value) {
      guest.value = { ...guest.value, ...guestData }
      try {
        localStorage.setItem('soutou_guest', JSON.stringify(guest.value))
        console.log('💾 Guest data updated')
      } catch (e) {
        console.warn('Failed to update guest data:', e)
      }
    }
  }

  return {
    guest,
    isGuest,
    isGuestUser,
    currentGuest,
    guestName,
    setGuest,
    clearGuest,
    loadGuestFromLocalStorage,
    updateGuest
  }
})