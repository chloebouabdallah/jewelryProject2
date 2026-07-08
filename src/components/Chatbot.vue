<template>
  <div>
    <button @click="toggleChatbot"
      class="fixed bottom-6 right-6 z-50 bg-[#A6845C] hover:bg-[#8B6D4A] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 border border-[#D4C5A9]/20">
      <i v-if="!isOpen" class="fas fa-comment-dots text-2xl"></i>
      <i v-else class="fas fa-times text-2xl"></i>
    </button>

    <Transition name="slide">
      <div v-if="isOpen"
        class="fixed top-0 right-0 w-full sm:w-96 h-full bg-white/95 backdrop-blur-md shadow-2xl z-50 flex flex-col border-l border-[#D4C5A9]">
        <div class="bg-gradient-to-r from-[#C4A88A] to-[#D4B896] text-white p-5 flex justify-between items-center border-b border-[#D4C5A9]/20">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-[#D4C5A9]/30">
              <i class="fas fa-gem text-[#E8D5C0]"></i>
            </div>
            <div>
              <h3 class="font-playfair font-semibold tracking-wide">LUXE CONCIERGE</h3>
              <p class="text-[10px] uppercase tracking-tighter opacity-70">Personal Stylist & Assistant</p>
            </div>
          </div>
          <button @click="toggleChatbot" class="text-white hover:text-[#E8D5C0] transition"><i
              class="fas fa-times text-xl"></i></button>
        </div>

        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F0EB]">
          <div v-for="(msg, index) in messages" :key="index" class="flex"
            :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'">
            <div
              :class="msg.sender === 'user' ? 'bg-[#C4A88A] text-white rounded-br-none shadow-md' : 'bg-white border border-[#D4C5A9] text-stone-700 rounded-bl-none shadow-sm'"
              class="max-w-[85%] p-3.5 rounded-2xl">
              <p class="text-sm leading-relaxed" v-html="formatMarkdown(msg.text)"></p>

              <!-- Product Card Injection -->
              <div v-if="msg.product"
                class="mt-3 p-2 bg-[#F5F0EB] rounded-lg border border-[#D4C5A9] flex gap-3 animate-fade-in">
                <div class="w-16 h-16 bg-[#E8DDD0] rounded shrink-0 flex items-center justify-center text-[#A6845C]">
                  <i class="fas fa-gem text-xl"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-xs font-bold text-stone-800 truncate">{{ msg.product.name }}</h4>
                  <p class="text-[10px] text-[#A6845C] font-semibold">${{ msg.product.price.toLocaleString() }}</p>
                  <button
                    @click="viewProduct(msg.product)"
                    class="mt-1 w-full py-1 bg-[#A6845C] text-white text-[9px] rounded uppercase tracking-widest hover:bg-[#8B6D4A] transition">View
                    Piece</button>
                </div>
              </div>

              <p class="text-[10px] mt-1 opacity-70">{{ msg.time }}</p>
            </div>
          </div>
        </div>

        <!-- Suggestions -->
        <div v-if="messages.length < 3" class="px-4 py-3 border-t border-[#D4C5A9] overflow-x-auto bg-[#F5F0EB]">
          <div class="flex flex-wrap gap-2">
            <button v-for="reply in quickReplies" :key="reply.text" @click="sendQuickReply(reply.text)"
              class="text-[10px] bg-[#E8DDD0] text-[#6B5340] px-3 py-1.5 rounded-full hover:bg-[#D4C5A9] transition whitespace-nowrap uppercase tracking-tighter">
              {{ reply.text }}
            </button>
          </div>
        </div>

        <div class="p-4 border-t border-[#D4C5A9] bg-white pb-8 sm:pb-4">
          <div class="flex gap-2">
            <input v-model="userInput" @keypress.enter="sendMessage" type="text"
              placeholder="Inquire about collections or style..."
              class="flex-1 px-4 py-3 border border-[#D4C5A9] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C4A88A] text-sm bg-[#FDFBF9]">
            <button @click="sendMessage" :disabled="!userInput.trim() || isTyping"
              class="bg-[#A6845C] hover:bg-[#8B6D4A] text-white rounded-xl px-4 flex items-center justify-center transition disabled:opacity-50">
              <i v-if="!isTyping" class="fas fa-paper-plane text-sm"></i>
              <i v-else class="fas fa-circle-notch animate-spin"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isOpen = ref(false)
const userInput = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

// ========== CONVERSATION STATE ==========
const messages = ref([{
  sender: 'bot',
  text: "✨ **Welcome to SOUTOU!** ✨\n\nI'm your personal jewelry assistant. I can help you find the perfect piece, answer questions about shipping, colors, prices, and more!\n\n**What would you like to know?** 💎",
  time: getCurrentTime()
}])

watch(messages, () => scrollToBottom(), { deep: true })

function formatMarkdown(text) {
  if (!text) return ''
  // Basic markdown: **bold** and new lines
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

// ========== CONVERSATION STATE ==========
let lastAskedContext = null
let lastProductMention = null
let lastCategoryMention = null
let waitingForCountry = false
let waitingForBudget = false
let waitingForColorResponse = false

function getCurrentTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

function toggleChatbot() {
  isOpen.value = !isOpen.value
  if (isOpen.value) scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight })
}

function addMessage(sender, text, product = null) {
  messages.value.push({ sender, text, product, time: getCurrentTime() })
  scrollToBottom()
}

// ========== VIEW PRODUCT FUNCTION ==========
function viewProduct(product) {
  if (product && product.id) {
    isOpen.value = false
    router.push(`/product/${product.id}`)
  }
}

