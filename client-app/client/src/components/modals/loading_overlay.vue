<template>
  <div class="overlay" v-if = "interactive_store.display_loading_overlay">
    <img src = "../../assets/static_images/favicon.png">
  </div>
</template>

<script setup>

import { useInteractiveStore } from '../../stores/interactive'

const interactive_store = useInteractiveStore()

</script>

<style scoped>
  div.overlay {
    position: fixed;
    top: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(3px);
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  img{
    height: 50px;
  }

  /* Spin animation */
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
