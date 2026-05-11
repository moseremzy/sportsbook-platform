<template>
  <div v-if = "interactive_store.display_error_alert" class = "error_container">
  <div class="alert alert-danger alert-dismissible fade in">
    <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
    <slot></slot>
  </div>
  </div>
</template>

<script setup>

import { useInteractiveStore } from '@/stores/interactive'

const interactive_store = useInteractiveStore()

</script>

<style scoped>
div.error_container {
    position: fixed;
    top: 14%;
    right: 3%;
    z-index: 5;
}
div.alert{
    border-radius: 7px;
    font-size: 17px;
    background-color: rgb(102, 7, 7);
    color: white;
}
a.close {
    font-size: 23px;
    color: white;
    opacity: 0.5;
}

</style>