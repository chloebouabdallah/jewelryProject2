<template>
  <div>
    <!-- Chatbot Icon Button -->
    <button 
      @click="toggleChatbot" 
      class="fixed bottom-6 right-6 z-50 bg-amber-600 hover:bg-amber-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
    >
      <i v-if="!isOpen" class="fas fa-comment-dots text-2xl"></i>
      <i v-else class="fas fa-times text-2xl"></i>
    </button>

    <!-- Chatbot Sidebar -->
    <Transition name="slide">
      <div v-if="isOpen" class="fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-2xl z-50 flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-amber-600 to-amber-500 text-white p-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <i class="fas fa-gem text-xl"></i>
            <div>
              <h3 class="font-semibold">SOUTOU Assistant</h3>
              <p class="text-xs opacity-90">Online | Ready to help</p>
            </div>
          </div>
          <button @click="toggleChatbot" class="text-white hover:text-amber-200 transition">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-amber-50/30">
          <div v-for="(msg, index) in messages" :key="index" class="flex" :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'">
            <div 
              class="max-w-[80%] p-3 rounded-2xl"
              :class="msg.sender === 'user' 
                ? 'bg-amber-600 text-white rounded-br-sm' 
                : 'bg-white border border-amber-200 text-stone-700 rounded-bl-sm'"
            >
              <p class="text-sm">{{ msg.text }}</p>
              <p class="text-[10px] mt-1 opacity-70">{{ msg.time }}</p>
            </div>
          </div>
          <div v-if="isTyping" class="flex justify-start">
            <div class="bg-white border border-amber-200 p-3 rounded-2xl rounded-bl-sm">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Replies -->
        <div class="px-4 py-2 border-t border-amber-100">
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="reply in quickReplies" 
              :key="reply"
              @click="sendQuickReply(reply)"
              class="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full hover:bg-amber-200 transition"
            >
              {{ reply }}
            </button>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-amber-100 bg-white">
          <div class="flex gap-2">
            <input 
              v-model="userInput" 
              @keypress.enter="sendMessage"
              type="text" 
              placeholder="Type your message..." 
              class="flex-1 px-4 py-2 border border-amber-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
            >
            <button 
              @click="sendMessage" 
              :disabled="!userInput.trim()"
              class="bg-amber-600 hover:bg-amber-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition disabled:opacity-50"
            >
              <i class="fas fa-paper-plane text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const isOpen = ref(false)
const userInput = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)
const lastContext = ref(null) // Track conversation context

