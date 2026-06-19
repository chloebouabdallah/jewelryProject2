// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Store scroll positions
const scrollStore = new Map()

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
  // ✅ ADD THIS ROUTE
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
    // Handle browser back/forward
    if (savedPosition) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(savedPosition)
        }, 150)
      })
    }
    
    // Check if we have a stored position for this route
    const storedPosition = scrollStore.get(to.fullPath)
    if (storedPosition) {
      return storedPosition
    }
    
    // Check if we're coming back to a previous page
    if (from.name && to.name !== from.name) {
      // Save the current position before leaving
      scrollStore.set(from.fullPath, {
        top: window.pageYOffset,
        left: window.pageXOffset
      })
    }
    
    return { top: 0 }
  }
})

// Save scroll position before navigation
router.beforeEach((to, from, next) => {
  if (from.path && from.path !== to.path) {
    scrollStore.set(from.fullPath, {
      top: window.pageYOffset,
      left: window.pageXOffset
    })
  }
  next()
})

export default router