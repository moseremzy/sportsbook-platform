<template>
  <!-- Status Filter -->
    <div class="status-filter-container">
      <label for="">Order Status</label>
      <select id="status-filter" :style = "status_color"  @change = "UpdateOrderStatus" class="status-filter-select" v-model = "order.order_status">
        <option style = "color:  gray;" value="pending">Pending</option>
        <option style = "color: #007BFF;" value="confirmed">Confirmed</option>
        <option style = "color: #6F42C1;" value="out-for-delivery">Out for Delivery</option>
        <option style = "color: #28A745;" value="delivered">Delivered</option>
        <option style = "color: red;" value="cancelled">Cancelled</option>    
        <option style = "color: #FD7E14;" value="returned">Returned</option>
      </select>
    </div>
</template>

<script setup>

import { computed, reactive, toRefs, ref} from 'vue'

import API from '../../api/index'

import { useInteractiveStore } from '@/stores/interactive'

const interactive_store = useInteractiveStore()

const props = defineProps({

  order: Object,

  order_items: Object

})

const { order, order_items } = toRefs(props)

const originalStatus = ref(order.value.order_status)

async function UpdateOrderStatus() {

  if (order.value.order_status == 'delivered') {

    delivery_store.previous_status = originalStatus.value

    // reset UI
    order.value.order_status = originalStatus.value

    delivery_store.prepareDeliveryForm(order.value, order_items.value)

    interactive_store.display_delivered_modal = true

    return
  
  }

    interactive_store.toggle_loading_overlay(true) //show overlay

    try {

    const response = await API.update_order_status({
        
      order_status: order.value.order_status, 
      
      order_id: order.value.order_id,
        
    })

    originalStatus.value = order.value.order_status

    interactive_store.backend_message = "Order Status Updated Succesfully"
    
    interactive_store.display_success_alert_box()
 
    } catch (error) {
      
      console.log(error)

    }

    interactive_store.toggle_loading_overlay(false) //remove overlay
   
}


const status_color = computed(() =>  {

    switch (order.value.order_status) {

         case "pending":

            return {'color': 'gray', 'border': '1px solid gray'}
             
            break;
         
         case "confirmed":

            return {'color': '#007BFF', 'border': '1px solid #007BFF'}

            break;

        case "out-for-delivery":

            return {'color': '#6F42C1', 'border': '1px solid #6F42C1'}

            break; 

        case "delivered":

            return {'color': '#28A745', 'border': '1px solid #28A745'}

        break;
        
        case "cancelled":

            return {'color': 'red', 'border': '1px solid red'}

        break;

        case "returned":

            return {'color': '#FD7E14;', 'border': '1px solid #FD7E14;'}

        break;
     
         default:

        break;

     }


})

</script>

<style scoped>
/*DESKTOP VIEW*/
@media only screen and (min-width: 992px) {
.status-filter-container {
    float: right; /* Align to the left */
}
.status-filter-container label {
  display: block;
  font-size: 16px;
}
.status-filter-select {
  padding: 13px 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  width: 200px;
  border-radius: 4px;
  margin-bottom: 10px; /* Add space below inputs */
}
.status-filter-select:hover {
  border: 1px solid rgb(0, 102, 255);
  border-radius: 4px;
}
.status-filter-select:focus {
  outline: 0;
  border: 1px solid rgb(0, 102, 255);
  border-radius: 4px;
}
}

/* MOBILE VIEW */
@media only screen and (max-width: 992px) {
.status-filter-container {
    float: right; /* Align to the left */
}
.status-filter-container label {
  display: block;
  font-size: 15px;
}
.status-filter-select {
  padding: 8px;
  font-size: 16px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 0px;
  margin-bottom: 10px; /* Add space below inputs */
}
.status-filter-select:hover {
  border: 1px solid rgb(0, 102, 255);
  border-radius: 4px;
}
.status-filter-select:focus {
  outline: 0;
  border: 1px solid rgb(0, 102, 255);
  border-radius: 4px;
}
}
</style>