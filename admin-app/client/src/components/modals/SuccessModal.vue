<template>
  <div>
    <div class="modal-overlay" v-if="interactive_store.display_success_modal" @click.prevent="interactive_store.display_success_modal_box(false)"></div>
    <div class="modal_success" v-if="interactive_store.display_success_modal">
      <font-awesome-icon id="check" icon="fa-solid fa-circle-check" />
      <h3 class="modal-success-title">Success</h3>
      <p class="modal-success-message"><slot /></p>
      <button @click.prevent="interactive_store.display_success_modal_box(false)">OK</button>
    </div>
  </div>
</template>

<script setup>
import { useInteractiveStore } from '@/stores/interactive'

const interactive_store = useInteractiveStore()
</script>

<style scoped>
* {
  font-family: var(--font-family);
}
/* === OVERLAY === */
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.7);
  position: fixed;
  inset: 0;
  backdrop-filter: blur(2px);
  z-index: 1000;
}

/* === MODAL BOX === */
.modal_success {
  position: fixed;
  top: 50%;
  text-align: center;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  z-index: 1100;
  background: #ffffff;
  border-radius: 12px;
  padding: 25px 30px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
  animation: popup 0.25s ease forwards;
}

/* Smooth pop-up animation */
@keyframes popup {
  to {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* === ICON === */
#check {
  font-size: 24px;
  background-color: #e9f8ec;
  color: #16a34a; /* professional green */
  padding: 12px;
  border-radius: 50%;
  margin-bottom: 12px;
  border: 2px solid #16a34a22;
}

/* === TITLE === */
.modal-success-title {
  margin: 10px 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--secondary-white); /* deep black */
}

/* === MESSAGE === */
.modal-success-message {
  font-size: 15px;
  color: #444;
  margin: 12px 0 15px;
  line-height: 1.6;
}

/* === BUTTON === */
.modal_success button {
  width: 100%;
  background-color: var(--primary-blue); /* primary black */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s ease;
}

.modal_success button:hover {
  background-color: var(--primary-blue); /* primary black */;
}

/* === RESPONSIVE === */
@media (max-width: 480px) {
  .modal_success {
    padding: 20px;
    width: 92%;
  }

  .modal-success-title {
    font-size: 17px;
  }

  .modal-success-message {
    font-size: 14px;
  }
}
</style>
