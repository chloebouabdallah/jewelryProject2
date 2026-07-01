// src/stores/osimartVariants.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { variantAPI } from '@/services/osimart';

export const useOsimartVariantsStore = defineStore('osimartVariants', () => {
  const variants = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchVariants() {
    isLoading.value = true;
    error.value = null;
    
    try {
      console.log('🔄 Fetching variant types...');
      const response = await variantAPI.getVariants();
      console.log('✅ Variants API Response:', response.data);
      
      // ✅ The API returns an array directly, not wrapped in {results: []}
      let variantData = [];
      if (Array.isArray(response.data)) {
        variantData = response.data;
      } else if (response.data && response.data.results) {
        variantData = response.data.results;
      } else if (response.data) {
        variantData = [response.data];
      }
      
      variants.value = Array.isArray(variantData) ? variantData : [];
      console.log('✅ Variants stored:', variants.value.length);
      console.log('✅ Variants:', variants.value.map(v => ({ name: v.name, label: v.label })));
      return variants.value;
      
    } catch (err) {
      error.value = err.message || 'Failed to fetch variants';
      console.error('❌ Failed to fetch variants:', err);
      variants.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ✅ Get variant display name by name
  function getVariantDisplayName(typeName) {
    if (!typeName) return typeName || '';
    
    const lowerType = typeName.toLowerCase().trim();
    console.log('🔍 Looking for variant type:', lowerType);
    
    // ✅ Find the variant type by name (case insensitive)
    const variant = variants.value.find(v => 
      v.name?.toLowerCase() === lowerType || 
      v.label?.toLowerCase() === lowerType ||
      v.name?.toLowerCase().includes(lowerType) ||
      v.label?.toLowerCase().includes(lowerType)
    );
    
    if (variant && variant.label) {
      console.log(`✅ Found variant label for "${typeName}": "${variant.label}"`);
      return variant.label;
    }
    
    // ✅ If not found, return formatted version
    console.log(`⚠️ No variant found for "${typeName}", using fallback`);
    return typeName
      .split(/[_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // ✅ Get variant type ID by name
  function getVariantIdByName(typeName) {
    if (!typeName) return null;
    
    const lowerType = typeName.toLowerCase().trim();
    const variant = variants.value.find(v => 
      v.name?.toLowerCase() === lowerType || 
      v.label?.toLowerCase() === lowerType
    );
    
    return variant?.id || null;
  }

  return {
    variants,
    isLoading,
    error,
    fetchVariants,
    getVariantDisplayName,
    getVariantIdByName,
  };
});