<template>
  <main>
    <!-- Hero -->
    <section class="pt-28 md:pt-32 pb-12 md:pb-20 px-5 bg-gradient-to-br from-[#f5e6d8] via-[#efe0d2] to-[#f5e6d8]">
      <div class="max-w-7xl mx-auto text-center">
        <span class="text-amber-700 tracking-[0.2em] text-xs md:text-sm uppercase font-semibold animate-fade-scale">Discover By Category</span>
        <h1 class="font-playfair text-3xl md:text-5xl lg:text-7xl font-light text-stone-800 mb-3 md:mb-4 animate-fade-scale">Shop by Collection</h1>
        <div class="w-16 md:w-24 h-0.5 bg-amber-500 mx-auto mb-4 md:mb-6 rounded-full animate-fade-scale"></div>
        <p class="text-stone-600 text-sm md:text-lg max-w-2xl mx-auto animate-fade-scale">Find the perfect piece that speaks to your soul, curated by category.</p>
      </div>
    </section>

    <!-- Necklaces -->
    <section class="py-12 md:py-28 overflow-hidden bg-gradient-to-r from-[#f5e6d8] to-[#efe0d2]">
      <div class="max-w-7xl mx-auto px-5 md:px-8">
        <div class="flex flex-col md:flex-row items-center gap-6 md:gap-0 group">
          <div class="md:w-1/2 relative group/image fade-on-scroll fade-right">
            <div class="relative w-full max-w-sm md:max-w-md mx-auto md:mr-auto md:ml-0">
              <div class="relative overflow-hidden rounded-tr-[40px] md:rounded-tr-[80px] rounded-bl-[40px] md:rounded-bl-[80px] rounded-tl-xl rounded-bl-xl shadow-2xl transition-all duration-500 group-hover/image:shadow-2xl group-hover/image:shadow-amber-900/30 group-hover/image:scale-[1.02]">
                <img src="/necklace3.jpg" alt="Necklaces Collection" class="w-full h-auto object-cover aspect-[4/5] transition-all duration-700 ease-out group-hover/image:scale-110">
              </div>
              <div class="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-10 h-10 md:w-20 md:h-20 border-t-2 border-l-2 border-amber-300/50 rounded-tl-xl md:rounded-tl-2xl pointer-events-none transition-all duration-300 group-hover/image:border-amber-500/70 group-hover/image:w-14 md:group-hover/image:w-24 group-hover/image:h-14 md:group-hover/image:h-24"></div>
            </div>
          </div>
          <div class="md:w-1/2 flex items-center justify-start pl-0 md:pl-12 lg:pl-16 fade-on-scroll fade-left">
            <div class="max-w-md py-6 md:py-12">
              <div class="flex items-center gap-2 mb-3 md:mb-4">
                <i class="fas fa-gem text-xl md:text-2xl text-amber-600"></i>
                <span class="text-amber-700 tracking-[0.2em] text-[10px] md:text-xs uppercase font-semibold">Elegance Defined</span>
              </div>
              <h2 class="font-playfair text-2xl md:text-4xl lg:text-5xl font-light text-stone-800 leading-tight mb-3 md:mb-5">Necklaces <span class="font-bold text-amber-800/90">& Pendants</span></h2>
              <p class="text-stone-700 text-sm md:text-base lg:text-lg leading-relaxed mb-4 md:mb-6">Each necklace drapes like a whispered secret, cradling the light as if it were morning dew. From delicate chains to statement pieces, find your perfect layer of elegance.</p>
              <div class="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">18k Gold</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Diamond</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Pearl</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Custom</span>
              </div>
              <router-link to="/necklaces" class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold transition-all duration-300 hover:gap-3 hover:scale-105 shadow-md text-sm md:text-base">
                Explore Necklaces <i class="fas fa-arrow-right text-xs md:text-sm"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Rings -->
    <section class="py-12 md:py-28 overflow-hidden bg-gradient-to-l from-[#f5e6d8] to-[#efe0d2]">
      <div class="max-w-7xl mx-auto px-5 md:px-8">
        <div class="flex flex-col md:flex-row-reverse items-center gap-6 md:gap-0 group">
          <div class="md:w-1/2 relative group/image fade-on-scroll fade-left">
            <div class="relative w-full max-w-sm md:max-w-md mx-auto md:ml-auto md:mr-0">
              <div class="relative overflow-hidden rounded-tl-[40px] md:rounded-tl-[80px] rounded-br-[40px] md:rounded-br-[80px] rounded-tr-xl rounded-bl-xl shadow-2xl transition-all duration-500 group-hover/image:shadow-2xl group-hover/image:shadow-amber-900/30 group-hover/image:scale-[1.02]">
                <img src="/ring3.jpg" alt="Rings Collection" class="w-full h-auto object-cover aspect-[4/5] transition-all duration-700 ease-out group-hover/image:scale-110">
              </div>
              <div class="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-10 h-10 md:w-20 md:h-20 border-t-2 border-r-2 border-amber-300/50 rounded-tr-xl md:rounded-tr-2xl pointer-events-none transition-all duration-300 group-hover/image:border-amber-500/70 group-hover/image:w-14 md:group-hover/image:w-24 group-hover/image:h-14 md:group-hover/image:h-24"></div>
            </div>
          </div>
          <div class="md:w-1/2 flex items-center justify-end pr-0 md:pr-12 lg:pr-16 fade-on-scroll fade-right">
            <div class="max-w-md py-6 md:py-12 text-right">
              <div class="flex items-center gap-2 mb-3 md:mb-4 justify-end">
                <span class="text-amber-700 tracking-[0.2em] text-[10px] md:text-xs uppercase font-semibold">Symbol of Forever</span>
                <i class="fas fa-ring text-xl md:text-2xl text-amber-600"></i>
              </div>
              <h2 class="font-playfair text-2xl md:text-4xl lg:text-5xl font-light text-stone-800 leading-tight mb-3 md:mb-5">Rings <span class="font-bold text-amber-800/90">& Bands</span></h2>
              <p class="text-stone-700 text-sm md:text-base lg:text-lg leading-relaxed mb-4 md:mb-6">Each ring cradles your story — from engagement brilliance to everyday elegance. Our master artisans shape precious metals into organic forms that feel like a second skin.</p>
              <div class="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6 justify-end">
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Platinum</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Sapphire</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Emerald</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Rose Gold</span>
              </div>
              <router-link to="/rings" class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold transition-all duration-300 hover:gap-3 hover:scale-105 shadow-md text-sm md:text-base">
                Explore Rings <i class="fas fa-arrow-right text-xs md:text-sm"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Earrings -->
    <section class="py-12 md:py-28 overflow-hidden bg-gradient-to-r from-[#f5e6d8] to-[#efe0d2]">
      <div class="max-w-7xl mx-auto px-5 md:px-8">
        <div class="flex flex-col md:flex-row items-center gap-6 md:gap-0 group">
          <div class="md:w-1/2 relative group/image fade-on-scroll fade-right">
            <div class="relative w-full max-w-sm md:max-w-md mx-auto md:mr-auto md:ml-0">
              <div class="relative overflow-hidden rounded-br-[40px] md:rounded-br-[80px] rounded-tl-[40px] md:rounded-tl-[80px] rounded-tr-xl rounded-bl-xl shadow-2xl transition-all duration-500 group-hover/image:shadow-2xl group-hover/image:shadow-amber-900/30 group-hover/image:scale-[1.02]">
                <img src="/earring2.jpg" alt="Earrings Collection" class="w-full h-auto object-cover aspect-[4/5] transition-all duration-700 ease-out group-hover/image:scale-110">
              </div>
              <div class="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 w-10 h-10 md:w-20 md:h-20 border-b-2 border-l-2 border-amber-300/50 rounded-bl-xl md:rounded-bl-2xl pointer-events-none transition-all duration-300 group-hover/image:border-amber-500/70 group-hover/image:w-14 md:group-hover/image:w-24 group-hover/image:h-14 md:group-hover/image:h-24"></div>
            </div>
          </div>
          <div class="md:w-1/2 flex items-center justify-start pl-0 md:pl-12 lg:pl-16 fade-on-scroll fade-left">
            <div class="max-w-md py-6 md:py-12">
              <div class="flex items-center gap-2 mb-3 md:mb-4">
                <i class="fas fa-star-of-life text-xl md:text-2xl text-amber-600"></i>
                <span class="text-amber-700 tracking-[0.2em] text-[10px] md:text-xs uppercase font-semibold">Framing Beauty</span>
              </div>
              <h2 class="font-playfair text-2xl md:text-4xl lg:text-5xl font-light text-stone-800 leading-tight mb-3 md:mb-5">Earrings <span class="font-bold text-amber-800/90">& Drops</span></h2>
              <p class="text-stone-700 text-sm md:text-base lg:text-lg leading-relaxed mb-4 md:mb-6">From delicate studs to cascading chandeliers, our earrings frame your face with light and elegance. Each pair is designed to catch every glance and spark conversation.</p>
              <div class="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Diamond</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Pearl</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Hoops</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Studs</span>
              </div>
              <router-link to="/earrings" class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold transition-all duration-300 hover:gap-3 hover:scale-105 shadow-md text-sm md:text-base">
                Explore Earrings <i class="fas fa-arrow-right text-xs md:text-sm"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bracelets -->
    <section class="py-12 md:py-28 overflow-hidden bg-gradient-to-l from-[#f5e6d8] to-[#efe0d2]">
      <div class="max-w-7xl mx-auto px-5 md:px-8">
        <div class="flex flex-col md:flex-row-reverse items-center gap-6 md:gap-0 group">
          <div class="md:w-1/2 relative group/image fade-on-scroll fade-left">
            <div class="relative w-full max-w-sm md:max-w-md mx-auto md:ml-auto md:mr-0">
              <div class="relative overflow-hidden rounded-tl-[40px] md:rounded-tl-[80px] rounded-br-[40px] md:rounded-br-[80px] rounded-tr-xl rounded-bl-xl shadow-2xl transition-all duration-500 group-hover/image:shadow-2xl group-hover/image:shadow-amber-900/30 group-hover/image:scale-[1.02]">
                <img src="/bracelet1.webp" alt="Bracelets Collection" class="w-full h-auto object-cover aspect-[4/5] transition-all duration-700 ease-out group-hover/image:scale-110">
              </div>
              <div class="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 w-10 h-10 md:w-20 md:h-20 border-b-2 border-r-2 border-amber-300/50 rounded-br-xl md:rounded-br-2xl pointer-events-none transition-all duration-300 group-hover/image:border-amber-500/70 group-hover/image:w-14 md:group-hover/image:w-24 group-hover/image:h-14 md:group-hover/image:h-24"></div>
            </div>
          </div>
          <div class="md:w-1/2 flex items-center justify-end pr-0 md:pr-12 lg:pr-16 fade-on-scroll fade-right">
            <div class="max-w-md py-6 md:py-12 text-right">
              <div class="flex items-center gap-2 mb-3 md:mb-4 justify-end">
                <span class="text-amber-700 tracking-[0.2em] text-[10px] md:text-xs uppercase font-semibold">Wrist Poetry</span>
                <i class="fas fa-hand-peace text-xl md:text-2xl text-amber-600"></i>
              </div>
              <h2 class="font-playfair text-2xl md:text-4xl lg:text-5xl font-light text-stone-800 leading-tight mb-3 md:mb-5">Bracelets <span class="font-bold text-amber-800/90">& Bangles</span></h2>
              <p class="text-stone-700 text-sm md:text-base lg:text-lg leading-relaxed mb-4 md:mb-6">Adorn your wrist with timeless elegance. From delicate chains to bold cuffs, each bracelet is crafted to move with you — catching light with every gesture.</p>
              <div class="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6 justify-end">
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Gold</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Silver</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Tennis</span>
                <span class="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] md:text-xs font-semibold">Charm</span>
              </div>
              <router-link to="/bracelets" class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold transition-all duration-300 hover:gap-3 hover:scale-105 shadow-md text-sm md:text-base">
                Explore Bracelets <i class="fas fa-arrow-right text-xs md:text-sm"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useScrollAnimation } from '@/composables/useScrollAnimation'

// Initialize scroll animations for this page
useScrollAnimation()
</script>