// ==================== COMPLETE PRODUCT DATABASE ====================
const productsDatabase = [
  // NECKLACES
  { id: 1, name: 'Celestial Diamond Necklace', keywords: ['celestial', 'celestial diamond', 'celestial necklace'], price: 3850, oldPrice: 4800, category: 'necklaces', metal: '18k Gold', metalType: 'gold', gemstone: 'Diamond', diamondWeight: '1.25 ct', rating: 5, reviews: 127, badge: 'Best Seller', inStock: true, stock: 7, description: 'A celestial masterpiece that captures the brilliance of the night sky.' },
  { id: 2, name: 'Silver Diamond Pendant', keywords: ['silver diamond pendant', 'silver pendant', 'diamond pendant'], price: 2450, category: 'necklaces', metal: '925 Sterling Silver', metalType: 'silver', gemstone: 'Diamond', diamondWeight: '0.75 ct', rating: 4.8, reviews: 89, badge: 'New', inStock: true, stock: 12 },
  { id: 3, name: 'Gold Necklace', keywords: ['gold necklace', 'gold chain'], price: 1890, category: 'necklaces', metal: '14k Gold', metalType: 'gold', gemstone: 'None', rating: 4.5, reviews: 45, inStock: true, stock: 15 },
  { id: 4, name: 'Gold Necklace Limited', keywords: ['gold necklace limited', 'limited gold necklace'], price: 5290, category: 'necklaces', metal: '18k Gold', metalType: 'gold', gemstone: 'None', rating: 5, reviews: 23, badge: 'Limited', inStock: true, stock: 3 },
  { id: 5, name: 'Gold Diamond Necklace', keywords: ['gold diamond necklace', 'diamond gold necklace'], price: 5290, category: 'necklaces', metal: '18k Gold', metalType: 'gold', gemstone: 'Diamond', diamondWeight: '1.5 ct', rating: 4.9, reviews: 34, badge: 'Limited', inStock: true, stock: 4 },
  { id: 6, name: 'Silver Diamond Necklace', keywords: ['silver diamond necklace', 'diamond silver necklace'], price: 5290, category: 'necklaces', metal: '925 Silver', metalType: 'silver', gemstone: 'Diamond', diamondWeight: '1.2 ct', rating: 4.8, reviews: 18, badge: 'Limited', inStock: true, stock: 2 },

  // EARRINGS
  { id: 101, name: 'Gold Earrings', keywords: ['gold earrings', 'gold earring'], price: 5290, category: 'earrings', metal: '18k Gold', metalType: 'gold', gemstone: 'None', rating: 5, reviews: 234, badge: 'Best Seller', inStock: true, stock: 5 },
  { id: 102, name: 'Rose Gold Diamond Earrings', keywords: ['rose gold diamond earrings', 'rose gold earrings', 'rose gold diamond'], price: 1890, oldPrice: 2500, category: 'earrings', metal: '14k Rose Gold', metalType: 'rose-gold', gemstone: 'Diamond', diamondWeight: '0.5 ct', rating: 4.9, reviews: 56, badge: 'New', inStock: true, stock: 8 },
  { id: 103, name: 'Rose Gold Diamond Hoops', keywords: ['rose gold diamond hoops', 'rose gold hoops', 'diamond hoops'], price: 890, category: 'earrings', metal: '14k Rose Gold', metalType: 'rose-gold', gemstone: 'Diamond', diamondWeight: '0.3 ct', rating: 4.6, reviews: 78, inStock: true, stock: 20 },
  { id: 104, name: 'Gold Diamond Studs', keywords: ['gold diamond studs', 'diamond studs', 'gold studs'], price: 2450, category: 'earrings', metal: '18k Gold', metalType: 'gold', gemstone: 'Diamond', diamondWeight: '0.8 ct each', rating: 4.8, reviews: 42, badge: 'Limited', inStock: true, stock: 6 },
  { id: 105, name: 'Gold Earrings Vintage', keywords: ['gold earrings vintage', 'vintage gold earrings'], price: 2450, category: 'earrings', metal: 'Gold', metalType: 'gold', gemstone: 'None', rating: 4.7, reviews: 31, badge: 'Limited', inStock: true, stock: 4 },
  { id: 106, name: 'Gold Earrings Modern', keywords: ['gold earrings modern', 'modern gold earrings'], price: 2450, category: 'earrings', metal: 'Gold', metalType: 'gold', gemstone: 'None', rating: 4.8, reviews: 27, badge: 'Limited', inStock: true, stock: 5 },

  // RINGS
  { id: 201, name: 'Silver Diamond Ring', keywords: ['silver diamond ring', 'silver ring', 'diamond ring silver'], price: 2975, category: 'rings', metal: '925 Sterling Silver', metalType: 'silver', gemstone: 'Diamond', diamondWeight: '1.0 ct', rating: 5, reviews: 312, badge: 'Best Seller', inStock: true, stock: 3 },
  { id: 202, name: 'Rose Gold Morganite Ring', keywords: ['rose gold morganite ring', 'morganite ring', 'rose gold ring morganite'], price: 1590, oldPrice: 2200, category: 'rings', metal: '14k Rose Gold', metalType: 'rose-gold', gemstone: 'Morganite', gemstoneWeight: '1.2 ct', rating: 4.7, reviews: 45, badge: 'New', inStock: true, stock: 10 },
  { id: 203, name: 'Silver Diamond Ring Classic', keywords: ['silver diamond ring classic', 'classic silver ring'], price: 2250, category: 'rings', metal: 'Silver', metalType: 'silver', gemstone: 'Diamond', rating: 4.6, reviews: 89, inStock: true, stock: 8 },
  { id: 204, name: 'Gold Ring Limited', keywords: ['gold ring limited', 'limited gold ring'], price: 3450, category: 'rings', metal: 'Gold', metalType: 'gold', gemstone: 'None', rating: 4.9, reviews: 56, badge: 'Limited', inStock: true, stock: 2 },
  { id: 205, name: 'Gold Ring', keywords: ['gold ring', 'simple gold ring'], price: 450, category: 'rings', metal: '14k Gold', metalType: 'gold', gemstone: 'None', rating: 4.5, reviews: 234, inStock: true, stock: 25 },
  { id: 206, name: 'Gold Diamond Ring', keywords: ['gold diamond ring', 'diamond gold ring'], price: 2450, category: 'rings', metal: '18k Gold', metalType: 'gold', gemstone: 'Diamond', diamondWeight: '0.9 ct', rating: 4.8, reviews: 67, badge: 'Limited', inStock: true, stock: 4 },

  // BRACELETS
  { id: 301, name: 'Silver Diamond Bracelet', keywords: ['silver diamond bracelet', 'silver bracelet', 'diamond bracelet silver'], price: 299, oldPrice: 450, category: 'bracelets', metal: '925 Sterling Silver', metalType: 'silver', gemstone: 'Diamond', diamondWeight: '0.3 ct', rating: 4.8, reviews: 178, badge: 'Best Seller', inStock: true, stock: 15 },
  { id: 302, name: 'Gold Diamond Tennis Bracelet', keywords: ['gold diamond tennis bracelet', 'tennis bracelet', 'diamond tennis bracelet'], price: 2890, oldPrice: 3800, category: 'bracelets', metal: '18k Gold', metalType: 'gold', gemstone: 'Diamond', diamondWeight: '2.0 ct', rating: 5, reviews: 67, badge: 'New', inStock: true, stock: 6 },
  { id: 303, name: 'Gold Diamond Chain Bracelet', keywords: ['gold diamond chain bracelet', 'chain bracelet', 'gold chain bracelet'], price: 590, category: 'bracelets', metal: '14k Gold', metalType: 'gold', gemstone: 'Diamond', diamondWeight: '0.2 ct', rating: 4.6, reviews: 92, inStock: true, stock: 12 },
  { id: 304, name: 'Silver Diamond Bracelet Vintage', keywords: ['silver diamond bracelet vintage', 'vintage silver bracelet'], price: 450, category: 'bracelets', metal: 'Silver', metalType: 'silver', gemstone: 'Diamond', rating: 4.7, reviews: 45, badge: 'Limited', inStock: true, stock: 5 },
  { id: 305, name: 'Silver Diamond Bracelet Minimalist', keywords: ['silver diamond bracelet minimalist', 'minimalist silver bracelet'], price: 450, category: 'bracelets', metal: 'Silver', metalType: 'silver', gemstone: 'Diamond', rating: 4.6, reviews: 38, badge: 'Limited', inStock: true, stock: 4 },
  { id: 306, name: 'Silver Diamond Bracelet Classic', keywords: ['silver diamond bracelet classic', 'classic silver bracelet'], price: 450, category: 'bracelets', metal: 'Silver', metalType: 'silver', gemstone: 'Diamond', rating: 4.7, reviews: 41, badge: 'Limited', inStock: true, stock: 3 }
]

// Shipping countries database
const shippingCountries = {
  'lebanon': { code: 'LB', name: 'Lebanon', days: '2-4', free: true, codAvailable: true },
  'uae': { code: 'AE', name: 'UAE', days: '4-5', free: true },
  'dubai': { code: 'AE', name: 'UAE', days: '4-5', free: true },
  'saudi': { code: 'SA', name: 'Saudi Arabia', days: '5-6', free: true },
  'kuwait': { code: 'KW', name: 'Kuwait', days: '4-5', free: true },
  'qatar': { code: 'QA', name: 'Qatar', days: '4-5', free: true },
  'france': { code: 'FR', name: 'France', days: '3-5', free: true },
  'paris': { code: 'FR', name: 'France', days: '3-5', free: true },
  'uk': { code: 'GB', name: 'United Kingdom', days: '3-5', free: true },
  'london': { code: 'GB', name: 'United Kingdom', days: '3-5', free: true },
  'germany': { code: 'DE', name: 'Germany', days: '3-5', free: true },
  'italy': { code: 'IT', name: 'Italy', days: '4-6', free: true },
  'spain': { code: 'ES', name: 'Spain', days: '4-6', free: true },
  'usa': { code: 'US', name: 'USA', days: '4-6', free: true },
  'united states': { code: 'US', name: 'USA', days: '4-6', free: true },
  'canada': { code: 'CA', name: 'Canada', days: '5-7', free: true },
  'australia': { code: 'AU', name: 'Australia', days: '6-8', free: true }
}

