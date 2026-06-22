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
  scrollBehavior(to, from, savedPosition) {
    // ✅ Browser back/forward
    if (savedPosition) {
      return savedPosition
    }
    
    // ✅ Check sessionStorage for saved position
    const key = `scroll_${to.fullPath}`
    const saved = sessionStorage.getItem(key)
    if (saved) {
      try {
        const position = JSON.parse(saved)
        sessionStorage.removeItem(key)
        return position
      } catch (e) {}
    }
    
    // ✅ Scroll to top for new pages
    return { top: 0 }
  }
})

// ✅ Save scroll position before navigation
router.beforeEach((to, from, next) => {
  if (from.path && from.path !== to.path) {
    const key = `scroll_${from.fullPath}`
    sessionStorage.setItem(key, JSON.stringify({
      top: window.scrollY,
      left: window.scrollX
    }))
  }
  next()
})

export default router