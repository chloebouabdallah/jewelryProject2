// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('@/views/CollectionsView.vue'),
  },
  // ✅ CATEGORY ROUTE - Must come BEFORE any catch-all
  {
    path: '/category/:category',
    name: 'Category',
    component: () => import('@/views/CategoryView.vue'),
    props: true,
  },
  // ✅ Short URL redirects to full slug
  {
    path: '/category/necklaces',
    redirect: '/category/necklaces-pendants',
  },
  {
    path: '/category/rings',
    redirect: '/category/rings-bands',
  },
  {
    path: '/category/earrings',
    redirect: '/category/earrings-drops',
  },
  {
    path: '/category/bracelets',
    redirect: '/category/bracelets-bangles',
  },
  // Empty placeholder files
  {
    path: '/necklaces',
    name: 'Necklaces',
    component: () => import('@/views/NecklacesView.vue'),
  },
  {
    path: '/rings',
    name: 'Rings',
    component: () => import('@/views/RingsView.vue'),
  },
  {
    path: '/earrings',
    name: 'Earrings',
    component: () => import('@/views/EarringsView.vue'),
  },
  {
    path: '/bracelets',
    name: 'Bracelets',
    component: () => import('@/views/BraceletsView.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/ContactView.vue'),
  },
  {
    path: '/reviews',
    name: 'Reviews',
    component: () => import('@/views/ReviewsView.vue'),
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/CartView.vue'),
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: () => import('@/views/WishlistView.vue'),
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetailView.vue'),
    props: true,
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/CheckoutView.vue'),
  },
  {
    path: '/customize',
    name: 'Customize',
    component: () => import('@/views/CustomizationView.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
  },
  // ⚠️ CATCH-ALL - Must be LAST
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