const quickReplies = [
  { text: 'Products', emoji: '💎' },
  { text: 'Colors', emoji: '🎨' },
  { text: 'Prices', emoji: '💰' },
  { text: 'Shipping', emoji: '📦' },
  { text: 'Lebanon', emoji: '🇱🇧' },
  { text: 'Outside Lebanon', emoji: '🌍' },
  { text: 'About', emoji: '✨' },
  { text: 'Custom', emoji: '🔨' },
  { text: 'Login Issue', emoji: '🔐' },
  { text: 'Warranty', emoji: '🔧' }
]

// Helper: Find product by name or keyword
function findProduct(query) {
  const lowerQuery = query.toLowerCase()

  let product = productsDatabase.find(p => p.name.toLowerCase() === lowerQuery)
  if (product) return product

  product = productsDatabase.find(p => {
    return p.keywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()))
  })
  if (product) return product

  product = productsDatabase.find(p => lowerQuery.includes(p.name.toLowerCase()))
  if (product) return product

  return null
}

// Helper: Get products by category
function getProductsByCategory(category) {
  return productsDatabase.filter(p => p.category === category)
}

// Helper: Get products by metal type
function getProductsByMetal(metalType) {
  return productsDatabase.filter(p => p.metalType === metalType)
}

// Helper: Get product details formatted
function getProductDetails(product) {
  let response = `✨ **${product.name}** ✨\n\n`
  response += `💰 **Price:** $${product.price.toLocaleString()}`
  if (product.oldPrice) response += ` (was $${product.oldPrice.toLocaleString()})`
  response += `\n🔧 **Metal:** ${product.metal}\n`
  if (product.gemstone && product.gemstone !== 'None') {
    response += `💎 **Gemstone:** ${product.gemstone}\n`
    if (product.diamondWeight) response += `⚖️ **Diamond Weight:** ${product.diamondWeight}\n`
    if (product.gemstoneWeight) response += `⚖️ **Gemstone Weight:** ${product.gemstoneWeight}\n`
  }
  response += `⭐ **Rating:** ${product.rating}/5 (${product.reviews} reviews)\n`
  response += `📦 **Stock:** ${product.stock} left\n`
  response += `📦 **Shipping:** FREE worldwide\n`
  response += `✅ **Warranty:** Lifetime warranty included\n`
  if (product.badge) response += `🏷️ **Badge:** ${product.badge}\n`
  if (product.description) response += `\n📝 **Description:** ${product.description}\n`
  response += `\nWould you like to see similar products? 💎`
  return response
}

function getCountryFlag(countryCode) {
  const flags = { 'LB': '🇱🇧', 'FR': '🇫🇷', 'US': '🇺🇸', 'GB': '🇬🇧', 'AE': '🇦🇪', 'SA': '🇸🇦', 'KW': '🇰🇼', 'QA': '🇶🇦', 'DE': '🇩🇪', 'IT': '🇮🇹', 'ES': '🇪🇸', 'CA': '🇨🇦', 'AU': '🇦🇺' }
  return flags[countryCode] || '🌍'
}

// ========== HANDLE BUDGET RESPONSE ==========
function handleBudgetResponse(budgetText) {
  const lower = budgetText.toLowerCase()

  const betweenMatch = lower.match(/between\s*\$?(\d+)\s*and\s*\$?(\d+)/)
  if (betweenMatch) {
    const min = parseInt(betweenMatch[1])
    const max = parseInt(betweenMatch[2])
    const productsInRange = productsDatabase.filter(p => p.price >= min && p.price <= max)
    if (productsInRange.length > 0) {
      let response = `💰 **Products between $${min.toLocaleString()} and $${max.toLocaleString()}:**\n\n`
      productsInRange.forEach(p => {
        response += `• **${p.name}** - $${p.price.toLocaleString()} (${p.category})\n`
      })
      response += `\nWould you like details about any of these? 💎`
      return response
    }
  }

  if (lower.includes('under 500') || lower.includes('under500') || (lower.includes('under') && lower.includes('500'))) {
    const products = productsDatabase.filter(p => p.price < 500)
    let response = "💰 **Under $500:**\n\n"
    products.forEach(p => response += `• ${p.name} - $${p.price.toLocaleString()}\n`)
    response += "\n✨ Best value: Silver Diamond Bracelet at $299! 💎"
    return response
  }

  if ((lower.includes('500') && lower.includes('1500')) || (lower.includes('500') && lower.includes('to') && lower.includes('1500')) || (lower.includes('500') && lower.includes('and') && lower.includes('1500'))) {
    const products = productsDatabase.filter(p => p.price >= 500 && p.price <= 1500)
    let response = "💰 **$500 - $1,500:**\n\n"
    products.forEach(p => response += `• ${p.name} - $${p.price.toLocaleString()} (${p.category})\n`)
    response += "\n⭐ Rose Gold Diamond Hoops ($890) and Rose Gold Morganite Ring ($1,590) are in this range!\n\nWould you like details? 💎"
    return response
  }

  if ((lower.includes('1500') && lower.includes('3000')) || (lower.includes('1500') && lower.includes('to') && lower.includes('3000')) || (lower.includes('1500') && lower.includes('and') && lower.includes('3000'))) {
    const products = productsDatabase.filter(p => p.price >= 1500 && p.price <= 3000)
    let response = "💰 **$1,500 - $3,000:**\n\n"
    products.forEach(p => response += `• ${p.name} - $${p.price.toLocaleString()} (${p.category})\n`)
    response += "\n⭐ Most popular: Silver Diamond Ring ($2,975)!\n\nWould you like details? 💎"
    return response
  }

  if (lower.includes('3000') || lower.includes('above') || lower.includes('3000+')) {
    const products = productsDatabase.filter(p => p.price >= 3000)
    let response = "💰 **Luxury ($3,000+):**\n\n"
    products.forEach(p => response += `• ${p.name} - $${p.price.toLocaleString()} (${p.category})\n`)
    response += "\n👑 Our most exquisite pieces! Would you like details? 💎"
    return response
  }

  return null
}

// ========== HANDLE COLOR/METAL RESPONSES ==========
function handleColorResponse(colorQuery) {
  const lowerColor = colorQuery.toLowerCase()

  if (lowerColor.includes('yellow gold') || lowerColor === 'yellow gold' || lowerColor === 'yellow') {
    const goldProducts = getProductsByMetal('gold')
    if (goldProducts.length > 0) {
      let response = "✨ **Yellow Gold Jewelry at SOUTOU** ✨\n\n"
      response += "Yellow Gold (14k/18k) is classic, timeless, and available in many of our pieces.\n\n"
      response += "**Available Yellow Gold Pieces:**\n"
      goldProducts.forEach(p => {
        response += `• **${p.name}** - $${p.price.toLocaleString()} (${p.category})\n`
      })
      response += "\nWould you like details about any of these pieces? 💛"
      return response
    }
    return "✨ **Yellow Gold** - Classic and timeless (14k or 18k). Available in all our collections! Would you like to see specific yellow gold pieces? 💛"
  }

  if (lowerColor.includes('white gold') || lowerColor === 'white gold' || lowerColor === 'white') {
    return "⚪ **White Gold** - Modern and elegant (14k or 18k). Perfect for diamond settings!\n\nWould you like to see our white gold pieces? 🤍"
  }

  if (lowerColor.includes('rose gold') || lowerColor === 'rose gold' || lowerColor === 'rose') {
    const roseGoldProducts = getProductsByMetal('rose-gold')
    if (roseGoldProducts.length > 0) {
      let response = "💗 **Rose Gold Jewelry at SOUTOU** 💗\n\n"
      response += "Rose Gold (14k) has a romantic pinkish hue and is very popular for rings and earrings.\n\n"
      response += "**Available Rose Gold Pieces:**\n"
      roseGoldProducts.forEach(p => {
        response += `• **${p.name}** - $${p.price.toLocaleString()} (${p.category})\n`
      })
      response += "\nWould you like details about any of these romantic pieces? 💕"
      return response
    }
    return "💗 **Rose Gold** - Romantic pinkish hue (14k). Very popular for rings! Would you like to see our rose gold collection? 💕"
  }

  if (lowerColor.includes('platinum')) {
    return "⚪ **Platinum** - The most precious metal (950). Hypoallergenic and ultra-durable.\n\nPlatinum pieces are made to order. Contact custom@soutou.com for pricing and consultation! ✨"
  }

  if (lowerColor.includes('silver') || lowerColor.includes('sterling silver')) {
    const silverProducts = getProductsByMetal('silver')
    if (silverProducts.length > 0) {
      let response = "🔘 **Sterling Silver Jewelry at SOUTOU** 🔘\n\n"
      response += "Sterling Silver (925) is affordable, beautiful, and perfect for everyday wear.\n\n"
      response += "**Available Silver Pieces:**\n"
      silverProducts.forEach(p => {
        response += `• **${p.name}** - $${p.price.toLocaleString()} (${p.category})\n`
      })
      response += "\n✨ **Best Seller:** Silver Diamond Bracelet at only $299!\n\nWould you like details about any of these? 💎"
      return response
    }
    return "🔘 **Sterling Silver** - Affordable and beautiful (925). Our Silver Diamond Bracelet ($299) is a best seller! Would you like to see our silver collection? 💎"
  }

  return null
}

