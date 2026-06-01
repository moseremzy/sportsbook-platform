<template>

  <div v-if="interactive_store.display_delivered_modal" class="modal-overlay">
    <div class="modal-container">
      
      <div class="modal-header">
        <h2 style="font-size: 24px;">Enter Records</h2>
      </div>

      <div class="modal-body">

        <div class="order-summary">
          <p><strong>Order ID:</strong> #{{delivery_store.order.order_id}}</p>
        </div>

        <div class="gadget-entry" 
             v-for="(gadget, index) in delivery_store.gadgets" 
             :key="index">

          <h4>{{ gadget.product_name }}</h4>

          <div class="form-row">
            <div class="form-group">
              <label>IMEI/SERIAL</label>
              <input
                type="text"
                v-model="gadget.imei"
                placeholder="Enter IMEI or Serial"
              />
              
              <!-- Character counter -->
              <small class="char-counter">
                {{ gadget.imei.length }} characters
              </small>
            </div>

            <div class="form-group">
              <label>Source</label>
              <input
                type="text"
                v-model="gadget.source"
                placeholder="Enter Source (e.g. Computer Village)"
              />
            </div>
          </div>

        </div>

      </div>

      <div class="modal-footer">
        <button class="cancel" @click="cancelModal">Cancel</button>
        <button class="confirm" @click="submit_gadget_record">
          Mark as Delivered
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import API from '../../api/index'
import { useInteractiveStore } from '@/stores/interactive'

const interactive_store = useInteractiveStore()


const isValid = computed(() => {
  return delivery_store.gadgets.every(d => 
    d.imei.trim() !== '' && d.source.trim() !== ''
  )
})

async function submit_gadget_record() {

  if (!isValid.value) {
    interactive_store.backend_message = 'Please fill all IMEI and source fields.'
    interactive_store.display_error_alert_box()
    return
  }

  const imeis = delivery_store.gadgets.map(d => d.imei)
  const uniqueImeis = new Set(imeis)

  if (uniqueImeis.size !== imeis.length) {
    interactive_store.backend_message = "Duplicate IMEI detected."
    interactive_store.display_error_alert_box()
    return
  }


  interactive_store.toggle_loading_overlay(true)

  try {

    const response = await API.submit_gadget_record({
      order_id: delivery_store.order.order_id,
      order_status: "delivered",
      gadgets: delivery_store.gadgets
    })

    // update UI status
    delivery_store.order.order_status = "delivered"

    interactive_store.backend_message = response.data.message
    interactive_store.display_success_alert_box()

    cancelModal()

    // update the device records
   await records_store.fetch_records()

  } catch (error) {

    console.log(error)

  }

  interactive_store.toggle_loading_overlay(false)

}


function cancelModal() {

  interactive_store.display_delivered_modal = false

  delivery_store.reset()

}

</script>

<style scoped>
.modal-overlay {
  z-index: 1;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-container {
  background: #fff;
  width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 8px;
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.char-counter {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.confirm {
  background: #1e7e34;
  color: white;
  padding: 8px 15px;
  border: none;
}

.cancel {
  background: red;
  color: white;
  padding: 8px 15px;
  border: none;
}
</style>