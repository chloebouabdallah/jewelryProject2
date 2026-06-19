<template>
  <main class="pt-32 pb-20 px-5">
    <div class="max-w-7xl mx-auto">
      
      <!-- Page Title -->
      <div class="text-center mb-12">
        <h1 class="font-playfair text-4xl md:text-5xl font-light text-stone-800 mb-3">Your Shopping Cart</h1>
        <div class="w-20 h-0.5 bg-amber-500 mx-auto rounded-full"></div>
        <p v-if="authStore.isAuthenticated && cartStore.items.length > 0" class="text-stone-500 text-sm mt-2">
          <i class="fas fa-chart-line text-amber-500 mr-1"></i>
          Prices updated with live gold & silver rates
          <span v-if="goldPriceLoaded" class="text-green-600 text-xs ml-1">
            ● Live
          </span>
          <span v-else class="text-amber-500 text-xs ml-1">
            <i class="fas fa-spinner fa-spin"></i> Loading...
          </span>
        </p>
      </div>
      
      <!-- Login Required Message -->
      <div v-if="!authStore.isAuthenticated" class="bg-white rounded-2xl shadow-md p-8 text-center">
        <i class="fas fa-lock text-5xl text-amber-400 mb-4"></i>
        <h2 class="text-xl font-semibold text-stone-800 mb-2">Login to View Your Cart</h2>
        <p class="text-stone-600 mb-6">Please login or sign up to view and manage your shopping cart.</p>
        <div class="flex gap-4 justify-center">
          <button @click="authStore.openAuthModal('login')" class="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition">
            Login
          </button>
          <button @click="authStore.openAuthModal('signup')" class="border-2 border-amber-600 text-amber-600 px-6 py-2 rounded-full hover:bg-amber-600 hover:text-white transition">
            Sign Up
          </button>
        </div>
      </div>
      
      <!-- Cart Content -->
      <div v-else>
        <div class="flex flex-col lg:flex-row gap-10">
          <!-- Cart Items Section -->
          <div class="flex-1">
            <div class="bg-white rounded-2xl shadow-md overflow-hidden">
              <div v-if="cartStore.items.length === 0" class="text-center py-16 text-stone-400">
                <i class="fas fa-shopping-bag text-5xl mb-4 opacity-50"></i>
                <p>Your cart is empty</p>
                <router-link to="/collections" class="inline-block mt-4 px-6 py-2 bg-amber-600 text-white rounded-full text-sm hover:bg-amber-700 transition">
                  Continue Shopping
                </router-link>
              </div>
              
              <div v-else class="divide-y divide-amber-100">
                <!-- Regular Items (with image and quantity controls) -->
                <div v-for="item in regularItems" :key="item.id" class="p-5 flex gap-4 items-center">
                  <router-link :to="`/product/${item.id}`" class="block">
                    <img :src="item.image" :alt="item.name" class="w-24 h-24 object-cover rounded-xl hover:opacity-80 transition">
                  </router-link>
                  <div class="flex-1">
                    <router-link :to="`/product/${item.id}`" class="hover:text-amber-600 transition">
                      <h3 class="font-semibold text-stone-800 hover:text-amber-600">{{ item.name }}</h3>
                    </router-link>
                    <!-- Metal info -->
                    <div v-if="item.goldWeight || item.silverWeight" class="flex flex-wrap gap-2 mt-1">
                      <span v-if="item.goldWeight && item.goldWeight > 0" class="text-[10px] bg-amber-50 text-stone-500 px-2 py-0.5 rounded-full border border-amber-100">
                        Gold: {{ item.goldWeight }}g @ ${{ getGoldPrice().toFixed(2) }}/g
                      </span>
                      <span v-if="item.silverWeight && item.silverWeight > 0" class="text-[10px] bg-stone-50 text-stone-500 px-2 py-0.5 rounded-full border border-stone-200">
                        Silver: {{ item.silverWeight }}g @ ${{ getSilverPrice().toFixed(2) }}/g
                      </span>
                    </div>
                    <!-- Dynamic Price - use item.price directly (already dynamic from product detail) -->
                    <div class="flex items-baseline gap-2 mt-1">
                      <p class="text-amber-700 font-bold text-lg">${{ getItemDisplayPrice(item).toLocaleString() }}</p>
                      <span v-if="item.originalPrice && getItemDisplayPrice(item) !== item.originalPrice" class="text-[10px] text-green-600">
                        <i class="fas fa-arrow-up text-[8px]"></i> updated
                      </span>
                    </div>
                    <!-- Show original price if changed -->
                    <p v-if="item.originalPrice && getItemDisplayPrice(item) !== item.originalPrice" class="text-[10px] text-stone-400 line-through">
                      ${{ item.originalPrice.toLocaleString() }}
                    </p>
                    <div class="flex items-center gap-3 mt-2">
                      <button @click="cartStore.updateQuantity(item.id, -1)" class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-600 hover:text-white transition">-</button>
                      <span class="w-8 text-center text-stone-700">{{ item.quantity }}</span>
                      <button @click="cartStore.updateQuantity(item.id, 1)" class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-600 hover:text-white transition">+</button>
                      <button @click="cartStore.removeItem(item.id)" class="ml-4 text-stone-400 hover:text-red-500 transition text-sm">
                        <i class="fas fa-trash-alt"></i> Remove
                      </button>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-stone-800">${{ (getItemDisplayPrice(item) * item.quantity).toLocaleString() }}</span>
                    <div v-if="item.goldWeight || item.silverWeight" class="text-[9px] text-stone-400 mt-0.5">
                      Live metal price
                    </div>
                  </div>
                </div>

                <!-- Custom Items (no image, no quantity, just description) -->
                <div v-for="item in customItems" :key="item.id" class="p-5 flex gap-4 items-start bg-amber-50/30">
                  <div class="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-amber-100 rounded-xl">
                    <i class="fas fa-pen-fancy text-3xl text-amber-600"></i>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold text-stone-800">{{ item.name }}</h3>
                      <span class="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Custom</span>
                    </div>
                    <p class="text-sm text-stone-600 mt-1 leading-relaxed">{{ item.description || 'Custom designed piece' }}</p>
                    <div class="flex flex-wrap gap-1 mt-2">
                      <span v-if="item.metal && item.metal !== 'Not specified'" class="text-xs bg-amber-50 text-stone-600 px-2 py-0.5 rounded-full border border-amber-100">{{ item.metal }}</span>
                      <span v-if="item.setting && item.setting !== 'Not specified'" class="text-xs bg-amber-50 text-stone-600 px-2 py-0.5 rounded-full border border-amber-100">{{ item.setting }} setting</span>
                      <span v-if="item.shape && item.shape !== 'Not specified'" class="text-xs bg-amber-50 text-stone-600 px-2 py-0.5 rounded-full border border-amber-100">{{ item.shape }} cut</span>
                      <span v-if="item.carat && item.carat !== 'Not specified'" class="text-xs bg-amber-50 text-stone-600 px-2 py-0.5 rounded-full border border-amber-100">{{ item.carat }}</span>
                      <span v-if="item.band && item.band !== 'Not specified'" class="text-xs bg-amber-50 text-stone-600 px-2 py-0.5 rounded-full border border-amber-100">{{ item.band }} band</span>
                      <span v-if="item.accent && item.accent !== 'Not specified' && item.accent !== 'None'" class="text-xs bg-amber-50 text-stone-600 px-2 py-0.5 rounded-full border border-amber-100">{{ item.accent }} accents</span>
                    </div>
                    <p class="text-amber-700 font-bold text-lg mt-2">${{ item.price.toLocaleString() }}</p>
                    <button @click="cartStore.removeItem(item.id)" class="mt-2 text-stone-400 hover:text-red-500 transition text-sm">
                      <i class="fas fa-trash-alt"></i> Remove
                    </button>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-stone-800">${{ item.price.toLocaleString() }}</span>
                    <p class="text-xs text-stone-400 mt-1">Custom order</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Order Summary -->
          <div class="lg:w-96">
            <div class="bg-white rounded-2xl shadow-md p-6 sticky top-32">
              <h3 class="text-xl font-playfair font-semibold text-stone-800 mb-4">Order Summary</h3>
              
              <div class="space-y-3 border-b border-amber-100 pb-4">
                <div class="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>${{ updatedSubtotal.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>Tax (8%)</span>
                  <span>${{ (updatedSubtotal * 0.08).toFixed(2) }}</span>
                </div>
              </div>
              
              <div class="flex justify-between text-stone-800 font-bold text-lg pt-4">
                <span>Total</span>
                <span>${{ (updatedSubtotal * 1.08).toFixed(2) }}</span>
              </div>
              
              <!-- Live Metal Price Indicator -->
              <div v-if="hasMetalItems" class="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                <p class="text-[10px] text-stone-500 flex items-center gap-1">
                  <i class="fas fa-chart-line text-amber-500"></i>
                  Prices based on live metal rates
                  <span v-if="goldPriceLoaded" class="text-green-600 text-[8px] ml-auto">● Live</span>
                  <span v-else class="text-amber-500 text-[8px] ml-auto"><i class="fas fa-spinner fa-spin"></i></span>
                </p>
                <div class="flex gap-3 mt-1 text-[9px] text-stone-400">
                  <span v-if="goldPrice">Gold: ${{ goldPrice.toFixed(2) }}/g</span>
                  <span v-if="silverPrice">Silver: ${{ silverPrice.toFixed(2) }}/g</span>
                </div>
              </div>
              
              <router-link 
                to="/checkout" 
                class="block w-full mt-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-full font-semibold hover:scale-[1.02] transition shadow-md text-center"
              >
                Proceed to Checkout
              </router-link>
              
              <router-link to="/collections" class="block text-center mt-4 text-sm text-amber-600 hover:underline">
                ← Continue Shopping
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useScrollAnimation } from '@/composables/useScrollAnimation';

