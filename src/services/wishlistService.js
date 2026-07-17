// src/services/wishlistService.js
import apiClient from './osimart'

export const wishlistService = {
    async getWishlist() {
        try {
            // Try to fetch from API
            const response = await apiClient.get('/wishlist/')
            return response.data
        } catch (error) {
            console.warn('⚠️ Wishlist API not available, using localStorage')
            // Fallback to localStorage
            return getLocalWishlist()
        }
    },

    async updateWishlist(productId, action) {
        try {
            // Try to update via API
            const response = await apiClient.post('/wishlist/', {
                product_id: productId,
                action
            })
            return response.data
        } catch (error) {
            console.warn('⚠️ Wishlist API not available, using localStorage')
            // Fallback to localStorage
            return updateLocalWishlist(productId, action)
        }
    }
}

// ============================================
// LOCAL STORAGE FALLBACK
// ============================================
function getLocalWishlist() {
    try {
        const key = getStorageKey()
        const saved = localStorage.getItem(key)
        return saved ? JSON.parse(saved) : []
    } catch (e) {
        return []
    }
}

function updateLocalWishlist(productId, action) {
    let wishlist = getLocalWishlist()
    
    if (action === 'add') {
        if (!wishlist.includes(productId)) {
            wishlist.push(productId)
        }
    } else if (action === 'remove') {
        wishlist = wishlist.filter(id => id !== productId)
    }
    
    try {
        const key = getStorageKey()
        localStorage.setItem(key, JSON.stringify(wishlist))
    } catch (e) {
        console.warn('Failed to save wishlist:', e)
    }
    
    return { success: true }
}

function getStorageKey() {
    const userEmail = localStorage.getItem('soutou_user_email') || 'guest'
    return `soutouWishlist_${userEmail}`
}