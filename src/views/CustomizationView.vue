<template>
  <main class="pt-32 pb-20 px-5">
    <div class="max-w-7xl mx-auto">
      <!-- Page Header with Category -->
      <div class="text-center mb-12 fade-on-scroll fade-up">
        <h1
          class="font-playfair text-4xl md:text-5xl font-light text-stone-800 mb-3"
        >
          Customize Your {{ categoryDisplay }}
        </h1>
        <div class="w-20 h-0.5 bg-amber-500 mx-auto rounded-full"></div>
        <p class="text-stone-600 mt-4 text-sm md:text-base">
          {{ categoryDescription }}
        </p>
      </div>

      <!-- Show login prompt if not authenticated -->
      <div
        v-if="!authStore.isAuthenticated"
        class="bg-white rounded-2xl shadow-md p-8 md:p-12 text-center max-w-2xl mx-auto"
      >
        <i class="fas fa-lock text-5xl text-amber-400 mb-4"></i>
        <h2 class="text-2xl font-playfair font-semibold text-stone-800 mb-3">
          Login to Start Customizing
        </h2>
        <p class="text-stone-600 mb-6 max-w-md mx-auto">
          Create your perfect custom {{ categoryDisplay.toLowerCase() }}. Login
          or sign up to save your designs and access exclusive customization
          options.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="authStore.openAuthModal('login')"
            class="bg-amber-600 text-white px-8 py-3 rounded-full hover:bg-amber-700 transition font-semibold"
          >
            Login
          </button>
          <button
            @click="authStore.openAuthModal('signup')"
            class="border-2 border-amber-600 text-amber-600 px-8 py-3 rounded-full hover:bg-amber-600 hover:text-white transition font-semibold"
          >
            Sign Up
          </button>
        </div>
      </div>

      <!-- Customization Tool (only shown when logged in) -->
      <div v-else>
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- LEFT: Customization Controls -->
          <div class="lg:w-1/2 fade-on-scroll fade-right">
            <div class="bg-white rounded-2xl shadow-md p-6 sticky top-28">
              <!-- Metal Selection -->
              <div class="mb-6">
                <label class="block text-stone-700 font-semibold text-sm mb-3"
                  >METAL</label
                >
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="metal in metals"
                    :key="metal.value"
                    @click="selectedMetal = metal.value"
                    class="px-4 py-2 rounded-full border-2 transition text-sm"
                    :class="
                      selectedMetal === metal.value
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-stone-200 hover:border-amber-300 text-stone-600'
                    "
                  >
                    {{ metal.label }}
                  </button>
                </div>
              </div>

              <!-- Setting Style -->
              <div class="mb-6">
                <label class="block text-stone-700 font-semibold text-sm mb-3"
                  >SETTING STYLE</label
                >
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="style in settingStyles"
                    :key="style.value"
                    @click="selectedSetting = style.value"
                    class="px-4 py-2 rounded-full border-2 transition text-sm"
                    :class="
                      selectedSetting === style.value
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-stone-200 hover:border-amber-300 text-stone-600'
                    "
                  >
                    {{ style.label }}
                  </button>
                </div>
              </div>

              <!-- Shape -->
              <div class="mb-6">
                <label class="block text-stone-700 font-semibold text-sm mb-3"
                  >SHAPE</label
                >
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="shape in shapes"
                    :key="shape.value"
                    @click="selectedShape = shape.value"
                    class="px-4 py-2 rounded-full border-2 transition text-sm"
                    :class="
                      selectedShape === shape.value
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-stone-200 hover:border-amber-300 text-stone-600'
                    "
                  >
                    {{ shape.label }}
                  </button>
                </div>
              </div>

              <!-- Carat Weight -->
              <div class="mb-6">
                <label class="block text-stone-700 font-semibold text-sm mb-3"
                  >CARAT</label
                >
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="carat in carats"
                    :key="carat"
                    @click="selectedCarat = carat"
                    class="px-4 py-2 rounded-full border-2 transition text-sm"
                    :class="
                      selectedCarat === carat
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-stone-200 hover:border-amber-300 text-stone-600'
                    "
                  >
                    {{ carat === 'all' ? 'All' : carat + 'ct' }}
                  </button>
                </div>
                <button class="mt-2 text-amber-600 text-sm hover:underline">
                  More sizes...
                </button>
              </div>

              <!-- Band Type -->
              <div class="mb-6">
                <label class="block text-stone-700 font-semibold text-sm mb-3"
                  >BAND TYPE</label
                >
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="band in bandTypes"
                    :key="band.value"
                    @click="selectedBand = band.value"
                    class="px-4 py-2 rounded-full border-2 transition text-sm"
                    :class="
                      selectedBand === band.value
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-stone-200 hover:border-amber-300 text-stone-600'
                    "
                  >
                    {{ band.label }}
                  </button>
                </div>
              </div>

              <!-- Accents -->
              <div class="mb-6">
                <label class="block text-stone-700 font-semibold text-sm mb-3"
                  >ACCENTS</label
                >
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="accent in accents"
                    :key="accent.value"
                    @click="selectedAccent = accent.value"
                    class="px-4 py-2 rounded-full border-2 transition text-sm"
                    :class="
                      selectedAccent === accent.value
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-stone-200 hover:border-amber-300 text-stone-600'
                    "
                  >
                    {{ accent.label }}
                  </button>
                </div>
              </div>

              <!-- Summary Section -->
              <div
                v-if="hasCustomizations"
                class="border-t border-amber-100 pt-4 mt-4"
              >
                <h4 class="font-semibold text-stone-800 text-sm mb-2">
                  Your Selection
                </h4>
                <div class="space-y-1 text-sm text-stone-600">
                  <p v-if="selectedMetal !== 'all'">
                    Metal:
                    <span class="font-medium text-stone-800">{{
                      getMetalLabel
                    }}</span>
                  </p>
                  <p v-if="selectedSetting !== 'all'">
                    Setting:
                    <span class="font-medium text-stone-800">{{
                      getSettingLabel
                    }}</span>
                  </p>
                  <p v-if="selectedShape !== 'all'">
                    Shape:
                    <span class="font-medium text-stone-800">{{
                      getShapeLabel
                    }}</span>
                  </p>
                  <p v-if="selectedCarat !== 'all'">
                    Carat:
                    <span class="font-medium text-stone-800"
                      >{{ selectedCarat }}ct</span
                    >
                  </p>
                  <p v-if="selectedBand !== 'all'">
                    Band:
                    <span class="font-medium text-stone-800">{{
                      getBandLabel
                    }}</span>
                  </p>
                  <p v-if="selectedAccent !== 'all'">
                    Accents:
                    <span class="font-medium text-stone-800">{{
                      getAccentLabel
                    }}</span>
                  </p>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                v-if="hasCustomizations"
                @click="submitCustomization"
                class="w-full mt-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-full font-semibold hover:scale-[1.02] transition shadow-md"
              >
                Get a Quote
              </button>
            </div>
          </div>

          <!-- RIGHT: Description Paragraph (only when customizations exist) -->
          <div class="lg:w-1/2 fade-on-scroll fade-left">
            <div
              v-if="hasCustomizations"
              class="bg-white rounded-2xl shadow-md p-6 sticky top-28"
            >
              <h4 class="font-semibold text-stone-800 mb-3 text-lg">
                Your Customization Summary
              </h4>
              <p class="text-stone-600 text-sm md:text-base leading-relaxed">
                <span v-if="selectedMetal !== 'all'">
                  You've designed a beautiful
                  <span class="font-medium text-stone-800">{{
                    getMetalLabel
                  }}</span>
                </span>
                <span v-else> You've designed a beautiful </span>
                {{ categoryDisplay.toLowerCase() }}
                <span v-if="selectedShape !== 'all'">
                  with a
                  <span class="font-medium text-stone-800">{{
                    getShapeLabel
                  }}</span>
                </span>
                <span v-if="selectedCarat !== 'all'">
                  cut
                  <span class="font-medium text-stone-800"
                    >{{ selectedCarat }}ct</span
                  >
                  diamond
                </span>
                <span v-if="selectedSetting !== 'all'">
                  set in a
                  <span class="font-medium text-stone-800">{{
                    getSettingLabel
                  }}</span>
                  setting
                </span>
                <span v-if="selectedBand !== 'all'">
                  with a
                  <span class="font-medium text-stone-800">{{
                    getBandLabel
                  }}</span>
                  band
                </span>
                <span
                  v-if="selectedAccent !== 'all' && selectedAccent !== 'none'"
                >
                  and
                  <span class="font-medium text-stone-800">{{
                    getAccentLabel
                  }}</span>
                  accents
                </span>
                <span v-if="selectedAccent === 'none'">
                  with no additional accents </span
                >.
                <span
                  v-if="
                    selectedMetal !== 'all' && selectedMetal === 'yellow-gold'
                  "
                >
                  The warm, timeless hue of yellow gold adds romance and
                  tradition to your design.
                </span>
                <span
                  v-else-if="
                    selectedMetal !== 'all' && selectedMetal === 'rose-gold'
                  "
                >
                  The romantic pinkish hue of rose gold creates a unique and
                  modern look.
                </span>
                <span
                  v-else-if="
                    selectedMetal !== 'all' && selectedMetal === 'white-gold'
                  "
                >
                  The sleek, modern elegance of white gold offers a contemporary
                  aesthetic.
                </span>
                <span
                  v-else-if="
                    selectedMetal !== 'all' && selectedMetal === 'platinum'
                  "
                >
                  The luxurious durability of platinum ensures your piece will
                  last a lifetime.
                </span>
              </p>
              <p
                class="text-stone-600 text-sm md:text-base leading-relaxed mt-3"
              >
                Our master artisans will handcraft your piece with precision and
                care, using ethically sourced materials and premium
                craftsmanship.
              </p>

              <div class="flex flex-wrap gap-3 mt-4">
                <button
                  @click="submitCustomization"
                  class="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-full font-semibold hover:scale-[1.02] transition shadow-md text-sm md:text-base"
                >
                  Submit Customization Request
                </button>
                <button
                  @click="resetCustomization"
                  class="px-6 border-2 border-stone-300 text-stone-600 py-3 rounded-full font-semibold hover:border-amber-600 hover:text-amber-600 transition text-sm md:text-base"
                >
                  Start Over
                </button>
              </div>
            </div>

            <!-- Empty state when no customizations -->
            <div
              v-else
              class="bg-white rounded-2xl shadow-md p-6 sticky top-28 flex items-center justify-center h-64"
            >
              <div class="text-center">
                <i class="fas fa-pen-fancy text-4xl text-amber-300 mb-3"></i>
                <p class="text-stone-500 text-sm">
                  Select options on the left to see your customization summary
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommended Section (below customization, horizontal, ALL items) -->
        <div class="mt-12 fade-on-scroll fade-up">
          <div class="text-center mb-6">
            <h3 class="font-playfair text-2xl font-semibold text-stone-800">
              Recommended {{ categoryDisplay }}s
            </h3>
            <p class="text-stone-500 text-sm">
              Browse our full collection of {{ categoryDisplay.toLowerCase() }}s
            </p>
            <div
              class="w-12 h-0.5 bg-amber-500 mx-auto mt-2 rounded-full"
            ></div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="item in allCategoryItems"
              :key="item.id"
              class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              @click="goToProduct(item.id)"
            >
              <div class="h-48 overflow-hidden relative">
                <img
                  :src="item.image"
                  :alt="item.name"
                  class="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div
                  v-if="item.badge"
                  class="absolute top-2 right-2 bg-amber-100/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-semibold text-amber-800"
                >
                  {{ item.badge }}
                </div>
              </div>
              <div class="p-3">
                <p class="text-sm font-semibold text-stone-800 truncate">
                  {{ item.name }}
                </p>
                <p class="text-amber-700 font-bold text-sm mt-1">
                  ${{ item.price.toLocaleString() }}
                </p>
                <button
                  @click.stop="goToProduct(item.id)"
                  class="w-full mt-2 text-xs bg-amber-50 text-amber-700 py-1.5 rounded-full hover:bg-amber-600 hover:text-white transition font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>

          <div class="text-center mt-6">
            <router-link
              :to="`/${category}`"
              class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-md text-sm"
            >
              View All {{ categoryDisplay }}s
              <i class="fas fa-arrow-right text-xs"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useScrollAnimation } from '@/composables/useScrollAnimation';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