// ========== HANDLE "YES" RESPONSES ==========
function handleYesResponse() {
  if (lastAskedContext === 'show_collections') {
    return "💎 **Our Collections:**\n\n" +
      "📿 **NECKLACES & PENDANTS** - $1,890 to $5,290\n" +
      "💍 **RINGS & BANDS** - $450 to $3,450\n" +
      "👂 **EARRINGS & DROPS** - $890 to $5,290\n" +
      "💫 **BRACELETS & BANGLES** - $299 to $2,890\n\n" +
      "**Which category interests you?** (necklace, ring, earring, bracelet) ✨"
  }

  if (lastAskedContext === 'show_necklaces') {
    const necklaces = getProductsByCategory('necklaces')
    let response = "📿 **Our Necklaces:**\n\n"
    necklaces.forEach(n => {
      response += `• **${n.name}** - $${n.price.toLocaleString()} (${n.metal}${n.gemstone !== 'None' ? ` · ${n.gemstone}` : ''})${n.badge === 'Best Seller' ? ' ✨ Best Seller' : ''}\n`
    })
    response += `\n**Which necklace would you like details about?** (just tell me the name!) 💎`
    return response
  }

  if (lastAskedContext === 'show_earrings') {
    const earrings = getProductsByCategory('earrings')
    let response = "👂 **Our Earrings:**\n\n"
    earrings.forEach(e => {
      response += `• **${e.name}** - $${e.price.toLocaleString()} (${e.metal}${e.gemstone !== 'None' ? ` · ${e.gemstone}` : ''})${e.badge === 'Best Seller' ? ' ✨ Best Seller' : ''}\n`
    })
    response += `\n**Which earrings would you like details about?** (just tell me the name!) 👂`
    return response
  }

  if (lastAskedContext === 'show_rings') {
    const rings = getProductsByCategory('rings')
    let response = "💍 **Our Rings:**\n\n"
    rings.forEach(r => {
      response += `• **${r.name}** - $${r.price.toLocaleString()} (${r.metal}${r.gemstone !== 'None' ? ` · ${r.gemstone}` : ''})${r.badge === 'Best Seller' ? ' ✨ Best Seller' : ''}\n`
    })
    response += `\n**Which ring would you like details about?** (just tell me the name!) 💍`
    return response
  }

  if (lastAskedContext === 'show_bracelets') {
    const bracelets = getProductsByCategory('bracelets')
    let response = "💫 **Our Bracelets:**\n\n"
    bracelets.forEach(b => {
      response += `• **${b.name}** - $${b.price.toLocaleString()} (${b.metal}${b.gemstone !== 'None' ? ` · ${b.gemstone}` : ''})${b.badge === 'Best Seller' ? ' ✨ Best Seller' : ''}\n`
    })
    response += `\n**Which bracelet would you like details about?** (just tell me the name!) 💫`
    return response
  }

  if (lastAskedContext === 'show_similar_products' && lastProductMention) {
    const product = findProduct(lastProductMention)
    if (product) {
      const similar = productsDatabase.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3)
      if (similar.length > 0) {
        let response = `✨ **Similar to ${product.name}:**\n\n`
        similar.forEach(p => {
          response += `• **${p.name}** - $${p.price.toLocaleString()} (${p.metal})\n`
        })
        response += `\nWould you like details about any of these? 💎`
        return response
      }
    }
  }

  if (lastAskedContext === 'product_details' && lastProductMention) {
    const product = findProduct(lastProductMention)
    if (product) {
      return getProductDetails(product)
    }
  }

  return "💎 What would you like to know more about?\n\nTry: Necklaces, Rings, Earrings, Bracelets, Prices, or Shipping! ✨"
}

