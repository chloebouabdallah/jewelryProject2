// src/services/metalPrices.js

const OZ_TO_GRAM = 31.1035;

// Current real market prices (fallback)
const GOLD_PER_OUNCE = 4136.20;
const SILVER_PER_OUNCE = 30.50;

// Cache keys
const CACHE_KEY_GOLD = 'soutou_gold_price';
const CACHE_KEY_SILVER = 'soutou_silver_price';
const CACHE_KEY_DATE = 'soutou_metal_price_date';

export async function fetchMetalPrices() {
  try {
    // 🔥 STEP 1: Check cache FIRST and return IMMEDIATELY
    const cachedGold = localStorage.getItem(CACHE_KEY_GOLD);
    const cachedSilver = localStorage.getItem(CACHE_KEY_SILVER);
    const cachedDate = localStorage.getItem(CACHE_KEY_DATE);
    
    let hasValidCache = false;
    let goldPricePerGram = 85.50;
    let silverPricePerGram = 0.85;
    let goldPerOunce = 0;
    let silverPerOunce = 0;
    
    if (cachedGold && cachedSilver && cachedDate) {
      const hoursOld = (Date.now() - parseInt(cachedDate)) / (1000 * 60 * 60);
      if (hoursOld < 24) { // Cache valid for 24 hours
        goldPricePerGram = parseFloat(cachedGold);
        silverPricePerGram = parseFloat(cachedSilver);
        hasValidCache = true;
        console.log(`📦 Using cached prices: Gold $${goldPricePerGram.toFixed(2)}/g, Silver $${silverPricePerGram.toFixed(4)}/g`);
        
        // Return cached data immediately
        return {
          gold: goldPricePerGram,
          silver: silverPricePerGram,
          goldPerOunce: goldPricePerGram * OZ_TO_GRAM,
          silverPerOunce: silverPricePerGram * OZ_TO_GRAM,
          fromCache: true,
          isUpdating: false
        };
      }
    }
    
    // 🔥 STEP 2: If no cache, use fallback values IMMEDIATELY
    // Don't wait for API - show something now
    goldPricePerGram = GOLD_PER_OUNCE / OZ_TO_GRAM;
    silverPricePerGram = SILVER_PER_OUNCE / OZ_TO_GRAM;
    
    console.log(`📊 Using fallback prices: Gold $${goldPricePerGram.toFixed(2)}/g, Silver $${silverPricePerGram.toFixed(4)}/g`);
    
    // 🔥 STEP 3: Start API fetch in background (don't await)
    updatePricesInBackground();
    
    // Return fallback values immediately
    return {
      gold: goldPricePerGram,
      silver: silverPricePerGram,
      goldPerOunce: GOLD_PER_OUNCE,
      silverPerOunce: SILVER_PER_OUNCE,
      fromCache: false,
      isUpdating: true // Tell UI we're updating in background
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    // Return fallback immediately
    return {
      gold: GOLD_PER_OUNCE / OZ_TO_GRAM,
      silver: SILVER_PER_OUNCE / OZ_TO_GRAM,
      goldPerOunce: GOLD_PER_OUNCE,
      silverPerOunce: SILVER_PER_OUNCE,
      fromCache: false,
      error: true
    };
  }
}

// 🔥 Background update function
async function updatePricesInBackground() {
  try {
    console.log('🔄 Updating prices in background...');
    
    const headers = {
      'x-access-token': import.meta.env.VITE_GOLD_API_KEY,
      'Content-Type': 'application/json'
    };
    
    let goldPricePerGram = null;
    let silverPricePerGram = null;
    let goldPerOunce = 0;
    let silverPerOunce = 0;
    let updated = false;
    
    // Try gold API
    try {
      const goldResponse = await fetch('https://goldapi.io/api/XAU/USD', { headers });
      if (goldResponse.ok) {
        const goldData = await goldResponse.json();
        if (goldData.price) {
          goldPerOunce = parseFloat(goldData.price);
          goldPricePerGram = goldPerOunce / OZ_TO_GRAM;
          updated = true;
          console.log(`💰 Gold updated: $${goldPerOunce.toFixed(2)}/oz → $${goldPricePerGram.toFixed(2)}/g`);
        }
      }
    } catch (error) {
      console.warn('Gold API error:', error.message);
    }
    
    // Try silver API
    try {
      const silverResponse = await fetch('https://goldapi.io/api/XAG/USD', { headers });
      if (silverResponse.ok) {
        const silverData = await silverResponse.json();
        if (silverData.price) {
          silverPerOunce = parseFloat(silverData.price);
          silverPricePerGram = silverPerOunce / OZ_TO_GRAM;
          updated = true;
          console.log(`💰 Silver updated: $${silverPerOunce.toFixed(2)}/oz → $${silverPricePerGram.toFixed(4)}/g`);
        }
      }
    } catch (error) {
      console.warn('Silver API error:', error.message);
    }
    
    // If we got updated prices, save to cache
    if (updated) {
      if (goldPricePerGram) {
        localStorage.setItem(CACHE_KEY_GOLD, String(goldPricePerGram));
      }
      if (silverPricePerGram) {
        localStorage.setItem(CACHE_KEY_SILVER, String(silverPricePerGram));
      }
      localStorage.setItem(CACHE_KEY_DATE, String(Date.now()));
      
      console.log('✅ Prices updated and cached!');
      
      // 🔥 Dispatch custom event to notify UI
      window.dispatchEvent(new CustomEvent('metalPricesUpdated', {
        detail: {
          gold: goldPricePerGram || parseFloat(localStorage.getItem(CACHE_KEY_GOLD)),
          silver: silverPricePerGram || parseFloat(localStorage.getItem(CACHE_KEY_SILVER))
        }
      }));
    } else {
      console.log('⚠️ No price updates received');
    }
    
  } catch (error) {
    console.error('❌ Background update failed:', error);
  }
}