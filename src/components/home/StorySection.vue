<template>
  <section class="py-12 md:py-20 bg-[#f5e6d8]">
    <div class="max-w-7xl mx-auto px-5 md:px-6 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
      <div class="md:w-1/2 relative group fade-on-scroll fade-right">
        <div class="absolute -top-6 -left-6 md:-top-10 md:-left-10 w-24 h-24 md:w-40 md:h-40 bg-amber-200/40 rounded-full blur-2xl animate-float"></div>
        <div class="relative rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-4 border-white transition-all duration-500 group-hover:shadow-amber-900/30">
          <img src="/story.jpg" alt="Jeweler at work" class="object-cover w-full h-auto transition-all duration-700 ease-out group-hover:scale-105">
        </div>
      </div>
      <div class="md:w-1/2 space-y-4 md:space-y-6 fade-on-scroll fade-left">
        <span class="text-amber-700 font-semibold tracking-wider text-xs md:text-sm font-inter">HANDCRAFTED LEGACY</span>
        <h2 class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold font-playfair text-stone-800">Where Passion <br>Meets Precision</h2>
        <div class="w-16 md:w-20 h-0.5 bg-amber-500"></div>
        <p class="text-stone-600 text-sm md:text-base leading-relaxed font-inter">Since 1989, SOUTOU has been the sanctuary for discerning souls who seek more than decoration — but an emotional connection. Each jewel is sculpted by master artisans in our atelier, using ethically sourced stones and recycled precious metals.</p>
        <p class="text-stone-600 text-sm md:text-base leading-relaxed font-inter">We believe jewelry is silent poetry worn close to the heart. Our designs echo nature's geometry, romantic eras, and the delicate balance between strength and grace.</p>
        <router-link to="/about" class="inline-block bg-gradient-to-r from-amber-600 to-amber-500 px-5 md:px-7 py-2 md:py-3 rounded-full text-white font-semibold shadow-md mt-2 md:mt-3 flex items-center gap-2 w-fit transition-all hover:scale-105 text-sm md:text-base font-inter">
          Discover our story <i class="fas fa-feather-alt text-xs md:text-sm"></i>
        </router-link>
      </div>
    </div>
  </section>
</template>