// ========== MAIN RESPONSE FUNCTION ==========
function getBotResponse(msg) {
  const lower = msg.toLowerCase().trim()

  // ========== HANDLE "YES" ==========
  if (lower === 'yes' || lower === 'yeah' || lower === 'yep' || lower === 'sure' || lower === 'ok' || lower === 'okay') {
    const response = handleYesResponse()
    lastAskedContext = null
    return response
  }

  if (lower === 'no' || lower === 'nope') {
    lastAskedContext = null
    return "No problem! What else would you like to know about? 💎"
  }

  // ========== FIX: HANDLE COUNTRY RESPONSE WHEN WAITING ==========
  // This MUST come before budget and other checks
  if (waitingForCountry) {
    // Check if the user mentioned a country
    for (const [countryKey, countryData] of Object.entries(shippingCountries)) {
      if (lower.includes(countryKey)) {
        waitingForCountry = false
        const flag = getCountryFlag(countryData.code)
        return `✅ **Yes! We ship to ${countryData.name}!** ${flag}\n\n` +
          `• Delivery: ${countryData.days} business days\n` +
          `• Shipping: FREE ✨\n` +
          `• Tracking provided\n\n` +
          `Would you like to browse our collections? 💎`
      }
    }
    // If country not recognized, ask again
    waitingForCountry = false
    return "I didn't recognize that country. Please tell me a country name like France, USA, UK, UAE, etc. 🌍"
  }

  // ========== HANDLE BUDGET RESPONSE ==========
  if (waitingForBudget) {
    const budgetResponse = handleBudgetResponse(lower)
    if (budgetResponse) {
      waitingForBudget = false
      return budgetResponse
    } else {
      waitingForBudget = false
      return "I didn't catch your budget. Please tell me something like:\n• Under $500\n• $500 to $1,500\n• $1,500 to $3,000\n• $3,000+"
    }
  }

  // ========== HANDLE CART/ADD ISSUES ==========
  if ((lower.includes('add to cart') || lower.includes('add item') || lower.includes('cannot add') || lower.includes('cant add')) &&
    (lower.includes('why') || lower.includes('problem') || lower.includes('issue') || lower.includes('not working'))) {
    return "🔐 **Why can't I add items to cart?**\n\n" +
      "You need to be **LOGGED IN** to add items to your cart!\n\n" +
      "📍 **How to fix:**\n" +
      "1. Click the 👤 icon in the top right corner\n" +
      "2. Select **Login** (if you already have an account)\n" +
      "3. Or select **Sign Up** to create a free account (takes 30 seconds!)\n\n" +
      "✅ **After logging in, you can:**\n" +
      "• Add items to cart\n" +
      "• Save items to wishlist\n" +
      "• Complete checkout\n" +
      "• Track your orders\n\n" +
      "**Registration is FREE and only takes 30 seconds!** Would you like help with anything else? 💎"
  }

  // ========== HANDLE COLOR/METAL QUERIES ==========
  const colorResponse = handleColorResponse(lower)
  if (colorResponse) {
    return colorResponse
  }

  // ========== CHECK FOR SPECIFIC PRODUCT ==========
  const mentionedProduct = findProduct(lower)
  if (mentionedProduct) {
    lastProductMention = mentionedProduct.name
    lastAskedContext = 'product_details'
    return getProductDetails(mentionedProduct)
  }

  // ========== SHIPPING QUERIES (direct country mention) ==========
  for (const [countryKey, countryData] of Object.entries(shippingCountries)) {
    if (lower.includes(countryKey) && (lower.includes('ship') || lower.includes('delivery') || lower.includes('shipping'))) {
      const flag = getCountryFlag(countryData.code)
      return `✅ **Shipping to ${countryData.name}** ${flag}\n\n• Delivery: ${countryData.days} business days\n• Shipping: FREE ✨\n\nReady to shop? 💎`
    }
  }

  if (lower.includes('shipping') || lower.includes('delivery')) {
    if (lower.includes('lebanon')) {
      return "📦 **Shipping to Lebanon:**\n\n• 2-4 business days\n• FREE shipping\n• Cash on Delivery available ($5 fee)\n\nWould you like to know about other countries? 🌍"
    }
    if (lower.includes('outside') || lower.includes('international')) {
      waitingForCountry = true
      return "🌍 **International Shipping!**\n\nWe ship to 100+ countries with FREE shipping!\n\n📍 France (3-5 days), USA (4-6 days), UK (3-5 days), UAE (4-5 days)\n\n**Which country are you in?** ✈️"
    }
    return "📦 **FREE Worldwide Shipping!**\n\n📍 Lebanon: 2-4 days\n📍 International: 3-8 days\n\nWhich country are you shipping to? ✈️"
  }

  // ========== HANDLE "OUTSIDE LEBANON" ==========
  if (lower.includes('outside') && (lower.includes('lebanon') || lower.includes('leb'))) {
    waitingForCountry = true
    let response = "🌍 **International Shipping!**\n\n" +
      "We ship to 100+ countries with FREE shipping!\n\n" +
      "📍 **Popular destinations & delivery times:**\n" +
      "• 🇫🇷 France: 3-5 days\n" +
      "• 🇺🇸 USA: 4-6 days\n" +
      "• 🇬🇧 UK: 3-5 days\n" +
      "• 🇦🇪 UAE/Dubai: 4-5 days\n" +
      "• 🇸🇦 Saudi Arabia: 5-6 days\n" +
      "• 🇩🇪 Germany: 3-5 days\n" +
      "• 🇮🇹 Italy: 4-6 days\n" +
      "• 🇨🇦 Canada: 5-7 days\n" +
      "• 🇦🇺 Australia: 6-8 days\n\n" +
      "💳 Payment: Credit Card, PayPal, Apple Pay, Google Pay\n\n" +
      "**Which country are you in?** I can give you exact delivery details! ✈️💎"
    return response
  }

  // ========== LOGIN ISSUES ONLY ==========
  if (lower.includes('login') || lower.includes('log in') || lower.includes('sign up') || lower.includes('register')) {
    return "🔐 **Login to SOUTOU**\n\n" +
      "Click the 👤 icon in the top right corner → Login or Sign Up\n\n" +
      "✅ **Benefits of creating an account:**\n" +
      "• Add items to cart\n" +
      "• Save items to wishlist\n" +
      "• Complete checkout\n" +
      "• Track your orders\n" +
      "• Write reviews\n\n" +
      "**Registration is FREE and takes only 30 seconds!**\n\n" +
      "Would you like help with anything else? 💎"
  }

  if (lower.includes('cart') && (lower.includes('add') || lower.includes('problem') || lower.includes('issue'))) {
    return "🛒 **Adding Items to Cart**\n\n" +
      "⚠️ **You must be logged in to add items to cart!**\n\n" +
      "📍 **Steps to add items:**\n" +
      "1. Click the 👤 icon in the top right corner\n" +
      "2. Login or Sign Up (FREE, 30 seconds)\n" +
      "3. Browse our collections\n" +
      "4. Click 'Add to Cart' on any product\n\n" +
      "✅ After logging in, you can also:\n" +
      "• Save items to wishlist\n" +
      "• Complete checkout\n" +
      "• Track your orders\n\n" +
      "Would you like to login now? 🔐"
  }

  // ========== ABOUT / HISTORY ==========
  if (lower.includes('what is this website') || lower.includes('what is soutou') ||
    lower.includes('tell me about soutou') || lower.includes('about soutou') ||
    lower.includes('history') || (lower.includes('about') && !lower.includes('product'))) {
    lastAskedContext = 'show_collections'
    return "✨ **SOUTOU - Luxury Jewelry Since 1989** ✨\n\n" +
      "**📜 Our Story:** Founded in Paris by master jeweler Isabelle Moreau.\n\n" +
      "**🏆 Milestones:**\n• 1989: Founded in Paris\n• 2005: Won International Jewelry Design Award\n• 2015: 100% recycled gold & ethical gemstones\n• 2024: Global luxury brand\n\n" +
      "**💎 What We Offer:** Handcrafted necklaces, rings, earrings, bracelets • Free worldwide shipping • Lifetime warranty • Custom design\n\n" +
      "Would you like to see our collections? 💫"
  }

  // ========== PRODUCT CATEGORIES ==========
  if (lower.includes('what products') || lower.includes('what do you sell') || lower.includes('categories')) {
    lastAskedContext = 'show_collections'
    return "💎 **Our Collections:**\n\n" +
      "📿 **NECKLACES & PENDANTS** - $1,890 to $5,290\n" +
      "💍 **RINGS & BANDS** - $450 to $3,450\n" +
      "👂 **EARRINGS & DROPS** - $890 to $5,290\n" +
      "💫 **BRACELETS & BANGLES** - $299 to $2,890\n\n" +
      "**Which category interests you?** (necklace, ring, earring, bracelet) ✨"
  }

  // ========== SPECIFIC CATEGORIES - ORDER MATTERS! ==========
  // Check for NECKLACES first (most specific)
  if (lower.includes('necklace') || lower.includes('necklaces') || lower.includes('pendant')) {
    lastAskedContext = 'show_necklaces'
    const necklaces = getProductsByCategory('necklaces')
    let response = "📿 **Our Necklaces:**\n\n"
    necklaces.forEach(n => {
      response += `• **${n.name}** - $${n.price.toLocaleString()} (${n.metal}${n.gemstone !== 'None' ? ` · ${n.gemstone}` : ''})${n.badge === 'Best Seller' ? ' ✨ Best Seller' : ''}\n`
    })
    response += `\n**Which necklace would you like details about?** (just tell me the name!) 💎`
    return response
  }

  // Check for EARRINGS before RINGS (because "earrings" contains "ring")
  if (lower.includes('earring') || lower.includes('earrings')) {
    lastAskedContext = 'show_earrings'
    const earrings = getProductsByCategory('earrings')
    let response = "👂 **Our Earrings:**\n\n"
    earrings.forEach(e => {
      response += `• **${e.name}** - $${e.price.toLocaleString()} (${e.metal}${e.gemstone !== 'None' ? ` · ${e.gemstone}` : ''})${e.badge === 'Best Seller' ? ' ✨ Best Seller' : ''}\n`
    })
    response += `\n**Which earrings would you like details about?** (just tell me the name!) 👂`
    return response
  }

  // Check for RINGS (after earrings so it doesn't catch "earrings")
  if (lower.includes('ring') || lower.includes('rings')) {
    lastAskedContext = 'show_rings'
    const rings = getProductsByCategory('rings')
    let response = "💍 **Our Rings:**\n\n"
    rings.forEach(r => {
      response += `• **${r.name}** - $${r.price.toLocaleString()} (${r.metal}${r.gemstone !== 'None' ? ` · ${r.gemstone}` : ''})${r.badge === 'Best Seller' ? ' ✨ Best Seller' : ''}\n`
    })
    response += `\n**Which ring would you like details about?** (just tell me the name!) 💍`
    return response
  }

  // Check for BRACELETS
  if (lower.includes('bracelet') || lower.includes('bracelets') || lower.includes('bangle')) {
    lastAskedContext = 'show_bracelets'
    const bracelets = getProductsByCategory('bracelets')
    let response = "💫 **Our Bracelets:**\n\n"
    bracelets.forEach(b => {
      response += `• **${b.name}** - $${b.price.toLocaleString()} (${b.metal}${b.gemstone !== 'None' ? ` · ${b.gemstone}` : ''})${b.badge === 'Best Seller' ? ' ✨ Best Seller' : ''}\n`
    })
    response += `\n**Which bracelet would you like details about?** (just tell me the name!) 💫`
    return response
  }

  // ========== COLORS / METALS (General) ==========
  if (lower.includes('color') || lower.includes('colors') || lower.includes('metal') || lower.includes('what colors')) {
    return "🎨 **Metal Colors Available:**\n\n" +
      "✨ **Yellow Gold** (14k/18k) - Classic & Timeless\n" +
      "🤍 **White Gold** (14k/18k) - Modern & Elegant\n" +
      "💗 **Rose Gold** (14k) - Romantic & Popular\n" +
      "⚪ **Platinum** (950) - Luxury & Hypoallergenic\n" +
      "🔘 **Silver** (925) - Affordable & Beautiful\n\n" +
      "**Which color interests you?** (Just tell me the name like \"yellow gold\" or \"rose gold\") 💎"
  }

  // ========== PRICES / BUDGET ==========
  if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('how much') || lower.includes('price range') || lower === 'what are the prices') {
    waitingForBudget = true
    return "💰 **What's your budget?**\n\n🟢 Under $500\n🟡 $500 - $1,500\n🟠 $1,500 - $3,000\n🔴 $3,000+\n\nJust tell me your budget (like \"under $500\" or \"between 500 and 1500\") and I'll show you the perfect jewelry! 💎"
  }

  // ========== CUSTOM JEWELRY ==========
  if (lower.includes('custom') || lower.includes('customize') || lower.includes('custimize') || lower.includes('design') || lower.includes('engrave') || lower.includes('personalized') || lower.includes('bespoke') || lower.includes('can we custom')) {
    return "✨ **YES! We offer custom jewelry services!** ✨\n\n" +
      "**What we can create:**\n" +
      "• Design your own ring, necklace, or bracelet\n" +
      "• Choose your gemstone (Diamond, Morganite, Sapphire, Emerald)\n" +
      "• Select your metal (Yellow/White/Rose Gold, Platinum, Silver)\n" +
      "• Free engraving (up to 20 characters)\n\n" +
      "**Popular custom requests:**\n" +
      "• Engagement rings\n" +
      "• Wedding bands\n" +
      "• Anniversary gifts with special dates engraved\n" +
      "• Birthstone jewelry\n" +
      "• Matching couple bracelets\n\n" +
      "**Process:**\n" +
      "1. Free consultation (virtual or in-person)\n" +
      "2. Share your ideas and inspiration photos\n" +
      "3. We create a 3D design preview\n" +
      "4. Production: 4-6 weeks\n" +
      "5. Delivery with lifetime warranty\n\n" +
      "📞 **Contact:** custom@soutou.com\n" +
      "💰 **Pricing:** Starts at $1,500 depending on materials\n\n" +
      "Would you like to schedule a free consultation? 💎"
  }

  // ========== WARRANTY & RETURNS ==========
  if (lower.includes('warranty') || lower.includes('guarantee')) {
    return "🔧 **Lifetime Warranty**\n\n" +
      "Every SOUTOU piece comes with:\n\n" +
      "✅ **Lifetime warranty** against manufacturing defects\n" +
      "✅ **Free cleaning** at any time\n" +
      "✅ **Free inspection** annually\n" +
      "✅ **Repairs at cost** (after normal wear and tear)\n\n" +
      "**How to claim:**\n" +
      "Email hello@soutou.com with your order number and photos of the issue.\n\n" +
      "Would you like to know about our return policy? 🔄"
  }

  if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange')) {
    return "🔄 **30-Day Returns & Exchanges**\n\n" +
      "**Returns:**\n" +
      "• 30 days from delivery date\n" +
      "• Full refund to original payment method\n" +
      "• Item must be unworn and in original packaging\n\n" +
      "**Exchanges:**\n" +
      "• Free return shipping for exchanges\n" +
      "• Exchange for different size, color, or product\n\n" +
      "**How to return:**\n" +
      "Email returns@soutou.com with your order number\n\n" +
      "⚠️ Custom jewelry is final sale (except for defects)\n\n" +
      "Would you like to start a return? 💎"
  }

  // ========== SIZING ==========
  if (lower.includes('size') || lower.includes('sizing') || lower.includes('ring size') ||
    lower.includes('measure') || lower.includes('fit')) {
    return "📏 **Ring Sizing Guide**\n\n" +
      "**Available sizes:**\n" +
      "• US sizes 4 to 12\n" +
      "• Half sizes available\n" +
      "• International sizes (EU, UK, JP) available\n\n" +
      "**FREE Sizing Kit:**\n" +
      "Email hello@soutou.com with your address and we'll send you a free ring sizer!\n\n" +
      "**Necklace lengths:**\n" +
      "• 16\" - Choker style\n" +
      "• 18\" - Classic (most popular)\n" +
      "• 20\" - Pendant length\n" +
      "• 24\" - Long chain\n\n" +
      "**Bracelet lengths:**\n" +
      "• 6.5\" - Extra small\n" +
      "• 7\" - Small/Medium\n" +
      "• 7.5\" - Medium/Large\n" +
      "• 8\" - Large\n\n" +
      "Need help finding your size? I'm here to help! 💎"
  }

  // ========== OFFERS / DISCOUNTS / SALES ==========
  if (lower.includes('offer') || lower.includes('discount') || lower.includes('sale') ||
    lower.includes('promo') || lower.includes('coupon') || lower.includes('deal')) {
    const onSale = productsDatabase.filter(p => p.oldPrice)
    let response = "🎉 **Current Offers & Promotions** 🎉\n\n"

    if (onSale.length > 0) {
      response += "🔥 **Items on Sale:**\n"
      onSale.forEach(p => {
        const savings = Math.round((1 - p.price / p.oldPrice) * 100)
        response += `• ${p.name} — $${p.price.toLocaleString()} (was $${p.oldPrice.toLocaleString()}) — Save ${savings}%!\n`
      })
      response += "\n"
    }

    response += "✨ **FREE Worldwide Shipping** - Always!\n" +
      "✨ **Lifetime Warranty** - Included with every purchase\n" +
      "✨ **Free Engraving** on custom orders\n" +
      "✨ **FREE Ring Sizing Kit** - Email hello@soutou.com\n\n" +
      "📧 **Newsletter Exclusive:**\n" +
      "Sign up for 10% off your first order!\n\n" +
      "Would you like me to help you find something within your budget? 💎"
    return response
  }

  // ========== BEST SELLERS ==========
  if (lower.includes('best seller') || lower.includes('bestseller') || lower.includes('most popular') ||
    lower.includes('top rated') || lower.includes('customer favorite')) {
    const bestSellers = productsDatabase.filter(p => p.badge === 'Best Seller')
    let response = "🔥 **Our Best Sellers — Customer Favorites!** 🔥\n\n"
    bestSellers.forEach(p => {
      response += `✨ **${p.name}**\n`
      response += `   💰 $${p.price.toLocaleString()} | ⭐ ${p.rating}/5 (${p.reviews} reviews)\n`
      response += `   📝 ${p.description ? p.description.substring(0, 80) : 'Beautiful piece'}...\n\n`
    })
    response += "Want details on any of these? Just tell me the name! 💎"
    return response
  }

  // ========== NEW ARRIVALS ==========
  if (lower.includes('new arrival') || lower.includes('new collection') || lower.includes('latest') ||
    lower.includes('just arrived') || lower.includes('newest')) {
    const newItems = productsDatabase.filter(p => p.badge === 'New')
    let response = "✨ **New Arrivals — Fresh from our atelier!** ✨\n\n"
    newItems.forEach(p => {
      const priceStr = p.oldPrice ? `$${p.price.toLocaleString()} (was $${p.oldPrice.toLocaleString()})` : `$${p.price.toLocaleString()}`
      response += `• **${p.name}** — ${priceStr}\n`
      response += `  ⭐ ${p.rating}/5 | ${p.category}\n\n`
    })
    response += "Be the first to own these stunning new pieces! 💫"
    return response
  }

  // ========== LIMITED EDITION ==========
  if (lower.includes('limited edition') || lower.includes('limited') || lower.includes('exclusive')) {
    const limited = productsDatabase.filter(p => p.badge === 'Limited')
    let response = "💎 **Limited Edition Pieces — Only a few left!** 💎\n\n"
    limited.forEach(p => {
      response += `• **${p.name}** — $${p.price.toLocaleString()}\n`
      response += `  ⭐ ${p.rating}/5 | Only ${p.stock} left in stock!\n\n`
    })
    response += "These exclusive pieces won't last long! Secure yours today. 🔥"
    return response
  }

  // ========== GIFT IDEAS ==========
  if (lower.includes('gift') || lower.includes('present') || lower.includes('anniversary') ||
    lower.includes('birthday') || lower.includes('wedding') || lower.includes('engagement') ||
    lower.includes('valentine') || lower.includes('mother') || lower.includes('gift idea')) {
    let response = "🎁 **Gift Ideas from SOUTOU** 🎁\n\n"

    // Engagement/Wedding gifts
    if (lower.includes('engagement') || lower.includes('wedding')) {
      response += "💍 **For Engagement/Wedding:**\n" +
        "• Rose Gold Morganite Ring — $1,590 (romantic!)\n" +
        "• Silver Diamond Ring — $2,975 (classic)\n" +
        "• Gold Diamond Ring — $2,450 (vintage charm)\n\n"
    }
    // Anniversary gifts
    else if (lower.includes('anniversary')) {
      response += "💎 **For Anniversary:**\n" +
        "• Celestial Diamond Necklace — $3,850 (statement piece)\n" +
        "• Gold Diamond Tennis Bracelet — $2,890 (elegant)\n" +
        "• Gold Diamond Studs — $2,450 (timeless)\n" +
        "• Custom engraved ring with date — starting at $1,500\n\n"
    }
    // Birthday / Mother / Valentine
    else if (lower.includes('birthday') || lower.includes('mother') || lower.includes('valentine')) {
      response += "✨ **For Her:**\n" +
        "• Silver Diamond Bracelet — $299 (best seller!)\n" +
        "• Rose Gold Diamond Earrings — $1,890\n" +
        "• Gold Diamond Chain Bracelet — $590\n" +
        "• Rose Gold Diamond Hoops — $890\n\n"
    }
    // Christmas / Holiday
    else if (lower.includes('christmas') || lower.includes('holiday')) {
      response += "🎄 **Holiday Gift Guide:**\n" +
        "• Silver Diamond Bracelet — $299 (perfect stocking stuffer!)\n" +
        "• Gold Ring — $450 (minimalist and elegant)\n" +
        "• Rose Gold Diamond Hoops — $890\n" +
        "• Custom jewelry with birthstones — starting at $1,500\n\n"
    }
    // General gift ideas (no specific occasion)
    else {
      response += "**By Occasion:**\n" +
        "💍 **Engagement/Wedding:** Rose Gold Morganite Ring ($1,590), Silver Diamond Ring ($2,975)\n" +
        "💎 **Anniversary:** Celestial Diamond Necklace ($3,850), Gold Diamond Tennis Bracelet ($2,890)\n" +
        "🎂 **Birthday:** Silver Diamond Bracelet ($299), Rose Gold Diamond Earrings ($1,890)\n" +
        "❤️ **Valentine's Day:** Rose Gold Diamond Hoops ($890), Gold Diamond Chain Bracelet ($590)\n\n" +
        "**By Price:**\n" +
        "🟢 **Under $500:** Silver Diamond Bracelet ($299), Gold Ring ($450)\n" +
        "🟡 **$500 - $1,500:** Rose Gold Diamond Hoops ($890), Rose Gold Morganite Ring ($1,590)\n" +
        "🟠 **$1,500 - $3,000:** Rose Gold Diamond Earrings ($1,890), Silver Diamond Ring ($2,975)\n" +
        "🔴 **$3,000+:** Celestial Diamond Necklace ($3,850), Gold Diamond Tennis Bracelet ($2,890)\n\n"
    }

    response += "✅ **All gifts include:**\n" +
      "• FREE worldwide shipping\n" +
      "• Beautiful gift packaging\n" +
      "• Optional engraving (custom orders)\n" +
      "• Lifetime warranty\n\n" +
      "Tell me more about the recipient (budget, style, occasion) and I'll give personalized recommendations! 💎"
    return response
  }

  // ========== CONTACT / SUPPORT ==========
  if (lower.includes('contact') || lower.includes('email') || lower.includes('phone') ||
    lower.includes('call') || lower.includes('support') || lower.includes('customer service')) {
    return "📞 **Contact SOUTOU**\n\n" +
      "**📍 Atelier Address:**\n" +
      "123 Rue de la Paix, 75002 Paris, France\n\n" +
      "**📧 Email:**\n" +
      "• General: hello@soutou.com\n" +
      "• Custom orders: custom@soutou.com\n" +
      "• Returns: returns@soutou.com\n\n" +
      "**📞 Phone:**\n" +
      "+33 (0)1 23 45 67 89\n\n" +
      "**⏰ Hours:**\n" +
      "Monday-Friday: 10am-7pm (Paris time)\n" +
      "Saturday: 11am-6pm\n" +
      "Sunday: Closed\n\n" +
      "**💬 Response time:** 24 hours for emails\n\n" +
      "Would you like to send a message through our contact form? ✨"
  }

  // ========== PAYMENT METHODS ==========
  if (lower.includes('payment') || lower.includes('pay') || lower.includes('card') ||
    lower.includes('credit card') || lower.includes('cod') || lower.includes('cash on delivery')) {
    return "💳 **Payment Methods at SOUTOU**\n\n" +
      "**Available payment options:**\n\n" +
      "💳 **Credit / Debit Card** - All countries (Visa, Mastercard, Amex)\n" +
      "💵 **Cash on Delivery (COD)** - Lebanon only (+$5 fee)\n" +
      "💰 **PayPal** - All countries\n" +
      "🍎 **Apple Pay** - All countries\n" +
      "🤖 **Google Pay** - All countries\n\n" +
      "🔒 All transactions are secure and encrypted.\n\n" +
      "Would you like help with anything else? 💎"
  }

  // ========== STOCK / AVAILABILITY ==========
  if (lower.includes('stock') || lower.includes('available') || lower.includes('in stock') ||
    lower.includes('sold out') || lower.includes('availability')) {
    const lowStock = productsDatabase.filter(p => p.stock <= 5)
    let response = "📦 **Stock Availability**\n\n"

    if (lowStock.length > 0) {
      response += "⚠️ **Low Stock Alert (5 or fewer left):**\n"
      lowStock.forEach(p => {
        response += `• ${p.name} — Only ${p.stock} left!\n`
      })
      response += "\n"
    }

    response += "✅ Most items are in stock and ready to ship.\n" +
      "✅ Limited edition pieces sell out quickly!\n\n" +
      "If your desired piece is out of stock, contact us at custom@soutou.com to inquire about restocking or custom orders. 💎"
    return response
  }

  // ========== MATERIALS / QUALITY ==========
  if (lower.includes('material') || lower.includes('quality') || lower.includes('karat') ||
    lower.includes('carat') || lower.includes('pure') || lower.includes('authentic') ||
    lower.includes('real') || lower.includes('genuine')) {
    return "💎 **Materials & Quality at SOUTOU**\n\n" +
      "🔸 **Gold:**\n" +
      "• 14k & 18k Yellow, White & Rose Gold\n" +
      "• 100% recycled gold (since 2015)\n\n" +
      "🔸 **Silver:**\n" +
      "• 925 Sterling Silver\n" +
      "• Hypoallergenic & tarnish-resistant\n\n" +
      "🔸 **Gemstones:**\n" +
      "• Natural diamonds (conflict-free)\n" +
      "• Morganite, Sapphire, Emerald, Pearl\n" +
      "• All ethically sourced\n\n" +
      "🔸 **Craftsmanship:**\n" +
      "• 40+ hours per piece\n" +
      "• Handcrafted by 15+ master artisans\n" +
      "• Lifetime warranty on all pieces\n\n" +
      "Every piece comes with a certificate of authenticity. 💎✨"
  }

  // ========== REVIEWS / RATINGS ==========
  if (lower.includes('review') || lower.includes('rating') || lower.includes('feedback') ||
    lower.includes('what do people say') || lower.includes('customer')) {
    const topRated = [...productsDatabase].sort((a, b) => b.rating - a.rating).slice(0, 5)
    let response = "⭐ **Customer Reviews at SOUTOU** ⭐\n\n" +
      "Our customers love us! Here's what they say about our top pieces:\n\n"

    topRated.forEach(p => {
      response += `• **${p.name}**\n`
      response += `  ⭐ ${p.rating}/5 — ${p.reviews} reviews\n`
      response += `  📝 "${p.description ? p.description.substring(0, 60) : 'Beautiful piece'}..."\n\n`
    })

    response += "All products have detailed reviews on their product pages. Check them out! 💎"
    return response
  }

  // ========== WEBSITE NAVIGATION ==========
  if (lower.includes('website') || lower.includes('navigate') || lower.includes('page') ||
    lower.includes('where is') || lower.includes('how do i find') || lower.includes('menu')) {
    return "🌐 **SOUTOU Website Guide**\n\n" +
      "🏠 **/ (Home)** — Discover our brand story and featured collections\n" +
      "💎 **/collections** — Browse all collections\n" +
      "📿 **/necklaces** — Necklaces & Pendants\n" +
      "💍 **/rings** — Rings & Bands\n" +
      "👂 **/earrings** — Earrings & Drops\n" +
      "💫 **/bracelets** — Bracelets & Bangles\n" +
      "🛒 **/cart** — Your shopping cart\n" +
      "📦 **/checkout** — Complete your order\n" +
      "ℹ️ **/about** — Our story & craftsmanship\n" +
      "📞 **/contact** — Contact us\n" +
      "⭐ **/reviews** — Customer reviews\n\n" +
      "Use the navigation menu at the top to explore! 💎"
  }

  // ========== THANK YOU / GOODBYE ==========
  if (lower.includes('thank') || lower.includes('thanks') || lower.includes('appreciate')) {
    return "✨ **You're very welcome!** ✨\n\n" +
      "Thank you for visiting SOUTOU — where dreams become wearable art.\n\n" +
      "💎 **Remember:**\n" +
      "• FREE worldwide shipping\n" +
      "• Lifetime warranty on all pieces\n" +
      "• 30-day returns\n\n" +
      "If you need anything else, I'm here 24/7. Have a wonderful day! 🌟"
  }

  if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('see you')) {
    return "💎 **Goodbye!** 💎\n\n" +
      "Thank you for chatting with me today!\n\n" +
      "Come back anytime if you have more questions about SOUTOU jewelry.\n\n" +
      "Wishing you a sparkling day! ✨"
  }

  // ========== GREETINGS ==========
  if (lower.match(/^(hi|hello|hey|greetings|howdy|hola|bonjour|salam|marhaba)/)) {
    return "✨ **Hello! Welcome to SOUTOU!** ✨\n\n" +
      "I'm your 24/7 jewelry assistant. Ask me about:\n\n" +
      "💎 Our collections (Necklaces, Rings, Earrings, Bracelets)\n" +
      "📦 Shipping worldwide (FREE!)\n" +
      "💰 Prices & budgets\n" +
      "🎨 Metal colors & gemstones\n" +
      "✨ Custom jewelry design\n" +
      "🛒 Cart & checkout help\n\n" +
      "**What can I help you find today?** 💫"
  }

  // ========== FALLBACK RESPONSE ==========
  return "💎 **I'm here to help!** 💎\n\n" +
    "I can answer questions about:\n\n" +
    "📿 **Products** - \"What necklaces do you have?\"\n" +
    "🎨 **Colors** - \"What metal colors are available?\"\n" +
    "💰 **Prices** - \"Show me rings under $500\"\n" +
    "📦 **Shipping** - \"Do you ship to France?\"\n" +
    "✨ **About** - \"Tell me about SOUTOU\"\n" +
    "🔨 **Custom** - \"Can I design my own ring?\"\n" +
    "🔧 **Warranty** - \"What's your return policy?\"\n" +
    "🎁 **Gifts** - \"Gift ideas for anniversary\"\n\n" +
    "**Try asking me something specific!** 💫"
}