// Comprehensive knowledge base
const knowledgeBase = {
  // ============= PRODUCTS =============
  products: {
    keywords: ['product', 'collection', 'jewelry', 'piece', 'item', 'have'],
    context: 'products',
    response: "We offer 4 main collections:\n💎 NECKLACES & PENDANTS - Celestial Diamond Necklace ($3,850), Silver Diamond Pendant ($2,450)\n💍 RINGS & BANDS - Silver Diamond Ring ($2,975), Rose Gold Morganite Ring ($1,590)\n👂 EARRINGS & DROPS - Gold Earrings ($5,290), Rose Gold Diamond Earrings ($1,890)\n💫 BRACELETS & BANGLES - Silver Diamond Bracelet ($299), Gold Diamond Tennis Bracelet ($2,890)\n\nWhat specific type are you interested in?",
    details: {
      necklace: "Our necklaces include: Celestial Diamond Necklace ($3,850), Silver Diamond Pendant ($2,450), Gold Necklace ($1,890), Gold Diamond Necklace ($5,290). All come with 18\" chain length.",
      earring: "Our earrings include: Gold Earrings ($5,290), Rose Gold Diamond Earrings ($1,890), Rose Gold Diamond Hoops ($890), Gold Diamond Studs ($2,450).",
      ring: "Our rings include: Silver Diamond Ring ($2,975), Rose Gold Morganite Ring ($1,590), Gold Ring ($450-$3,450), Gold Diamond Ring ($2,450).",
      bracelet: "Our bracelets include: Silver Diamond Bracelet ($299), Gold Diamond Tennis Bracelet ($2,890), Gold Diamond Chain Bracelet ($590)."
    }
  },
  
  // ============= PRICES =============
  prices: {
    keywords: ['price', 'cost', 'how much', 'expensive', 'cheap', 'affordable', 'budget', 'dollar', '$'],
    context: 'prices',
    response: "Our prices range from $45 to $5,290:\n🟢 Under $500: Silver Diamond Bracelet ($299), Gold Ring ($450)\n🟡 $500-$1,500: Gold Diamond Chain Bracelet ($590), Rose Gold Diamond Hoops ($890)\n🟠 $1,500-$3,000: Silver Diamond Pendant ($2,450), Rose Gold Morganite Ring ($1,590)\n🔴 $3,000+: Celestial Diamond Necklace ($3,850), Gold Earrings ($5,290)\n\nWhat budget range are you looking for?",
    details: {
      under500: "Items under $500: Silver Diamond Bracelet ($299), Gold Ring ($450). Great for everyday wear!",
      between500_1500: "Items $500-$1,500: Gold Diamond Chain Bracelet ($590), Rose Gold Diamond Hoops ($890). Perfect for gifting!",
      between1500_3000: "Items $1,500-$3,000: Silver Diamond Pendant ($2,450), Rose Gold Morganite Ring ($1,590), Gold Diamond Studs ($2,450).",
      over3000: "Premium items $3,000+: Celestial Diamond Necklace ($3,850), Gold Earrings ($5,290), Gold Diamond Tennis Bracelet ($2,890)."
    }
  },
  
  // ============= COLORS / METAL =============
  colors: {
    keywords: ['color', 'colour', 'gold', 'silver', 'rose gold', 'white gold', 'platinum', 'metal', 'yellow gold', 'pink gold'],
    context: 'colors',
    response: "Our jewelry comes in these beautiful metal colors:\n✨ YELLOW GOLD - Classic and timeless\n🤍 WHITE GOLD - Modern and elegant\n💗 ROSE GOLD - Romantic and trendy\n⚪ PLATINUM - Premium and durable\n🔘 SILVER - Affordable and versatile\n\nFor diamond colors, we offer D-H color grades (colorless to near-colorless). What color are you interested in?",
    details: {
      yellow_gold: "Yellow gold is our most popular choice! Available in 14k and 18k. Perfect for classic, timeless pieces.",
      rose_gold: "Rose gold has a romantic pink hue. Very popular for engagement rings and anniversary gifts!",
      white_gold: "White gold offers a sleek, modern look similar to platinum but more affordable.",
      platinum: "Platinum is our premium option - hypoallergenic, durable, and naturally white. Higher price point.",
      silver: "925 Sterling silver is affordable and versatile. Great for everyday jewelry."
    }
  },
  
  // ============= SHIPPING =============
  shipping: {
    keywords: ['shipping', 'delivery', 'ship', 'send', 'shipping cost', 'delivery time', 'free shipping', 'tracking'],
    context: 'shipping',
    response: "📦 FREE Express Shipping worldwide on all orders! • Delivery: 3-5 business days • Fully insured & trackable • Expedited 2-3 day shipping available for orders over $500 • Signature required upon delivery",
    details: {
      international: "We ship worldwide! Delivery times: USA 3-4 days, Europe 2-3 days, Asia 5-7 days, Australia 5-7 days",
      tracking: "You'll receive a tracking number via email within 24 hours of order confirmation."
    }
  },
  
  // ============= RETURNS =============
  returns: {
    keywords: ['return', 'refund', 'exchange', 'return policy', 'money back', '30 day'],
    context: 'returns',
    response: "🔄 30-Day Return Policy:\n• Full refund or exchange within 30 days\n• Items must be unused with original packaging\n• Free return shipping for exchanges\n• Refunds processed within 5-7 business days",
    details: {
      howto: "To start a return, contact us at returns@soutou.com with your order number and reason for return.",
      exceptions: "Custom engraved items and final sale pieces cannot be returned unless defective."
    }
  },
  
  // ============= WARRANTY =============
  warranty: {
    keywords: ['warranty', 'guarantee', 'lifetime', 'repair', 'fix', 'broken', 'damaged'],
    context: 'warranty',
    response: "🔧 Lifetime Warranty Included!\n• Covers manufacturing defects\n• Free cleaning & inspection for life\n• Free repairs for defects\n• 50% off for accidental damage repairs\n• Visit our atelier or mail to us (we cover shipping for claims)",
    details: {
      claim: "To file a warranty claim, email warranty@soutou.com with photos of the issue and your order number.",
      exclusions: "Normal wear and tear, lost stones, and accidental damage are not covered but can be repaired at 50% cost."
    }
  },
  
  // ============= DISCOUNTS =============
  discounts: {
    keywords: ['discount', 'sale', 'promo', 'coupon', 'code', 'offer', 'deal', 'save', 'percent', '%'],
    context: 'discounts',
    response: "🎉 CURRENT OFFERS:\n• First-time buyers: 10% off with code: SOUTOU10\n• Free shipping on all orders (automatic)\n• Up to 20% off select items in our Sale section\n• Newsletter subscribers get exclusive 15% off\n• Refer a friend: You both get $25 off\n\nSeasonal sales coming soon! 🎄",
    details: {
      newsletter: "Sign up for our newsletter to get 15% off your next purchase and exclusive early access to sales!",
      referral: "Share your unique referral link with friends. When they make their first purchase ($50+), you both get $25 credit!"
    }
  },
  
  // ============= SIZING =============
  sizing: {
    keywords: ['size', 'sizing', 'ring size', 'chain length', 'fit', 'measure', 'how to measure'],
    context: 'sizing',
    response: "📏 SIZING GUIDE:\n💍 RINGS: US sizes 4-12 (half sizes available). Free sizing kit available!\n📿 CHAINS: 16\", 18\", 20\", 22\". Most popular is 18\"\n📐 BRACELETS: 6.5\", 7\", 7.5\", 8\"\n\nNeed help? Request our free sizing kit or visit our atelier!",
    details: {
      measure_ring: "To measure ring size: Wrap a string around your finger, mark where it overlaps, and measure the length in mm. Compare with our size chart.",
      measure_chain: "For chain length: 16\" sits at collarbone, 18\" at décolletage, 20\" below collarbone, 22\" at bust line."
    }
  },
  
  // ============= MATERIALS =============
  materials: {
    keywords: ['material', 'materials', 'made of', 'gold purity', 'carat', 'karat', 'sterling', '925', '14k', '18k', '24k'],
    context: 'materials',
    response: "✨ PREMIUM MATERIALS:\n• 14k Gold (58.3% gold) - Durable, great for daily wear\n• 18k Gold (75% gold) - Richer color, premium quality\n• 925 Sterling Silver - Tarnish-resistant, affordable\n• Platinum - Hypoallergenic, most durable\n• All gold is 100% recycled ♻️\n• Diamonds are conflict-free certified",
    details: {
      recycled: "All our gold is 100% recycled! We're committed to sustainable luxury.",
      certification: "All diamonds over 0.5ct come with IGI/GIA certification."
    }
  },
  
  // ============= CONTACT =============
  contact: {
    keywords: ['contact', 'email', 'phone', 'address', 'store', 'atelier', 'location', 'call', 'message'],
    context: 'contact',
    response: "📍 Visit us at: 123 Rue de la Paix, 75002 Paris, France\n📞 Phone: +33 (0)1 23 45 67 89\n✉️ Email: hello@soutou.com\n🕒 Hours: Mon-Fri 10am-7pm, Sat 11am-6pm, Sun Closed\n💬 Live chat available here!",
    details: {
      support: "Customer support available 24/7 via email. Response within 24 hours.",
      appointment: "For custom design consultations, please book an appointment via email."
    }
  },
  
  // ============= GIFT =============
  gift: {
    keywords: ['gift', 'present', 'gift box', 'gift wrap', 'gift card', 'anniversary', 'birthday', 'wedding', 'valentine'],
    context: 'gift',
    response: "🎁 GIFT SERVICES:\n• All orders come in luxury gift box (free)\n• Personalized gift message (free)\n• Premium gift wrapping ($5)\n• E-gift cards ($25-$1,000)\n• Gift receipts included\n• Rush shipping available for last-minute gifts",
    details: {
      giftcard: "Gift cards never expire and can be used online or in-store. Perfect for any occasion!",
      engraving: "Free engraving available on select pieces (up to 20 characters). Add at checkout."
    }
  },
  
  // ============= CUSTOM =============
  custom: {
    keywords: ['custom', 'customize', 'personalized', 'engraving', 'bespoke', 'design', 'made to order'],
    context: 'custom',
    response: "✨ CUSTOM DESIGN SERVICES:\n• Custom ring design starting at $1,500\n• Engraving (free on select pieces)\n• Bespoke engagement rings\n• 4-6 weeks production time\n• Free design consultation\nContact our design team: custom@soutou.com",
    details: {
      process: "Custom design process: 1) Consultation 2) Sketch & CAD 3) Wax model 4) Casting 5) Finishing",
      timeline: "Most custom pieces take 4-6 weeks. Rush orders available (+25% fee, 2-3 weeks)."
    }
  },
  
  // ============= CARE =============
  care: {
    keywords: ['care', 'clean', 'cleaning', 'maintenance', 'how to clean', 'store', 'protect', 'tarnish'],
    context: 'care',
    response: "🧼 JEWELRY CARE TIPS:\n• Clean with mild soap + soft cloth\n• Avoid chemicals, perfume, chlorine\n• Store in separate pouches or boxes\n• Remove before swimming, gym, shower\n• Professional cleaning free at our atelier\n• Ultrasonic cleaners safe for diamonds only (not pearls/emeralds)",
    details: {
      home_cleaning: "Home cleaning: Mix warm water with mild dish soap, soak 10-15 min, gently brush with soft toothbrush, rinse, dry with soft cloth.",
      professional: "Free professional cleaning at our atelier - just drop by anytime during business hours!"
    }
  }
}

