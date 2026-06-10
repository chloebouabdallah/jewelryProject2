<template>
  <section class="py-16 md:py-24 px-4 md:px-5 bg-[#f5e6d8]">
    <div class="max-w-7xl mx-auto text-center mb-10 md:mb-16 fade-on-scroll fade-up">
      <span class="text-amber-700 tracking-widest text-[10px] md:text-sm uppercase font-semibold">Timeless treasures</span>
      <h2 class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold font-playfair mt-2 text-stone-800">Signature Collections</h2>
      <div class="w-16 md:w-24 h-0.5 bg-amber-500 mx-auto mt-3 md:mt-4 rounded-full"></div>
      <p class="text-stone-600 text-sm md:text-base max-w-2xl mx-auto mt-3 md:mt-5">Each piece is a masterpiece of rare gemstones and delicate craftsmanship.</p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
      <router-link 
        v-for="(collection, index) in collections" 
        :key="index"
        :to="`/product/${collection.productId}`"
        class="group rounded-2xl overflow-hidden shadow-md bg-white cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 fade-on-scroll fade-up"
        :style="{ transitionDelay: `${(index + 1) * 0.1}s` }"
      >
        <div class="h-64 md:h-72 overflow-hidden relative">
          <img :src="collection.image" :alt="collection.title" class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110">
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
        <div class="p-4 md:p-6">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl md:text-2xl font-bold font-playfair">{{ collection.title }}</h3>
              <p class="text-gray-500 text-xs md:text-sm mt-1">{{ collection.subtitle }}</p>
            </div>
            <span class="text-amber-700 font-semibold text-base md:text-lg">${{ collection.price.toLocaleString() }}</span>
          </div>
          <div class="flex mt-3 md:mt-4 gap-2">
            <span v-for="tag in collection.tags" :key="tag" class="text-[10px] md:text-xs bg-amber-50 px-2 md:px-3 py-1 rounded-full text-amber-700">{{ tag }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
const collections = [
  {
    productId: 2,
    image: "/necklace3.jpg",
    title: "Silver Diamond Pendant",
    subtitle: "Diamond Necklace",
    price: 2450,
    tags: ["925 Silver", "Diamond", "Everyday Elegance"]
  },
  {
    productId: 102,
    image: "/earring2.jpg",
    title: "Rose Gold Diamond Earrings",
    subtitle: "Emerald & Diamond Earring",
    price: 1890,
    tags: ["Rose Gold", "Diamond", "Romantic"]
  },
  {
    productId: 203,
    image: "/ring3.jpg",
    title: "Silver Diamond Ring Classic",
    subtitle: "Diamond & Moonstone Ring",
    price: 2250,
    tags: ["Silver", "Diamond", "Classic"]
  }
]
</script>