const cartStore = useCartStore();
const authStore = useAuthStore();
useScrollAnimation();

const goldPrice = ref(85.50);
const silverPrice = ref(0.85);
const goldPriceLoaded = ref(false);
const DEFAULT_GOLD_PRICE = 85.50;
const DEFAULT_SILVER_PRICE = 0.85;

// Separate regular items from custom items
const regularItems = computed(() => {
  return cartStore.items.filter(item => !item.isCustom);
});

const customItems = computed(() => {
  return cartStore.items.filter(item => item.isCustom);
});

// Check if any items have metal weights
const hasMetalItems = computed(() => {
  return cartStore.items.some(item => 
    (item.goldWeight && item.goldWeight > 0) || 
    (item.silverWeight && item.silverWeight > 0)
  );
});

// Get current gold price
const getGoldPrice = () => {
  return goldPrice.value || DEFAULT_GOLD_PRICE;
};

// Get current silver price
const getSilverPrice = () => {
  return silverPrice.value || DEFAULT_SILVER_PRICE;
};

// Get display price for an item
// If the item already has a dynamic price from product detail, use it directly
// Otherwise, calculate it from metal weights
const getItemDisplayPrice = (item) => {
  if (!item) return 0;
  
  // For custom items, use stored price
  if (item.isCustom) {
    return item.price;
  }
  
  // If item already has a price from product detail (dynamic), use it
  // The price in the cart is already the dynamic price from product detail
  if (item.price) {
    return item.price;
  }
  
  // Fallback: calculate from metal weights (if for some reason price wasn't set)
  let price = item.originalPrice || 0;
  const hasGold = item.goldWeight && item.goldWeight > 0;
  const hasSilver = item.silverWeight && item.silverWeight > 0;
  
  if (hasGold) {
    const originalMetalCost = item.goldWeight * DEFAULT_GOLD_PRICE;
    const metalCost = item.goldWeight * goldPrice.value;
    const otherCosts = Math.max(0, price - originalMetalCost);
    price = Math.round(metalCost + otherCosts);
  }
  
  if (hasSilver) {
    const originalMetalCost = item.silverWeight * DEFAULT_SILVER_PRICE;
    const metalCost = item.silverWeight * silverPrice.value;
    const otherCosts = Math.max(0, price - originalMetalCost);
    price = Math.round(metalCost + otherCosts);
  }
  
  if (hasGold && hasSilver) {
    const originalGoldCost = item.goldWeight * DEFAULT_GOLD_PRICE;
    const originalSilverCost = item.silverWeight * DEFAULT_SILVER_PRICE;
    const goldCost = item.goldWeight * goldPrice.value;
    const silverCost = item.silverWeight * silverPrice.value;
    const otherCosts = Math.max(0, price - originalGoldCost - originalSilverCost);
    price = Math.round(goldCost + silverCost + otherCosts);
  }
  
  return price;
};

