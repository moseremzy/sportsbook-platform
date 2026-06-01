<template>
  <!-- Status Filter -->
    <div class="payment-filter-container">
      <label for="">Payment Status</label>
      <select id="payment-filter" :style = "payment_color"  @change = "UpdatePaymentStatus" :disabled="order.payment_method === 'online payment'" class="payment-filter-select" v-model = "order.payment_status">
        <option value="pending" style="color:#f59e0b;">Pending</option>      <!-- Amber / Orange -->
        <option value="success" style="color:#16a34a;">Success</option>      <!-- Green -->
        <option value="failed" style="color:#dc2626;">Failed</option>        <!-- Red -->
      </select>
    </div>
</template>

<script setup>

import { computed, reactive, toRefs, ref} from 'vue'

import API from '../../api/index'

import { useInteractiveStore } from '@/stores/interactive'

const interactive_store = useInteractiveStore()

let description = ref("")

const props = defineProps({

  order: Object

})

const { order } = toRefs(props)
 



async function UpdatePaymentStatus() {

    interactive_store.toggle_loading_overlay(true) //show overlay

    try {

    const response = await API.update_payment_status({
        
      payment_status: order.value.payment_status, 
      
      order_id: order.value.order_id,
        
    })

    interactive_store.backend_message = "Payment Status Updated Succesfully"
    
    interactive_store.display_success_alert_box()
 
    } catch (error) {
      
      console.log(error)

    }

    interactive_store.toggle_loading_overlay(false) //remove overlay
   
}



const payment_color = computed(() => {
  switch (order.value.payment_status) {
    case "pending":
      return {
        color: "#f59e0b",
        border: "1px solid #f59e0b"
      }

    case "success":
      return {
        color: "#16a34a",
        border: "1px solid #16a34a"
      }

    case "failed":
      return {
        color: "#dc2626",
        border: "1px solid #dc2626"
      }

    case "abandoned":
      return {
        color: "#6b7280",
        border: "1px solid #6b7280"
      }

    case "reversed":
      return {
        color: "#2563eb",
        border: "1px solid #2563eb"
      }

    case "refunded":
      return {
        color: "#7c3aed",
        border: "1px solid #7c3aed"
      }

    default:
      return {
        color: "#374151",
        border: "1px solid #d1d5db"
      }
  }

})

</script>

<style scoped>
/*DESKTOP VIEW*/
@media only screen and (min-width: 992px) {
.payment-filter-container {
    float: left; /* Align to the left */
}
.payment-filter-container label {
  display: block;
  font-size: 16px;
}
.payment-filter-select {
  padding: 13px 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  width: 200px;
  border-radius: 4px;
  margin-bottom: 10px; /* Add space below inputs */
}
.payment-filter-select:hover {
  border: 1px solid rgb(0, 102, 255);
  border-radius: 4px;
}
.payment-filter-select:focus {
  outline: 0;
  border: 1px solid rgb(0, 102, 255);
  border-radius: 4px;
}
}

/* MOBILE VIEW */
@media only screen and (max-width: 992px) {
.payment-filter-container {
    float: left; /* Align to the left */
}
.payment-filter-container label {
  display: block;
  font-size: 15px;
}
.payment-filter-select {
  padding: 8px;
  font-size: 16px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 0px;
  margin-bottom: 10px; /* Add space below inputs */
}
.payment-filter-select:hover {
  border: 1px solid rgb(0, 102, 255);
  border-radius: 4px;
}
.payment-filter-select:focus {
  outline: 0;
  border: 1px solid rgb(0, 102, 255);
  border-radius: 4px;
}
}
</style>