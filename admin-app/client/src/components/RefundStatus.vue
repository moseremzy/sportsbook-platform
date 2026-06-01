<template>
  <div class="refund-status" v-if="shouldShow">

    <h2>REFUND STATUS</h2>

    <p :class="statusClass">
      {{ statusText }}
    </p>

    <button
      v-if="canRetry"
      @click="retryRefund"
      class="retry-btn"
    >
      Retry Refund
    </button>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useInteractiveStore } from '@/stores/interactive'
import API from '../api/index'

const props = defineProps({
  order: Object
})

const interactive_store = useInteractiveStore()

const shouldShow = computed(() => {
  return (
    props.order.payment_method === 'online payment' &&
    props.order.payment_status === 'success'
  )
})

const statusText = computed(() => {
  switch (props.order.refund_status) {
    case 'pending':
      return 'Refund processing (7–12 business days)'
    case 'refunded':
      return 'Refund completed'
    case 'failed':
      return 'Refund failed'
    default:
      return 'No refund initiated'
  }
})

const statusClass = computed(() => {
  return {
    pending: props.order.refund_status === 'pending',
    success: props.order.refund_status === 'refunded',
    failed: props.order.refund_status === 'failed'
  }
})

const canRetry = computed(() => {
  return props.order.refund_status === 'failed'
})

async function retryRefund () {
  
  interactive_store.toggle_loading_overlay(true)

  try {

    const response = await API.retry_refund({order_id: props.order.order_id})

    await orders_store.fetch_orders() //refetch items to update item
    
    interactive_store.backend_message = 'Refund retry initiated'
    
    interactive_store.display_success_alert_box(true)
  
  } catch (error) {

    console.log(error)

  } finally {

    interactive_store.toggle_loading_overlay(false)
  }

}
</script>

<style scoped>
.refund-status {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
}

.refund-status h2 {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}

.pending {
  color: #c58b00;
  font-weight: bold;
}

.success {
  color: green;
  font-weight: bold;
}

.failed {
  color: red;
  font-weight: bold;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #c0392b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
