<template>
  <main>
    <HeroSection />
    <SplitSection />
    <ProductSection />
    <VideoSection />
    <FeaturedCollections />
    <StorySection />
    <TestimonialsSection />
  </main>
</template>

<script setup>
import HeroSection from '@/components/home/HeroSection.vue'
import SplitSection from '@/components/home/SplitSection.vue'
import ProductSection from '@/components/home/ProductSection.vue'
import VideoSection from '@/components/home/VideoSection.vue'
import FeaturedCollections from '@/components/home/FeaturedCollections.vue'
import StorySection from '@/components/home/StorySection.vue'
import TestimonialsSection from '@/components/home/TestimonialsSection.vue'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

// Initialize scroll animations
useScrollAnimation()
</script>