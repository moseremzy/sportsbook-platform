<template>
  <div class="confirm_container">

    <!-- Modal -->
    <div
      class="modal fade in"
      role="dialog"
      style="display: block; top: 20%;"
      v-if="interactive_store.display_confirm_order_modal"
    >
      <div class="modal-dialog">
        <div class="modal-content">

          <div class="modal-header">
            <button
              type="button"
              class="close"
              @click="interactive_store.toggle_confirm_order_modal(false, null)"
            >
              &times;
            </button>
            <h4 class="modal-title">
              Confirm Order #{{ interactive_store.order_data.order_id }}
            </h4>
          </div>

          <div class="modal-body">
            <p>Select delivery date</p>

            <input
              type="date"
              v-model="delivery_date"
              :min="today"
            />

            <p class="err">{{ delivery_date_err }}</p>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-default"
              :disabled="disableBtn"
              @click.prevent="submit_delivery_date"
            >
              <font-awesome-icon
                v-if="spinner"
                class="fa-solid fa-spinner fa-spin"
                icon="fa-solid fa-spinner"
              />
              Confirm Order
            </button>
          </div>

        </div>
      </div>
    </div>

    <div
      class="modal-backdrop"
      v-if="interactive_store.display_confirm_order_modal"
      @click="interactive_store.toggle_confirm_order_modal(false, null)"
    ></div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useInteractiveStore } from '@/stores/interactive'
import API from '../../api/index'

const interactive_store = useInteractiveStore()

const delivery_date = ref('')

const delivery_date_err = ref('')

const today = new Date().toISOString().split('T')[0]

const disableBtn = computed(() => !delivery_date.value)

function validate_delivery_date() {

  if (!delivery_date.value) {
    
    delivery_date_err.value = 'Delivery date is required'
    
    return false
  
  }

  delivery_date_err.value = ''
  
  return true

}

async function submit_delivery_date() {
  
  if (!validate_delivery_date()) return

  interactive_store.toggle_loading_overlay(true)

  const cancellationPayload = {

    ...interactive_store.order_data,

    description: 'Your order has been confirmed for processing',

    delivery_date: delivery_date.value

  }

  try {

    await API.confirm_order(cancellationPayload)

    interactive_store.backend_message = 'Order confirmed successfully'
    
    interactive_store.toggle_confirm_order_modal(false, null)
    
    interactive_store.display_success_alert_box()

    await orders_store.fetch_orders()

  } catch (err) {

    interactive_store.toggle_confirm_order_modal(false, null) //hide the cancel modal
  
  }  

    delivery_date.value = ''

    interactive_store.toggle_loading_overlay(false)

}
</script>



<style scoped>
div.confirm_container {
  position: fixed;
  z-index: 1;
}
/* General Modal Styling */
.modal-content {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 10px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-in-out;
}

.modal-header {
  background-color: green; /* Primary color */
  color: #fff;
  padding: 15px 20px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.modal-header .close {
  color: #fff;
  font-size: 1.2rem;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.modal-header .close:hover {
  opacity: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.modal-body {
  padding: 20px;
  font-size: 1.4rem;
  color: #333;
  text-align: center;
}

.modal-body p {
  margin: 0;
  line-height: 1.6;
}

.modal-body input[type="date"] {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  outline: none;
}

.modal-footer {
  padding: 15px;
  background-color: #f1f1f1;
  border-top: none;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  text-align: center;
}

.modal-footer .btn {
  background-color: green; /* Primary color */
  color: #fff;
  border-radius: 20px;
  padding: 8px 20px;
  transition: all 0.3s ease;
  outline: 0;
}

.modal-footer .btn:hover {
  background-color: green; /* Darker primary color */
  transform: scale(1.05);
}

.modal-footer .btn:disabled {
        opacity: .5;
        cursor: none;
    }

/* Backdrop Styling */
.modal-backdrop {
       background-color: rgba(0, 0, 0, 0.5);
}

p.err {
       color: red;
       font-size: 11px;
       margin: 0;
}

/* Fade Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>