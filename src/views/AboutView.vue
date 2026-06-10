<template>
  <main>
    <!-- Hero -->
    <section class="pt-32 pb-20 px-5 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl"></div>
      <div class="max-w-7xl mx-auto text-center relative z-10">
        <i class="fas fa-gem text-6xl text-amber-600 mb-6 animate-float"></i>
        <h1 class="font-playfair text-5xl md:text-7xl font-light text-stone-800 mb-4">Our Story</h1>
        <div class="w-24 h-0.5 bg-amber-500 mx-auto mb-6"></div>
        <p class="text-stone-600 max-w-3xl mx-auto text-lg">Since 1989, SOUTOU has been crafting dreams into wearable art.</p>
      </div>
    </section>

    <!-- Timeline -->
    <section class="py-20 px-5">
      <div class="max-w-4xl mx-auto">
        <div class="relative border-l-4 border-amber-500 ml-6 md:ml-0">
          
          <div class="mb-12 ml-8 md:ml-12 relative">
            <div class="absolute -left-12 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <i class="fas fa-gem text-white text-sm"></i>
            </div>
            <h3 class="font-playfair text-2xl font-bold text-stone-800">1989 — The Beginning</h3>
            <p class="text-stone-600 mt-2">Founded in Paris by master jeweler Isabelle Moreau, SOUTOU began as a small atelier dedicated to preserving traditional craftsmanship.</p>
          </div>
          
          <div class="mb-12 ml-8 md:ml-12 relative">
            <div class="absolute -left-12 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <i class="fas fa-ring text-white text-sm"></i>
            </div>
            <h3 class="font-playfair text-2xl font-bold text-stone-800">2005 — Global Recognition</h3>
            <p class="text-stone-600 mt-2">SOUTOU's celestial collection wins the International Jewelry Design Award, bringing our artistry to the world stage.</p>
          </div>
          
          <div class="mb-12 ml-8 md:ml-12 relative">
            <div class="absolute -left-12 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <i class="fas fa-leaf text-white text-sm"></i>
            </div>
            <h3 class="font-playfair text-2xl font-bold text-stone-800">2015 — Sustainable Luxury</h3>
            <p class="text-stone-600 mt-2">We commit to using 100% recycled gold and ethically sourced gemstones, proving that luxury can be responsible.</p>
          </div>
          
          <div class="ml-8 md:ml-12 relative">
            <div class="absolute -left-12 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <i class="fas fa-globe text-white text-sm"></i>
            </div>
            <h3 class="font-playfair text-2xl font-bold text-stone-800">2024 — A New Era</h3>
            <p class="text-stone-600 mt-2">Today, SOUTOU continues to create heirloom pieces for discerning souls worldwide, blending tradition with innovation.</p>
          </div>
          
        </div>
      </div>
    </section>

    <!-- Craftsmanship -->
    <section class="py-20 px-5 bg-gradient-to-br from-[#e8d5c0] to-[#f5e6d8]">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
        <div class="md:w-1/2">
          <h2 class="font-playfair text-3xl md:text-4xl font-light text-stone-800 mb-4">The Art of <span class="font-bold">Craftsmanship</span></h2>
          <div class="w-20 h-0.5 bg-amber-500 mb-6"></div>
          <p class="text-stone-600 leading-relaxed mb-4">Each SOUTOU piece takes over 40 hours to complete, from initial sketch to final polish. Our master artisans combine centuries-old techniques with modern innovation.</p>
          <p class="text-stone-600 leading-relaxed">We believe that true beauty lies in the details — the way light dances on a carefully cut gemstone, the perfect weight of a gold chain, the smoothness of a perfectly polished surface.</p>
          <div class="flex gap-4 mt-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-amber-700">40+</div>
              <div class="text-xs text-stone-500">Hours per piece</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-amber-700">15+</div>
              <div class="text-xs text-stone-500">Master Artisans</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-amber-700">35+</div>
              <div class="text-xs text-stone-500">Years of legacy</div>
            </div>
          </div>
        </div>
        <div class="md:w-1/2">
          <img src="/story.jpg" class="rounded-2xl shadow-2xl w-full">
        </div>
      </div>
    </section>
  </main>
</template>
<script setup>
import { useScrollAnimation } from '@/composables/useScrollAnimation'

useScrollAnimation()
</script>