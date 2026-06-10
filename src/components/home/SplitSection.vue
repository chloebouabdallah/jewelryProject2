<template>
  <section class="py-12 md:py-28 bg-gradient-to-br from-[#f5e6d8] via-[#efe0d2] to-[#f5e6d8] overflow-hidden">
    <div class="max-w-7xl mx-auto px-5 md:px-8">
      
      <!-- First Split -->
      <div class="flex flex-col md:flex-row items-stretch gap-0 mb-12 md:mb-28">
        <div class="md:w-1/2 flex items-center justify-end pr-0 md:pr-8 lg:pr-12">
          <div class="max-w-md py-6 md:py-12 fade-on-scroll fade-right">
            <div class="flex items-center gap-2 mb-3 md:mb-4">
              <div class="w-8 md:w-10 h-px bg-amber-400"></div>
              <span class="text-amber-700 tracking-[0.2em] text-[10px] md:text-xs uppercase font-semibold">Artistry in Motion</span>
            </div>
            <h2 class="font-['Playfair_Display',serif] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-stone-800 leading-tight mb-3 md:mb-5">Where <span class="font-bold text-amber-800/90">Every Curve</span> Tells a Story</h2>
            <p class="text-stone-600 text-sm md:text-base lg:text-lg leading-relaxed font-light mb-4 md:mb-5">Soutou jewelry is not merely ornament—it is a language of grace. Each necklace drapes like a whispered secret, each ring cradles the light as if it were morning dew. Our master artisans spend weeks shaping precious metals into organic forms that feel like a second skin.</p>
            <div class="flex justify-end pt-2">
              <router-link to="/collections" class="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 text-xs font-semibold tracking-wider uppercase transition-all duration-300 group">
                <span class="border-b border-amber-400 pb-0.5">Shop Now</span>
                <i class="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1"></i>
              </router-link>
            </div>
          </div>
        </div>
        <div class="md:w-1/2 relative mt-6 md:mt-0 group fade-on-scroll fade-left">
          <div class="relative w-full max-w-sm md:max-w-md mx-auto md:ml-auto md:mr-0">
            <div class="relative overflow-hidden rounded-tl-[40px] md:rounded-tl-[80px] rounded-br-[40px] md:rounded-br-[80px] rounded-tr-2xl rounded-bl-2xl shadow-2xl transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-amber-900/30 group-hover:scale-[1.02]">
              <img src="/martiny.jpg" alt="Elegant necklace craftsmanship" class="w-full h-auto object-cover aspect-[4/5] transition-all duration-700 ease-out group-hover:scale-110">
            </div>
            <div class="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-10 h-10 md:w-16 md:h-16 border-t-2 border-r-2 border-amber-300/50 rounded-tr-2xl pointer-events-none transition-all duration-300 group-hover:border-amber-500/70 group-hover:w-14 md:group-hover:w-20 group-hover:h-14 md:group-hover:h-20"></div>
          </div>
        </div>
      </div>
      
      <!-- Second Split -->
      <div class="flex flex-col md:flex-row items-stretch gap-0">
        <div class="md:w-1/2 relative mb-6 md:mb-0 group fade-on-scroll fade-right">
          <div class="relative w-full max-w-sm md:max-w-md mx-auto md:mr-auto md:ml-0">
            <div class="relative overflow-hidden rounded-br-[40px] md:rounded-br-[80px] rounded-tl-[40px] md:rounded-tl-[80px] rounded-tr-2xl rounded-bl-2xl shadow-2xl transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-amber-900/30 group-hover:scale-[1.02]">
              <img src="/rosee.jpg" alt="Heirloom ring detail" class="w-full h-auto object-cover aspect-[4/5] transition-all duration-700 ease-out group-hover:scale-110">
            </div>
            <div class="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 w-10 h-10 md:w-16 md:h-16 border-b-2 border-l-2 border-amber-300/50 rounded-bl-2xl pointer-events-none transition-all duration-300 group-hover:border-amber-500/70 group-hover:w-14 md:group-hover:w-20 group-hover:h-14 md:group-hover:h-20"></div>
          </div>
        </div>
        <div class="md:w-1/2 flex items-center justify-start pl-0 md:pl-8 lg:pl-12">
          <div class="max-w-md py-6 md:py-12 fade-on-scroll fade-left">
            <div class="flex items-center gap-2 mb-3 md:mb-4 justify-end md:justify-start">
              <span class="text-amber-700 tracking-[0.2em] text-[10px] md:text-xs uppercase font-semibold">Heirloom Philosophy</span>
              <div class="w-8 md:w-10 h-px bg-amber-400"></div>
            </div>
            <h2 class="font-['Playfair_Display',serif] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-stone-800 leading-tight mb-3 md:mb-5 text-right md:text-left">Designed for <span class="font-bold text-amber-800/90">Generations</span> to Come</h2>
            <p class="text-stone-600 text-sm md:text-base lg:text-lg leading-relaxed font-light mb-4 md:mb-5 text-right md:text-left">We believe true luxury is sustainable. Every Soutou creation is crafted from 100% recycled gold and ethically sourced gemstones, ensuring that beauty never comes at the cost of our planet. Our signature pieces are timeless— meant to be passed from mother to daughter, gathering stories with each wear.</p>
            <div class="flex justify-start pt-2">
              <router-link to="/collections" class="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 text-xs font-semibold tracking-wider uppercase transition-all duration-300 group">
                <i class="fas fa-arrow-left text-xs transition-transform group-hover:-translate-x-1"></i>
                <span class="border-b border-amber-400 pb-0.5">Shop Now</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </section>
</template>