useScrollAnimation();

// Get category from URL query parameter
const category = computed(() => route.query.category || 'ring');

// Category display info
const categoryDisplay = computed(() => {
  const map = {
    necklaces: 'Necklace',
    earrings: 'Earring',
    rings: 'Ring',
    bracelets: 'Bracelet',
  };
  return map[category.value] || 'Ring';
});

const categoryDescription = computed(() => {
  const map = {
    necklaces:
      'Design your perfect pendant or necklace with our customization tool',
    earrings: 'Create unique earrings that perfectly match your style',
    rings: 'Design your dream ring from metal to gemstone',
    bracelets: 'Customize a bracelet that tells your story',
  };
  return (
    map[category.value] ||
    'Design your perfect piece with our customization tool'
  );
});

// Selection state
const selectedMetal = ref('all');
const selectedSetting = ref('all');
const selectedShape = ref('all');
const selectedCarat = ref('all');
const selectedBand = ref('all');
const selectedAccent = ref('all');

// Options
const metals = [
  { value: 'all', label: 'All' },
  { value: 'yellow-gold', label: 'Yellow Gold' },
  { value: 'white-gold', label: 'White Gold' },
  { value: 'rose-gold', label: 'Rose Gold' },
  { value: 'platinum', label: 'Platinum' },
];

