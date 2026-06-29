// src/stores/osimartCategories.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { categoryAPI } from '@/services/osimart';

export const useOsimartCategoriesStore = defineStore('osimartCategories', () => {
  const categories = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchCategories() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await categoryAPI.getCategories();
      console.log('✅ Categories API Response:', response.data);
      
      let categoryData = [];
      if (response.data && response.data.results) {
        categoryData = response.data.results;
      } else if (Array.isArray(response.data)) {
        categoryData = response.data;
      } else if (response.data) {
        categoryData = [response.data];
      }
      
      categories.value = Array.isArray(categoryData) ? categoryData : [];
      console.log('✅ Categories stored:', categories.value.length);
      return categories.value;
      
    } catch (err) {
      error.value = err.message || 'Failed to fetch categories';
      console.error('❌ Failed to fetch categories:', err);
      categories.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function mapCategory(category) {
    if (!category) return null;
    
    // Use slugified_name from API
    const slug = category.slugified_name || category.slug || '';
    
    return {
      id: category.id || '',
      name: category.name || '',
      slug: slug,
      description: category.description || '',
      image: category.image?.path || category.image || '',
      is_active: category.is_active !== false,
      order: category.order || 0,
    };
  }

  function mapCategories(categoryList) {
    if (!Array.isArray(categoryList)) return [];
    return categoryList.map(c => mapCategory(c)).filter(c => c !== null);
  }

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    mapCategory,
    mapCategories,
  };
});