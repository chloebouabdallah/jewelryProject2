// src/stores/osimartStock.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { stockAPI } from '@/services/osimart';

export const useOsimartStockStore = defineStore('osimartStock', () => {
  const stockData = ref({});
  const isLoading = ref(false);
  const error = ref(null);

  const totalStock = computed(() => {
    let total = 0;
    Object.keys(stockData.value).forEach(productId => {
      total += stockData.value[productId]?.stock || 0;
    });
    return total;
  });

  const lowStockProducts = computed(() => {
    const low = [];
    Object.keys(stockData.value).forEach(productId => {
      const stock = stockData.value[productId]?.stock || 0;
      if (stock > 0 && stock < 10) {
        low.push({ productId, stock });
      }
    });
    return low;
  });

  const outOfStockProducts = computed(() => {
    const out = [];
    Object.keys(stockData.value).forEach(productId => {
      const stock = stockData.value[productId]?.stock || 0;
      if (stock === 0) {
        out.push(productId);
      }
    });
    return out;
  });

  async function fetchProductStock(productId) {
    if (!productId) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await stockAPI.getProductStock(productId);
      
      let stock = 0;
      if (response.data) {
        stock = response.data.stock || 
                response.data.remaining_stock || 
                response.data.quantity || 
                0;
      }

      stockData.value[productId] = {
        stock: stock,
        lastUpdated: Date.now(),
      };

      return stockData.value[productId];
    } catch (err) {
      error.value = err.message || 'Failed to fetch stock';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchProductsStock(productIds) {
    if (!productIds || productIds.length === 0) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await stockAPI.getProductsStock(productIds);
      
      if (response.data && response.data.results) {
        response.data.results.forEach(item => {
          const productId = item.product_id || item.id;
          const stock = item.stock || item.remaining_stock || item.quantity || 0;
          stockData.value[productId] = {
            stock: stock,
            lastUpdated: Date.now(),
          };
        });
      }
    } catch (err) {
      // If bulk fails, fetch individually
      try {
        const promises = productIds.map(id => fetchProductStock(id));
        await Promise.all(promises);
      } catch (individualErr) {
        error.value = individualErr.message || 'Failed to fetch stock';
      }
    } finally {
      isLoading.value = false;
    }
  }

  function getProductStock(productId) {
    if (!productId) return 0;
    
    const data = stockData.value[productId];
    if (data) {
      return data.stock || 0;
    }
    return 0;
  }

  function getStockData(productId) {
    if (!productId) return null;
    return stockData.value[productId] || null;
  }

  function isInStock(productId, quantity = 1) {
    const stock = getProductStock(productId);
    return stock >= quantity;
  }

  function areAllInStock(productQuantities) {
    if (!productQuantities || productQuantities.length === 0) return true;
    
    for (const item of productQuantities) {
      const stock = getProductStock(item.productId);
      if (stock < (item.quantity || 1)) {
        return false;
      }
    }
    return true;
  }

  async function updateStock(productId, newStock) {
    if (!productId) return false;

    isLoading.value = true;
    error.value = null;

    try {
      await stockAPI.updateStock(productId, newStock);

      if (stockData.value[productId]) {
        stockData.value[productId].stock = newStock;
        stockData.value[productId].lastUpdated = Date.now();
      } else {
        stockData.value[productId] = {
          stock: newStock,
          lastUpdated: Date.now(),
        };
      }

      return true;
    } catch (err) {
      error.value = err.message || 'Failed to update stock';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function decreaseStock(productId, quantity = 1) {
    const currentStock = getProductStock(productId);
    const newStock = Math.max(0, currentStock - quantity);
    return updateStock(productId, newStock);
  }

  async function increaseStock(productId, quantity = 1) {
    const currentStock = getProductStock(productId);
    const newStock = currentStock + quantity;
    return updateStock(productId, newStock);
  }

  function clearStockCache() {
    stockData.value = {};
  }

  async function preloadCartStock(cartItems) {
    if (!cartItems || cartItems.length === 0) return;
    const productIds = cartItems.map(item => item.product_id || item.id);
    await fetchProductsStock(productIds);
  }

  return {
    stockData,
    isLoading,
    error,
    totalStock,
    lowStockProducts,
    outOfStockProducts,
    fetchProductStock,
    fetchProductsStock,
    getProductStock,
    getStockData,
    isInStock,
    areAllInStock,
    updateStock,
    decreaseStock,
    increaseStock,
    clearStockCache,
    preloadCartStock,
  };
});