const settingStyles = [
  { value: 'all', label: 'All' },
  { value: 'solitaire', label: 'Solitaire' },
  { value: 'halo', label: 'Halo' },
  { value: 'trilogy', label: 'Trilogy' },
  { value: 'pave', label: 'Pavé' },
];

const shapes = [
  { value: 'all', label: 'All' },
  { value: 'round', label: 'Round' },
  { value: 'princess', label: 'Princess' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'marquise', label: 'Marquise' },
  { value: 'oval', label: 'Oval' },
  { value: 'pear', label: 'Pear' },
];

const carats = ['all', 1.0, 1.5, 2.0, 2.5, 3.0, 4.0];

const bandTypes = [
  { value: 'all', label: 'All' },
  { value: 'plain', label: 'Plain' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'twisted', label: 'Twisted' },
  { value: 'eternity', label: 'Eternity' },
];

const accents = [
  { value: 'all', label: 'All' },
  { value: 'none', label: 'None' },
  { value: 'pave', label: 'Pavé' },
  { value: 'micro-pave', label: 'Micro-Pavé' },
  { value: 'channel', label: 'Channel' },
];

// Helper getters
const getMetalLabel = computed(() => {
  const found = metals.find((m) => m.value === selectedMetal.value);
  return found ? found.label : '';
});

