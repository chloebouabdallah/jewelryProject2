// src/router/index.js - Remove admin route

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
  {
    path: '/category/:category',
    name: 'Category',
    component: () => import('@/views/CategoryView.vue'),
    props: true,
  },
  // Short URL redirects
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
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { 
      top: 0, 
      behavior: 'smooth',
      el: 'body'
    }
  },
})

router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0)
  next()
})

export default router