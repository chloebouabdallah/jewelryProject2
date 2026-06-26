// src/stores/banners.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { osimartApi, mediaAPI } from '@/services/osimart';

export const useBannerStore = defineStore('banners', () => {
  const banners = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchBanners() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await osimartApi.get('/banners/');
      console.log('✅ Banners API Response:', response.data);
      
      // Extract results from the response
      let bannerData = [];
      if (response.data && response.data.results) {
        bannerData = response.data.results;
      } else if (Array.isArray(response.data)) {
        bannerData = response.data;
      } else if (response.data) {
        bannerData = [response.data];
      }
      
      banners.value = bannerData;
      
      // Log the first banner to see its structure
      if (bannerData.length > 0) {
        console.log('🔍 First banner:', bannerData[0]);
        console.log('🔍 Image object:', bannerData[0].image);
        console.log('🔍 Image path:', bannerData[0].image?.path);
        console.log('🔍 Full image URL:', mediaAPI.getImageUrl(bannerData[0].image));
      }
      
      return banners.value;
    } catch (err) {
      error.value = err.message;
      console.error('❌ Failed to fetch banners:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Get hero banners
  function getHeroBanners() {
    return banners.value || [];
  }

  // Get full image URL using mediaAPI
  function getBannerImage(banner) {
    if (!banner) return '/placeholder-banner.jpg';
    
    // The image is nested in an object
    if (banner.image) {
      return mediaAPI.getImageUrl(banner.image);
    }
    
    // Fallback: try other fields
    if (banner.media) return mediaAPI.getImageUrl(banner.media);
    if (banner.image_url) return mediaAPI.getImageUrl(banner.image_url);
    
    return '/placeholder-banner.jpg';
  }

  function getBannerTitle(banner) {
    if (!banner) return '';
    return banner.title || banner.name || banner.heading || 'GIRL\'S FAVORITE';
  }

  function getBannerSubtitle(banner) {
    if (!banner) return '';
    return banner.subtitle || banner.description || banner.text || '';
  }

  function getButtonText(banner) {
    if (!banner) return '';
    return banner.button_title || banner.button_text || banner.cta || 'Shop Now';
  }

  function getButtonLink(banner) {
    if (!banner) return '';
    return banner.link || banner.button_link || banner.cta_link || '/collections';
  }

  function hasButton(banner) {
    if (!banner) return false;
    return banner.button_title || banner.button_text || banner.cta || false;
  }

  return {
    banners,
    isLoading,
    error,
    fetchBanners,
    getHeroBanners,
    getBannerImage,
    getBannerTitle,
    getBannerSubtitle,
    getButtonText,
    getButtonLink,
    hasButton,
  };
});