// Integrate DeepSeek API Strategy
async function fetchAIResponse(userPrompt) {
  const OPENROUTER_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
  const MODEL = 'deepseek/deepseek-chat';

  // Prepare the catalog context for the AI
  const catalogContext = productsDatabase.map(p =>
    `- ${p.name}: $${p.price} (${p.metal}, ${p.gemstone || 'No gemstone'}). Keywords: ${p.keywords.join(', ')}`
  ).join('\n');

  try {
  
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": MODEL,
        "messages": [
          {
            "role": "system",
            "content": `You are the Luxe Concierge for SOUTOU, a world-class luxury jewelry brand founded in 1989 in Paris. 
            Tone: Sophisticated, helpful, and elegant.
            
            Brand Knowledge:
            - Founded by Isabelle Moreau.
            - Offers 100% recycled gold and ethical gemstones.
            - Free worldwide shipping.
            - Lifetime warranty.
            - Custom designs start at $1500.

            Product Catalog:
            ${catalogContext}

            Instructions:
            1. If a user asks for jewelry, recommend specific products from the catalog above.
            2. Always use the exact product names as written in the catalog.
            3. Use markdown (e.g., **bold**) for emphasis.
            4. If asked about something not in the catalog, suggest a custom bespoke piece.`
          },
          ...messages.value.slice(-6).map(m => ({
            "role": m.sender === 'user' ? 'user' : 'assistant',
            "content": m.text
          })),
          { "role": "user", "content": userPrompt }
        ]
      })
    });

    if (!response.ok) throw new Error('API Error');

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("Chatbot Error:", error);
    // Fallback to local logic if API fails or is unavailable
    return getBotResponse(userPrompt) || "I apologize, but I am having trouble connecting to the atelier. Please try again later.";
  }
}

async function sendMessage() {
  if (!userInput.value.trim() || isTyping.value) return
  const userMessage = userInput.value.trim()

  addMessage('user', userMessage)
  userInput.value = ''
  isTyping.value = true

  scrollToBottom()

  const response = await fetchAIResponse(userMessage)

  // Logic to detect if a specific product is mentioned in the prompt OR the AI's response
  const detectedProduct = findProduct(userMessage) ||
    findProduct(response) ||
    (lastAskedContext === 'product_details' ? findProduct(lastProductMention) : null)

  addMessage('bot', response, detectedProduct)
  isTyping.value = false
}

function sendQuickReply(reply) {
  userInput.value = reply
  sendMessage()
}

</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

@keyframes bounce {

  0%,
  60%,
  100% {
    transform: translateY(0);
  }

  30% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style>