// Context-aware response mapping
const contextResponses = {
  prices: {
    color: "For metal colors in your price range: You can find Yellow Gold, White Gold, and Rose Gold options across all price points. Silver is most affordable ($45-$500), while Platinum is premium ($1,500+). What specific price range are you looking at?",
    shipping: "Shipping is free regardless of price! All orders get free express shipping.",
    discount: "We have discounts available across all price ranges. Current offers: 10% off first order with code SOUTOU10, up to 20% off on sale items.",
    product: "You can find beautiful pieces in every price range. Would you like me to recommend specific products within your budget?"
  },
  shipping: {
    time: "Delivery typically takes 3-5 business days worldwide. Expedited shipping (2-3 days) available for orders over $500.",
    cost: "Shipping is FREE on all orders! No minimum purchase required.",
    tracking: "You'll receive a tracking number via email within 24 hours of order confirmation."
  },
  products: {
    price: "Our products range from $45 to $5,290. The Silver Diamond Bracelet is $299, while our premium Gold Earrings are $5,290.",
    color: "Products come in Yellow Gold, White Gold, Rose Gold, Platinum, and Silver. Which metal color interests you?",
    shipping: "All products ship free worldwide! Delivery in 3-5 business days.",
    material: "We use 14k Gold, 18k Gold, 925 Sterling Silver, and Platinum. All conflict-free diamonds."
  },
  colors: {
    price: "Metal color affects price. Yellow/White/Rose Gold are similar in price. Platinum is more expensive (+30-50%), Silver is most affordable.",
    product: "We have necklaces, rings, earrings, and bracelets in all metal colors. What type of jewelry are you looking for?",
    shipping: "All metal colors ship the same way - free express shipping worldwide!"
  }
}

