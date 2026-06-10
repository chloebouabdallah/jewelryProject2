<template>
  <Transition name="toast">
    <div v-if="message" class="fixed bottom-5 right-5 bg-[#2c2418] text-white px-5 py-3 rounded-full text-sm z-[1000] shadow-lg">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const message = ref('')
let timeoutId = null

// Watch for cart changes and show message
watch(() => cartStore.lastAddedMessage, (newMessage) => {
  if (newMessage) {
    if (timeoutId) clearTimeout(timeoutId)
    message.value = newMessage
    timeoutId = setTimeout(() => {
      message.value = ''
    }, 2000)
  }
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>