// Calculate subtotal with dynamic prices
const updatedSubtotal = computed(() => {
  let total = 0;
  cartStore.items.forEach(item => {
    const price = getItemDisplayPrice(item);
    total += price * (item.quantity || 1);
  });
  return total;
});

// Fetch metal prices
const fetchMetalPrices = async () => {
  try {
    // Try cache first
    const cachedGold = localStorage.getItem('soutou_gold_price');
    const cachedSilver = localStorage.getItem('soutou_silver_price');
    const cachedDate = localStorage.getItem('soutou_metal_price_date');
    
    if (cachedGold && cachedSilver && cachedDate) {
      const hoursOld = (Date.now() - parseInt(cachedDate)) / (1000 * 60 * 60);
      if (hoursOld < 6) {
        goldPrice.value = parseFloat(cachedGold);
        silverPrice.value = parseFloat(cachedSilver);
        goldPriceLoaded.value = true;
        return;
      }
    }
    
    // Fetch from API
    const [goldRes, silverRes] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU'),
      fetch('https://api.gold-api.com/price/XAG')
    ]);
    
    if (goldRes.ok) {
      const data = await goldRes.json();
      goldPrice.value = data.price || DEFAULT_GOLD_PRICE;
      localStorage.setItem('soutou_gold_price', String(goldPrice.value));
    }
    
    if (silverRes.ok) {
      const data = await silverRes.json();
      silverPrice.value = data.price || DEFAULT_SILVER_PRICE;
      localStorage.setItem('soutou_silver_price', String(silverPrice.value));
    }
    
    localStorage.setItem('soutou_metal_price_date', String(Date.now()));
    goldPriceLoaded.value = true;
    
  } catch (error) {
    console.error('Error fetching metal prices:', error);
    goldPrice.value = DEFAULT_GOLD_PRICE;
    silverPrice.value = DEFAULT_SILVER_PRICE;
    goldPriceLoaded.value = true;
  }
};

onMounted(() => {
  fetchMetalPrices();
});
</script>