// Generic fallback responses
const fallbackResponses = [
  "💎 Thanks for asking! Could you tell me more about what you're looking for? (Products, prices, shipping, colors, etc.)",
  "✨ I'm here to help! Are you interested in our jewelry collections, pricing, shipping, or something else?",
  "💍 I'd love to help! Do you have a specific product in mind, or would you like me to show you our bestsellers?",
  "🔧 Feel free to ask me about: products, prices, colors, shipping, returns, warranty, discounts, sizing, materials, or custom designs!"
]

function getCurrentTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

function toggleChatbot() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function addMessage(sender, text) {
  messages.value.push({
    sender,
    text,
    time: getCurrentTime()
  })
  scrollToBottom()
}

// Smart response finder with context
function findSmartResponse(message) {
  const lowerMessage = message.toLowerCase()
  
  // Try to understand the user's intent
  let matchedCategory = null
  let matchedDetail = null
  
  // Check for follow-up questions based on context
  if (lastContext.value) {
    // User asking about colors after talking about prices
    if (lastContext.value === 'prices' && (lowerMessage.includes('color') || lowerMessage.includes('colour') || lowerMessage.includes('gold') || lowerMessage.includes('silver'))) {
      return contextResponses.prices.color
    }
    // User asking about products after talking about colors
    if (lastContext.value === 'colors' && (lowerMessage.includes('product') || lowerMessage.includes('necklace') || lowerMessage.includes('ring') || lowerMessage.includes('earring'))) {
      return contextResponses.colors.product
    }
    // User asking about price after talking about products
    if (lastContext.value === 'products' && (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much'))) {
      return contextResponses.products.price
    }
    // User asking about shipping time after talking about shipping
    if (lastContext.value === 'shipping' && (lowerMessage.includes('time') || lowerMessage.includes('day') || lowerMessage.includes('how long'))) {
      return contextResponses.shipping.time
    }
  }
  
  // Check each category
  for (const [key, data] of Object.entries(knowledgeBase)) {
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword)) {
        matchedCategory = key
        lastContext.value = data.context
        
        // Check for specific details (e.g., "necklace" within products)
        if (data.details) {
          for (const [detailKey, detailResponse] of Object.entries(data.details)) {
            if (lowerMessage.includes(detailKey)) {
              return detailResponse
            }
          }
        }
        return data.response
      }
    }
  }
  
  // If no match found, reset context and give helpful response
  lastContext.value = null
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
}

