// src/services/cartService.js
import apiClient from './osimart'

export const cartService = {
  async viewCart() {
    try {
      const response = await apiClient.get('/cart/view/')
      return response.data
    } catch (error) {
      console.error('Error fetching cart:', error)
      throw error
    }
  },

  async addItem(productId, quantity = 1) {
    try {
      const response = await apiClient.post('/cart/update-item/', {
        item_id: productId,
        action: 'add',
        quantity: quantity
      })
      return response.data
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  },

  async updateItem(productId, quantity) {
    try {
      const response = await apiClient.post('/cart/update-item/', {
        item_id: productId,
        action: 'add',
        quantity: quantity
      })
      return response.data
    } catch (error) {
      console.log(error.response?.data)
      throw error
    }
  },

  async removeItem(productId) {
    try {
      const response = await apiClient.post('/cart/update-item/', {
        item_id: productId,
        action: 'remove_all'
      })
      return response.data
    } catch (error) {
      console.log(error.response?.data)
      throw error
    }
  },

  async clearCart() {
    try {
      // First get current cart
      const cartData = await this.viewCart()
      
      if (cartData && cartData.cart) {
        const cartItems = Object.values(cartData.cart)
        
        // Remove each item
        for (const item of cartItems) {
          try {
            await this.removeItem(item.id)
          } catch (removeErr) {
            console.warn('⚠️ Failed to remove item:', item.name, removeErr.message)
          }
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  }
}