const getSettingLabel = computed(() => {
  const found = settingStyles.find((s) => s.value === selectedSetting.value);
  return found ? found.label : '';
});

const getShapeLabel = computed(() => {
  const found = shapes.find((s) => s.value === selectedShape.value);
  return found ? found.label : '';
});

const getBandLabel = computed(() => {
  const found = bandTypes.find((b) => b.value === selectedBand.value);
  return found ? found.label : '';
});

const getAccentLabel = computed(() => {
  const found = accents.find((a) => a.value === selectedAccent.value);
  return found ? found.label : '';
});

// Check if any customizations were made
const hasCustomizations = computed(() => {
  return (
    selectedMetal.value !== 'all' ||
    selectedSetting.value !== 'all' ||
    selectedShape.value !== 'all' ||
    selectedCarat.value !== 'all' ||
    selectedBand.value !== 'all' ||
    selectedAccent.value !== 'all'
  );
});

// ALL items based on category (not just 4)
const allCategoryItems = computed(() => {
  const allProducts = {
    rings: [
      {
        id: 201,
        name: 'Silver Diamond Ring',
        price: 2975,
        image: '/ring1.jpg',
        badge: 'Best Seller',
      },
      {
        id: 202,
        name: 'Rose Gold Morganite Ring',
        price: 1590,
        image: '/ring2.webp',
        badge: 'New',
      },
      {
        id: 203,
        name: 'Silver Diamond Ring Classic',
        price: 2250,
        image: '/ring3.jpg',
        badge: null,
      },
      {
        id: 204,
        name: 'Gold Ring Limited',
        price: 3450,
        image: '/ring4.jpg',
        badge: 'Limited',
      },
      {
        id: 205,
        name: 'Gold Ring',
        price: 450,
        image: '/ring5.jpg',
        badge: null,
      },
      {
        id: 206,
        name: 'Gold Diamond Ring',
        price: 2450,
        image: '/ring6.jpg',
        badge: 'Limited',
      },
    ],
    necklaces: [
      {
        id: 1,
        name: 'Celestial Diamond Necklace',
        price: 3850,
        image: '/necklace2.webp',
        badge: 'Best Seller',
      },
      {
        id: 2,
        name: 'Silver Diamond Pendant',
        price: 2450,
        image: '/necklace3.jpg',
        badge: 'New',
      },
      {
        id: 3,
        name: 'Gold Necklace',
        price: 1890,
        image: '/necklace4.jpg',
        badge: null,
      },
      {
        id: 4,
        name: 'Gold Necklace Limited',
        price: 5290,
        image: '/necklace5.jpg',
        badge: 'Limited',
      },
      {
        id: 5,
        name: 'Gold Diamond Necklace',
        price: 5290,
        image: '/necklace6.jpg',
        badge: 'Limited',
      },
      {
        id: 6,
        name: 'Silver Diamond Necklace',
        price: 5290,
        image: '/necklace7.jpg',
        badge: 'Limited',
      },
    ],
    earrings: [
      {
        id: 101,
        name: 'Gold Earrings',
        price: 5290,
        image: '/earring1.avif',
        badge: 'Best Seller',
      },
      {
        id: 102,
        name: 'Rose Gold Diamond Earrings',
        price: 1890,
        image: '/earring2.jpg',
        badge: 'New',
      },
      {
        id: 103,
        name: 'Rose Gold Diamond Hoops',
        price: 890,
        image: '/earring3.jpg',
        badge: null,
      },
      {
        id: 104,
        name: 'Gold Diamond Studs',
        price: 2450,
        image: '/earring4.jpg',
        badge: 'Limited',
      },
      {
        id: 105,
        name: 'Gold Earrings Vintage',
        price: 2450,
        image: '/earring5.jpg',
        badge: 'Limited',
      },
      {
        id: 106,
        name: 'Gold Earrings Modern',
        price: 2450,
        image: '/earring6.jpg',
        badge: 'Limited',
      },
    ],
    bracelets: [
      {
        id: 301,
        name: 'Silver Diamond Bracelet',
        price: 299,
        image: '/bracelet1.webp',
        badge: 'Best Seller',
      },
      {
        id: 302,
        name: 'Gold Diamond Tennis Bracelet',
        price: 2890,
        image: '/bracelet2.jpg',
        badge: 'New',
      },
      {
        id: 303,
        name: 'Gold Diamond Chain Bracelet',
        price: 590,
        image: '/bracelet3.jpg',
        badge: null,
      },
      {
        id: 304,
        name: 'Silver Diamond Bracelet Vintage',
        price: 450,
        image: '/bracelet4.jpg',
        badge: 'Limited',
      },
      {
        id: 305,
        name: 'Silver Diamond Bracelet Minimalist',
        price: 450,
        image: '/bracelet5.jpg',
        badge: 'Limited',
      },
      {
        id: 306,
        name: 'Silver Diamond Bracelet Classic',
        price: 450,
        image: '/bracelet6.jpg',
        badge: 'Limited',
      },
    ],
  };
  return allProducts[category.value] || allProducts.rings;
});

