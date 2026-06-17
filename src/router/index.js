import { createRouter, createWebHistory } from 'vue-router';

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
    path: '/:category',
    name: 'Category',
    component: () => import('@/views/CategoryView.vue'),
    props: true,
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetailView.vue'),
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/CheckoutView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Handle browser back/forward
    if (savedPosition) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(savedPosition);
        }, 150);
      });
    }
    // Always scroll to top for normal navigations
    return { top: 0 };
  },
});

export default router;
