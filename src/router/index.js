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
{
  path: '/necklaces',
  name: 'Necklaces',
  component: () => import('@/views/CategoryView.vue'),
},
{
  path: '/rings',
  name: 'Rings',
  component: () => import('@/views/CategoryView.vue'),
},
{
  path: '/earrings',
  name: 'Earrings',
  component: () => import('@/views/CategoryView.vue'),
},
{
  path: '/bracelets',
  name: 'Bracelets',
  component: () => import('@/views/CategoryView.vue'),
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