// Methods
const goToProduct = (productId) => {
  router.push(`/product/${productId}`);
};

const submitCustomization = () => {
  const customization = {
    category: categoryDisplay.value,
    metal: getMetalLabel.value || 'Not specified',
    setting: getSettingLabel.value || 'Not specified',
    shape: getShapeLabel.value || 'Not specified',
    carat:
      selectedCarat.value === 'all'
        ? 'Not specified'
        : selectedCarat.value + 'ct',
    band: getBandLabel.value || 'Not specified',
    accent: getAccentLabel.value || 'Not specified',
    user: authStore.currentUser?.email || 'Guest',
    date: new Date().toISOString(),
  };

  console.log('Customization submitted:', customization);

  // Save to history
  saveCustomizationToHistory(customization);

  // Show success message
  alert(
    '✅ Your customization request has been submitted!\n\n' +
      `Category: ${customization.category}\n` +
      `Metal: ${customization.metal}\n` +
      `Setting: ${customization.setting}\n` +
      `Shape: ${customization.shape}\n` +
      `Carat: ${customization.carat}\n` +
      `Band: ${customization.band}\n` +
      `Accents: ${customization.accent}\n\n` +
      'Our team will contact you within 24 hours with a quote! 💎',
  );

  // Reset everything to empty (all selections back to 'all')
  resetCustomization();
};

const saveCustomizationToHistory = (customization) => {
  const historyKey = `soutou_customizations_${authStore.currentUser?.email || 'guest'}`;
  const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
  existing.push(customization);
  localStorage.setItem(historyKey, JSON.stringify(existing));
};

const resetCustomization = () => {
  selectedMetal.value = 'all';
  selectedSetting.value = 'all';
  selectedShape.value = 'all';
  selectedCarat.value = 'all';
  selectedBand.value = 'all';
  selectedAccent.value = 'all';
};
</script>

<style scoped>
.fade-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
}

.fade-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

.fade-right {
  transform: translateX(-30px);
}

.fade-right.visible {
  transform: translateX(0);
}

.fade-left {
  transform: translateX(30px);
}

.fade-left.visible {
  transform: translateX(0);
}

.fade-up {
  transform: translateY(30px);
}

.fade-up.visible {
  transform: translateY(0);
}
</style>
