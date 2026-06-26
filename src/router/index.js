// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Import all views directly (not lazy-loaded)
import HomeView from '@/views/HomeView.vue'
import CollectionsView from '@/views/CollectionsView.vue'
import CategoryView from '@/views/CategoryView.vue'
import AboutView from '@/views/AboutView.vue'
import ContactView from '@/views/ContactView.vue'
import ReviewsView from '@/views/ReviewsView.vue'
import CartView from '@/views/CartView.vue'
import WishlistView from '@/views/WishlistView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import CustomizationView from '@/views/CustomizationView.vue'
import SettingsView from '@/views/SettingsView.vue'

// Or use lazy loading with proper error handling
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/collections',
    name: 'Collections',
    component: CollectionsView,
  },
  {
    path: '/category/:category',
    name: 'Category',
    component: CategoryView,
    props: true,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: ContactView,
  },
  {
    path: '/reviews',
    name: 'Reviews',
    component: ReviewsView,
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartView,
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: WishlistView,
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetailView,
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutView,
  },
  {
    path: '/customize',
    name: 'Customize',
    component: CustomizationView,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
  },
  // Catch-all route for 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

export default router