<template>
  <div class="overlay" v-if="interactive_store.display_loading_overlay">
    <font-awesome-icon
      class="fa-solid fa-spinner"
      id="spinner"
      icon="fa-solid fa-spinner"
    />
  </div>
</template>

<script setup>
import { useInteractiveStore } from '@/stores/interactive'
const interactive_store = useInteractiveStore()
</script>

<style scoped>
.overlay {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  z-index: 1000;
  inset: 0; /* shorthand for top, left, right, bottom */
  display: flex;               /* enable centering */
  justify-content: center;     /* center horizontally */
  align-items: center;         /* center vertically */
}

#spinner {
  font-size: 3rem;
  color: white;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
