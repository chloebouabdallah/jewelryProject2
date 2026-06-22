// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('@/views/CollectionsView.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue')
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/ContactView.vue')
  },
  {
    path: '/reviews',
    name: 'Reviews',
    component: () => import('@/views/ReviewsView.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/CartView.vue')
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: () => import('@/views/WishlistView.vue')
  },
  {
    path: '/:category',
    name: 'Category',
    component: () => import('@/views/CategoryView.vue'),
    props: true
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetailView.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/CheckoutView.vue')
  },
  {
    path: '/customize',
    name: 'Customize',
    component: () => import('@/views/CustomizationView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // ✅ Empty scroll behavior - we'll handle it manually
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

export default router