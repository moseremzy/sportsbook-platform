<template>
  <transition name="alert-slide">
    <div
      v-if="interactive_store.display_success_alert"
      class="success_container"
    >
      <div class="alert_box">

        <div class="alert_icon">
          <i class="bi bi-check-circle-fill"></i>
        </div>

        <div class="alert_content">
          <slot></slot>
        </div>

        <button
          class="close_btn"
          @click="interactive_store.display_success_alert = false"
        >
          &times;
        </button>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { useInteractiveStore } from '@/stores/interactive'

const interactive_store = useInteractiveStore()
</script>

<style scoped>

div.success_container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  width: min(92vw, 400px);
}

div.alert_box {
  display: flex;
  align-items: flex-start;
  gap: 14px;

  padding: 16px 18px;

  border-radius: 14px;

  background: rgba(12, 148, 118, 0.96);

  backdrop-filter: blur(10px);

  border: 1px solid rgba(255, 255, 255, 0.08);

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.28),
    0 2px 10px rgba(0, 0, 0, 0.18);

  color: white;
}

div.alert_icon {
  flex-shrink: 0;

  width: 38px;
  height: 38px;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: rgba(255, 255, 255, 0.14);

  font-size: 18px;
}

div.alert_content {
  flex: 1;

  font-size: 15px;
  line-height: 1.5;
  font-weight: 500;

  word-break: break-word;
}

button.close_btn {
  background: transparent;
  border: none;

  color: rgba(255, 255, 255, 0.75);

  font-size: 24px;
  line-height: 1;

  cursor: pointer;

  transition: 0.2s ease;
}

button.close_btn:hover {
  color: white;
  transform: scale(1.08);
}

/* ANIMATION */

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.25s ease;
}

.alert-slide-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.alert-slide-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* MOBILE */

@media (max-width: 600px) {

  div.success_container {
    top: 15px;
    right: 15px;
    left: 15px;
    width: auto;
  }

  div.alert_box {
    padding: 14px;
    border-radius: 12px;
  }

  div.alert_content {
    font-size: 14px;
  }

}

</style>