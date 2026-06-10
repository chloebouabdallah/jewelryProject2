<template>
  <main class="pt-32 pb-20 px-5">
    <div class="max-w-7xl mx-auto">
      
      <!-- Breadcrumb -->
      <div class="mb-6 md:mb-8">
        <div class="flex items-center gap-2 text-xs md:text-sm text-stone-500 flex-wrap">
          <router-link to="/" class="hover:text-amber-600 transition">Home</router-link>
          <i class="fas fa-chevron-right text-[10px] md:text-xs"></i>
          <router-link :to="`/${product?.category}`" class="hover:text-amber-600 transition">{{ categoryTitle }}</router-link>
          <i class="fas fa-chevron-right text-[10px] md:text-xs"></i>
          <span class="text-amber-700">{{ product?.name }}</span>
        </div>
      </div>
      
      <!-- Product Not Found -->
      <div v-if="!product" class="text-center py-20">
        <i class="fas fa-search text-6xl text-amber-300 mb-4"></i>
        <h2 class="text-2xl font-playfair text-stone-800 mb-2">Product Not Found</h2>
        <p class="text-stone-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <router-link to="/collections" class="inline-block bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition">
          Continue Shopping
        </router-link>
      </div>
      
      <!-- Product Detail -->
      <div v-else class="flex flex-col lg:flex-row gap-8 md:gap-12">
        
        <!-- LEFT: Image Gallery -->
        <div class="lg:w-1/2">
          <div class="sticky top-28 md:top-32">
            <!-- Main Image -->
            <div class="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50 shadow-2xl group">
              <img :src="currentImage" :alt="product.name" class="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105">
              <div v-if="product.badge" class="absolute top-3 left-3 md:top-4 md:left-4 bg-amber-600 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
                {{ product.badge }}
              </div>
            </div>
            
            <!-- Thumbnail Gallery -->
            <div class="flex gap-2 md:gap-4 mt-3 md:mt-4">
              <div 
                v-for="(thumb, index) in product.thumbnails || [product.image]" 
                :key="index"
                @click="currentImage = thumb"
                class="w-14 h-14 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105"
                :class="currentImage === thumb ? 'border-2 border-amber-600' : 'border-2 border-transparent hover:border-amber-600'"
              >
                <img :src="thumb" :alt="product.name" class="w-full h-full object-cover">
              </div>
            </div>
          </div>
        </div>
        
        <!-- RIGHT: Product Info -->
        <div class="lg:w-1/2">
          <!-- Badges -->
          <div class="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
            <span v-for="tag in product.tags" :key="tag" class="bg-amber-100 text-amber-800 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
              {{ tag }}
            </span>
          </div>
          
          <!-- Title -->
          <h1 class="font-playfair text-2xl md:text-4xl lg:text-5xl font-light text-stone-800 mb-2">
            {{ product.name }}
          </h1>
          
          <!-- Rating -->
          <div class="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div class="flex gap-0.5 md:gap-1 text-amber-500 text-sm md:text-base">
              <i v-for="star in 5" :key="star" class="fas fa-star" :class="{ 'text-amber-300': star > Math.floor(product.rating || 5) }"></i>
              <i v-if="(product.rating || 5) % 1 !== 0" class="fas fa-star-half-alt text-amber-500"></i>
            </div>
            <span class="text-stone-500 text-xs md:text-sm">({{ product.reviewCount || 0 }} reviews)</span>
          </div>
          
          <!-- Price -->
          <div class="mb-4 md:mb-6">
            <span class="text-2xl md:text-3xl lg:text-4xl font-bold text-amber-700">${{ product.price.toLocaleString() }}</span>
            <span v-if="product.oldPrice" class="text-stone-400 line-through ml-2 md:ml-3 text-sm md:text-base">${{ product.oldPrice.toLocaleString() }}</span>
            <span v-if="product.oldPrice" class="ml-2 md:ml-3 bg-green-100 text-green-700 px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs">Save {{ Math.round((1 - product.price / product.oldPrice) * 100) }}%</span>
          </div>
          
          <!-- Description -->
          <p class="text-stone-600 text-sm md:text-base leading-relaxed mb-4 md:mb-6">{{ product.description }}</p>
          
          <!-- Key Features -->
          <div class="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6 p-3 md:p-4 bg-amber-50/50 rounded-xl md:rounded-2xl">
            <div v-for="feature in product.features" :key="feature.label" class="flex items-center gap-2 md:gap-3">
              <i :class="feature.icon" class="text-amber-600 text-base md:text-xl"></i>
              <div>
                <p class="text-[10px] md:text-xs text-stone-500">{{ feature.label }}</p>
                <p class="font-semibold text-stone-800 text-xs md:text-sm">{{ feature.value }}</p>
              </div>
            </div>
          </div>
          
          <!-- Quantity -->
          <div class="mb-4 md:mb-6">
            <span class="font-semibold text-stone-800 block mb-1.5 md:mb-2 text-sm md:text-base">Quantity</span>
            <div class="flex items-center gap-3 md:gap-4">
              <div class="flex items-center border-2 border-amber-300 rounded-full overflow-hidden">
                <button @click="decrementQuantity" class="quantity-btn w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-white transition text-lg md:text-xl">-</button>
                <span class="w-10 md:w-12 text-center text-stone-800 font-semibold text-sm md:text-base">{{ quantity }}</span>
                <button @click="incrementQuantity" class="quantity-btn w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-white transition text-lg md:text-xl">+</button>
              </div>
              <span class="text-stone-500 text-xs md:text-sm">{{ product.stock || 10 }} left in stock</span>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
            <button @click="addToCart" class="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white py-2.5 md:py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] text-sm md:text-base">
              <i class="fas fa-shopping-bag text-xs md:text-sm"></i> Add to Cart
            </button>
            <button @click="toggleWishlist" class="flex-1 border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white py-2.5 md:py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base">
              <i :class="isInWishlist ? 'fas fa-heart' : 'far fa-heart'" class="text-xs md:text-sm"></i> {{ isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist' }}
            </button>
          </div>
          
          <!-- Delivery Info -->
          <div class="border-t border-amber-200 pt-4 md:pt-6 flex flex-col gap-2 md:gap-3">
            <div class="flex items-center gap-2 md:gap-3">
              <i class="fas fa-truck text-amber-600 text-base md:text-xl animate-float"></i>
              <div>
                <p class="text-xs md:text-sm font-semibold text-stone-800">Free Express Shipping</p>
                <p class="text-[10px] md:text-xs text-stone-500">Delivery in 3-5 business days</p>
              </div>
            </div>
            <div class="flex items-center gap-2 md:gap-3">
              <i class="fas fa-undo-alt text-amber-600 text-base md:text-xl animate-float" style="animation-delay: 0.5s"></i>
              <div>
                <p class="text-xs md:text-sm font-semibold text-stone-800">30-Day Returns</p>
                <p class="text-[10px] md:text-xs text-stone-500">Easy returns within 30 days</p>
              </div>
            </div>
            <div class="flex items-center gap-2 md:gap-3">
              <i class="fas fa-shield-alt text-amber-600 text-base md:text-xl animate-float" style="animation-delay: 1s"></i>
              <div>
                <p class="text-xs md:text-sm font-semibold text-stone-800">Lifetime Warranty</p>
                <p class="text-[10px] md:text-xs text-stone-500">Included with every purchase</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Related Products -->
      <section v-if="relatedProducts.length > 0" class="mt-12 md:mt-20">
        <div class="text-center mb-6 md:mb-10">
          <span class="text-amber-700 tracking-widest text-[10px] md:text-sm uppercase font-semibold">You May Also Like</span>
          <h2 class="text-xl md:text-2xl lg:text-3xl font-bold font-playfair mt-1 md:mt-2 text-stone-800">Complete Your Look</h2>
          <div class="w-12 md:w-20 h-0.5 bg-amber-500 mx-auto mt-2 md:mt-3 rounded-full"></div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <div v-for="related in relatedProducts" :key="related.id" class="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
            <router-link :to="`/product/${related.id}`" class="block">
              <div class="h-40 sm:h-48 md:h-56 overflow-hidden relative">
                <img :src="related.image" :alt="related.name" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                <div v-if="related.badge" class="absolute top-1 right-1 bg-amber-100/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[8px] md:text-[10px] font-semibold text-amber-800">
                  {{ related.badge }}
                </div>
              </div>
              <div class="p-2 md:p-3">
                <h3 class="font-semibold text-stone-800 text-xs sm:text-sm">{{ related.name }}</h3>
                <p class="text-amber-700 font-bold text-xs sm:text-sm mt-0.5 md:mt-1">${{ related.price.toLocaleString() }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </section>
      
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
useScrollAnimation()

const quantity = ref(1)
const currentImage = ref('')
const isInWishlist = ref(false)

// Complete product database - ALL PRODUCTS
const productsDatabase = {
  // ==================== NECKLACES (1-10) ====================
  1: { 
    id: 1, name: 'Celestial Diamond Necklace', price: 3850, oldPrice: 4800, image: '/necklace2.webp', 
    category: 'necklaces', categoryTitle: 'Necklaces', badge: 'Best Seller', rating: 5, reviewCount: 127, stock: 7,
    tags: ['18k Gold', 'Natural Diamond', 'Limited Edition'],
    description: 'A celestial masterpiece that captures the brilliance of the night sky. This exquisite necklace features a stunning round brilliant diamond set in 18k gold, surrounded by a halo of sparkling pavé diamonds. Each stone is ethically sourced and hand-set by our master artisans.',
    features: [
      { label: 'Diamond Weight', value: '1.25 ct', icon: 'fas fa-gem' },
      { label: 'Gold Weight', value: '3.8 g', icon: 'fas fa-weight-hanging' },
      { label: 'Chain Length', value: '18" (adjustable)', icon: 'fas fa-ruler' },
      { label: 'Certification', value: 'IGI Certified', icon: 'fas fa-certificate' }
    ],
    thumbnails: ['/necklace2.webp', '/necklace3.jpg', '/necklace4.jpg'] 
  },
  2: { 
    id: 2, name: 'Silver Diamond Pendant', price: 2450, oldPrice: null, image: '/necklace3.jpg', 
    category: 'necklaces', categoryTitle: 'Necklaces', badge: 'New', rating: 4.8, reviewCount: 89, stock: 12,
    tags: ['925 Silver', 'Diamond', 'Everyday Elegance'],
    description: 'Elegant silver pendant with a brilliant cut diamond. Perfect for daily wear or special occasions. The classic design never goes out of style.',
    features: [
      { label: 'Diamond Weight', value: '0.75 ct', icon: 'fas fa-gem' },
      { label: 'Silver Weight', value: '2.5 g', icon: 'fas fa-weight-hanging' },
      { label: 'Chain Length', value: '16"-18" adjustable', icon: 'fas fa-ruler' }
    ],
    thumbnails: ['/necklace3.jpg', '/necklace2.webp'] 
  },
  3: { 
    id: 3, name: 'Gold Necklace', price: 1890, oldPrice: null, image: '/necklace4.jpg', 
    category: 'necklaces', categoryTitle: 'Necklaces', badge: null, rating: 4.5, reviewCount: 45, stock: 15,
    tags: ['14k Gold', 'Minimalist'],
    description: 'Simple yet elegant gold necklace. A timeless piece that complements any outfit.',
    features: [{ label: 'Gold Weight', value: '2.0 g', icon: 'fas fa-weight-hanging' }, { label: 'Chain Length', value: '18"', icon: 'fas fa-ruler' }],
    thumbnails: ['/necklace4.jpg'] 
  },
  4: { 
    id: 4, name: 'Gold Necklace', price: 5290, oldPrice: null, image: '/necklace5.jpg', 
    category: 'necklaces', categoryTitle: 'Necklaces', badge: 'Limited', rating: 5, reviewCount: 23, stock: 3,
    tags: ['18k Gold', 'Limited Edition'],
    description: 'Limited edition gold necklace with intricate detailing. Only 50 pieces available worldwide.',
    features: [{ label: 'Gold Weight', value: '5.5 g', icon: 'fas fa-weight-hanging' }, { label: 'Chain Length', value: '20"', icon: 'fas fa-ruler' }],
    thumbnails: ['/necklace5.jpg'] 
  },
  5: { 
    id: 5, name: 'Gold Diamond Necklace', price: 5290, oldPrice: null, image: '/necklace6.jpg', 
    category: 'necklaces', categoryTitle: 'Necklaces', badge: 'Limited', rating: 4.9, reviewCount: 34, stock: 4,
    tags: ['18k Gold', 'Diamond', 'Limited Edition'],
    description: 'Stunning gold and diamond necklace. A true statement piece.',
    features: [{ label: 'Diamond Weight', value: '1.5 ct', icon: 'fas fa-gem' }, { label: 'Gold Weight', value: '4.2 g', icon: 'fas fa-weight-hanging' }],
    thumbnails: ['/necklace6.jpg'] 
  },
  6: { 
    id: 6, name: 'Silver Diamond Necklace', price: 5290, oldPrice: null, image: '/necklace7.jpg', 
    category: 'necklaces', categoryTitle: 'Necklaces', badge: 'Limited', rating: 4.8, reviewCount: 18, stock: 2,
    tags: ['925 Silver', 'Diamond', 'Limited Edition'],
    description: 'Exquisite silver necklace with diamond accents.',
    features: [{ label: 'Diamond Weight', value: '1.2 ct', icon: 'fas fa-gem' }, { label: 'Silver Weight', value: '4.5 g', icon: 'fas fa-weight-hanging' }],
    thumbnails: ['/necklace7.jpg'] 
  },

  // ==================== EARRINGS (101-110) ====================
  101: { 
    id: 101, name: 'Gold Earrings', price: 5290, oldPrice: null, image: '/earring1.avif', 
    category: 'earrings', categoryTitle: 'Earrings', badge: 'Best Seller', rating: 5, reviewCount: 234, stock: 5,
    tags: ['18k Gold', 'Statement Piece'],
    description: 'Luxurious gold earrings perfect for any occasion. Make a statement with these beautiful earrings.',
    features: [{ label: 'Gold Weight', value: '5.2 g', icon: 'fas fa-weight-hanging' }, { label: 'Length', value: '2.5"', icon: 'fas fa-ruler' }],
    thumbnails: ['/earring1.avif', '/earring2.jpg'] 
  },
  102: { 
    id: 102, name: 'Rose Gold Diamond Earrings', price: 1890, oldPrice: 2500, image: '/earring2.jpg', 
    category: 'earrings', categoryTitle: 'Earrings', badge: 'New', rating: 4.9, reviewCount: 56, stock: 8,
    tags: ['Rose Gold', 'Diamond', 'Romantic'],
    description: 'Beautiful rose gold earrings with diamond accents. Perfect for anniversaries and special moments.',
    features: [{ label: 'Diamond Weight', value: '0.5 ct', icon: 'fas fa-gem' }, { label: 'Rose Gold Weight', value: '2.8 g', icon: 'fas fa-weight-hanging' }],
    thumbnails: ['/earring2.jpg', '/earring1.avif'] 
  },
  103: { 
    id: 103, name: 'Rose Gold Diamond Hoops', price: 890, oldPrice: null, image: '/earring3.jpg', 
    category: 'earrings', categoryTitle: 'Earrings', badge: null, rating: 4.6, reviewCount: 78, stock: 20,
    tags: ['Rose Gold', 'Diamond', 'Hoops'],
    description: 'Classic hoop earrings with diamond details. Everyday elegance.',
    features: [{ label: 'Diamond Weight', value: '0.3 ct', icon: 'fas fa-gem' }, { label: 'Hoop Size', value: '1.5"', icon: 'fas fa-ruler' }],
    thumbnails: ['/earring3.jpg'] 
  },
  104: { 
    id: 104, name: 'Gold Diamond Studs', price: 2450, oldPrice: null, image: '/earring4.jpg', 
    category: 'earrings', categoryTitle: 'Earrings', badge: 'Limited', rating: 4.8, reviewCount: 42, stock: 6,
    tags: ['Gold', 'Diamond', 'Studs'],
    description: 'Timeless diamond studs. A must-have for every jewelry collection.',
    features: [{ label: 'Diamond Weight', value: '0.8 ct each', icon: 'fas fa-gem' }, { label: 'Gold Weight', value: '1.5 g', icon: 'fas fa-weight-hanging' }],
    thumbnails: ['/earring4.jpg'] 
  },
  105: { 
    id: 105, name: 'Gold Earrings', price: 2450, oldPrice: null, image: '/earring5.jpg', 
    category: 'earrings', categoryTitle: 'Earrings', badge: 'Limited', rating: 4.7, reviewCount: 31, stock: 4,
    tags: ['Gold', 'Vintage'],
    description: 'Vintage-inspired gold earrings. Unique design for the discerning collector.',
    features: [{ label: 'Gold Weight', value: '3.2 g', icon: 'fas fa-weight-hanging' }, { label: 'Length', value: '2"', icon: 'fas fa-ruler' }],
    thumbnails: ['/earring5.jpg'] 
  },
  106: { 
    id: 106, name: 'Gold Earrings', price: 2450, oldPrice: null, image: '/earring6.jpg', 
    category: 'earrings', categoryTitle: 'Earrings', badge: 'Limited', rating: 4.8, reviewCount: 27, stock: 5,
    tags: ['Gold', 'Modern'],
    description: 'Modern gold earrings with contemporary design.',
    features: [{ label: 'Gold Weight', value: '2.9 g', icon: 'fas fa-weight-hanging' }],
    thumbnails: ['/earring6.jpg'] 
  },

  // ==================== RINGS (201-210) ====================
  201: { 
    id: 201, name: 'Silver Diamond Ring', price: 2975, oldPrice: null, image: '/ring1.jpg', 
    category: 'rings', categoryTitle: 'Rings', badge: 'Best Seller', rating: 5, reviewCount: 312, stock: 3,
    tags: ['925 Silver', 'Diamond', 'Engagement'],
    description: 'Stunning silver ring with brilliant diamond. Perfect for engagements or special occasions.',
    features: [{ label: 'Diamond Weight', value: '1.0 ct', icon: 'fas fa-gem' }, { label: 'Silver Weight', value: '3.5 g', icon: 'fas fa-weight-hanging' }, { label: 'Ring Size', value: 'Adjustable 6-8', icon: 'fas fa-ring' }],
    thumbnails: ['/ring1.jpg', '/ring3.jpg'] 
  },
  202: { 
    id: 202, name: 'Rose Gold Morganite Ring', price: 1590, oldPrice: 2200, image: '/ring2.webp', 
    category: 'rings', categoryTitle: 'Rings', badge: 'New', rating: 4.7, reviewCount: 45, stock: 10,
    tags: ['Rose Gold', 'Morganite', 'Romantic'],
    description: 'Romantic rose gold ring with morganite gemstone. A perfect gift for your loved one.',
    features: [{ label: 'Morganite Weight', value: '1.2 ct', icon: 'fas fa-gem' }, { label: 'Rose Gold Weight', value: '2.8 g', icon: 'fas fa-weight-hanging' }],
    thumbnails: ['/ring2.webp', '/ring1.jpg'] 
  },
  203: { 
    id: 203, name: 'Silver Diamond Ring', price: 2250, oldPrice: null, image: '/ring3.jpg', 
    category: 'rings', categoryTitle: 'Rings', badge: null, rating: 4.6, reviewCount: 89, stock: 8,
    tags: ['Silver', 'Diamond', 'Classic'],
    description: 'Classic silver diamond ring. Timeless elegance.',
    features: [{ label: 'Diamond Weight', value: '0.75 ct', icon: 'fas fa-gem' }, { label: 'Silver Weight', value: '2.5 g', icon: 'fas fa-weight-hanging' }],
    thumbnails: ['/ring3.jpg', '/ring1.jpg'] 
  },
  204: { 
    id: 204, name: 'Gold Ring', price: 3450, oldPrice: null, image: '/ring4.jpg', 
    category: 'rings', categoryTitle: 'Rings', badge: 'Limited', rating: 4.9, reviewCount: 56, stock: 2,
    tags: ['Gold', 'Limited Edition'],
    description: 'Limited edition gold ring. Only 25 pieces available.',
    features: [{ label: 'Gold Weight', value: '4.5 g', icon: 'fas fa-weight-hanging' }],
    thumbnails: ['/ring4.jpg'] 
  },
  205: { 
    id: 205, name: 'Gold Ring', price: 450, oldPrice: null, image: '/ring5.jpg', 
    category: 'rings', categoryTitle: 'Rings', badge: null, rating: 4.5, reviewCount: 234, stock: 25,
    tags: ['Gold', 'Minimalist'],
    description: 'Simple gold ring. Perfect for daily wear.',
    features: [{ label: 'Gold Weight', value: '1.2 g', icon: 'fas fa-weight-hanging' }],
    thumbnails: ['/ring5.jpg'] 
  },
  206: { 
    id: 206, name: 'Gold Diamond Ring', price: 2450, oldPrice: null, image: '/ring6.jpg', 
    category: 'rings', categoryTitle: 'Rings', badge: 'Limited', rating: 4.8, reviewCount: 67, stock: 4,
    tags: ['Gold', 'Diamond', 'Vintage'],
    description: 'Vintage-inspired gold diamond ring. A true heirloom piece.',
    features: [{ label: 'Diamond Weight', value: '0.9 ct', icon: 'fas fa-gem' }, { label: 'Gold Weight', value: '3.2 g', icon: 'fas fa-weight-hanging' }],
    thumbnails: ['/ring6.jpg'] 
  },

  // ==================== BRACELETS (301-310) ====================
  301: { 
    id: 301, name: 'Silver Diamond Bracelet', price: 299, oldPrice: 450, image: '/bracelet1.webp', 
    category: 'bracelets', categoryTitle: 'Bracelets', badge: 'Best Seller', rating: 4.8, reviewCount: 178, stock: 15,
    tags: ['925 Silver', 'Diamond', 'Everyday'],
    description: 'Elegant silver bracelet with diamond details. Perfect for everyday wear.',
    features: [{ label: 'Diamond Weight', value: '0.3 ct', icon: 'fas fa-gem' }, { label: 'Length', value: '7"', icon: 'fas fa-ruler' }, { label: 'Silver Weight', value: '3.5 g', icon: 'fas fa-weight-hanging' }],
    thumbnails: ['/bracelet1.webp', '/bracelet2.jpg'] 
  },
  302: { 
    id: 302, name: 'Gold Diamond Tennis Bracelet', price: 2890, oldPrice: 3800, image: '/bracelet2.jpg', 
    category: 'bracelets', categoryTitle: 'Bracelets', badge: 'New', rating: 5, reviewCount: 67, stock: 6,
    tags: ['Gold', 'Diamond', 'Tennis Bracelet'],
    description: 'Classic tennis bracelet with diamonds. A timeless accessory.',
    features: [{ label: 'Diamond Weight', value: '2.0 ct', icon: 'fas fa-gem' }, { label: 'Gold Weight', value: '5.5 g', icon: 'fas fa-weight-hanging' }, { label: 'Length', value: '7.5"', icon: 'fas fa-ruler' }],
    thumbnails: ['/bracelet2.jpg', '/bracelet1.webp'] 
  },
  303: { 
    id: 303, name: 'Gold Diamond Chain Bracelet', price: 590, oldPrice: null, image: '/bracelet3.jpg', 
    category: 'bracelets', categoryTitle: 'Bracelets', badge: null, rating: 4.6, reviewCount: 92, stock: 12,
    tags: ['Gold', 'Diamond', 'Chain'],
    description: 'Delicate gold chain bracelet with diamond accents.',
    features: [{ label: 'Diamond Weight', value: '0.2 ct', icon: 'fas fa-gem' }, { label: 'Length', value: '6.5"', icon: 'fas fa-ruler' }],
    thumbnails: ['/bracelet3.jpg'] 
  },
  304: { 
    id: 304, name: 'Silver Diamond Bracelet', price: 450, oldPrice: null, image: '/bracelet4.jpg', 
    category: 'bracelets', categoryTitle: 'Bracelets', badge: 'Limited', rating: 4.7, reviewCount: 45, stock: 5,
    tags: ['Silver', 'Diamond', 'Vintage'],
    description: 'Vintage-style silver bracelet with diamond details.',
    features: [{ label: 'Diamond Weight', value: '0.4 ct', icon: 'fas fa-gem' }, { label: 'Length', value: '7"', icon: 'fas fa-ruler' }],
    thumbnails: ['/bracelet4.jpg'] 
  },
  305: { 
    id: 305, name: 'Silver Diamond Bracelet', price: 450, oldPrice: null, image: '/bracelet5.jpg', 
    category: 'bracelets', categoryTitle: 'Bracelets', badge: 'Limited', rating: 4.6, reviewCount: 38, stock: 4,
    tags: ['Silver', 'Diamond', 'Minimalist'],
    description: 'Minimalist silver bracelet with small diamond accents.',
    features: [{ label: 'Diamond Weight', value: '0.25 ct', icon: 'fas fa-gem' }, { label: 'Length', value: '6.5"', icon: 'fas fa-ruler' }],
    thumbnails: ['/bracelet5.jpg'] 
  },
  306: { 
    id: 306, name: 'Silver Diamond Bracelet', price: 450, oldPrice: null, image: '/bracelet6.jpg', 
    category: 'bracelets', categoryTitle: 'Bracelets', badge: 'Limited', rating: 4.7, reviewCount: 41, stock: 3,
    tags: ['Silver', 'Diamond', 'Classic'],
    description: 'Classic silver bracelet with diamond pattern.',
    features: [{ label: 'Diamond Weight', value: '0.35 ct', icon: 'fas fa-gem' }, { label: 'Length', value: '7"', icon: 'fas fa-ruler' }],
    thumbnails: ['/bracelet6.jpg'] 
  }
}

// Get product by ID from route
const productId = computed(() => parseInt(route.params.id))
const product = computed(() => productsDatabase[productId.value] || null)

const categoryTitle = computed(() => {
  const titles = { necklaces: 'Necklaces', earrings: 'Earrings', rings: 'Rings', bracelets: 'Bracelets' }
  return titles[product.value?.category] || ''
})

// Related products (same category, different ID)
const relatedProducts = computed(() => {
  if (!product.value) return []
  const related = Object.values(productsDatabase)
    .filter(p => p.category === product.value.category && p.id !== product.value.id)
    .slice(0, 4)
  
  // Debug log to check if related products are found
  console.log('Related products:', related)
  
  return related
})

const incrementQuantity = () => {
  if (quantity.value < (product.value?.stock || 10)) {
    quantity.value++
  }
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = () => {
  if (product.value) {
    cartStore.addToCart({
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      quantity: quantity.value
    })
  }
}

const toggleWishlist = () => {
  isInWishlist.value = !isInWishlist.value
}

onMounted(() => {
  if (product.value?.image) {
    currentImage.value = product.value.image
  }
})
</script>

<style scoped>
.quantity-btn {
  transition: all 0.2s;
}
</style>