async function sendMessage() {
  if (!userInput.value.trim()) return
  
  const userMessage = userInput.value.trim()
  addMessage('user', userMessage)
  userInput.value = ''
  
  isTyping.value = true
  scrollToBottom()
  
  setTimeout(() => {
    const response = findSmartResponse(userMessage)
    addMessage('bot', response)
    isTyping.value = false
  }, 600)
}

function sendQuickReply(reply) {
  userInput.value = reply
  sendMessage()
}

const quickReplies = [
  '💍 Products',
  '💰 Prices',
  '🎨 Colors',
  '📦 Shipping',
  '🔄 Returns',
  '🔧 Warranty',
  '🏷️ Discounts',
  '📏 Sizing',
  '✨ Materials',
  '🎁 Gifts'
]

const messages = ref([
  {
    sender: 'bot',
    text: "✨ Hello! I'm SOUTOU, your jewelry assistant! 💎\n\nI can help you with:\n• Products & Collections\n• Prices & Budget\n• Metal Colors (Gold, Silver, Rose Gold, Platinum)\n• Shipping & Delivery\n• Returns & Warranty\n• Discounts & Offers\n• Sizing & Fit\n• Materials & Care\n\nWhat would you like to know? 💍",
    time: getCurrentTime()
  }
])

// Auto-scroll when messages change
watch(messages, () => {
  scrollToBottom()
}, { deep: true })
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
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out;
}
</style>