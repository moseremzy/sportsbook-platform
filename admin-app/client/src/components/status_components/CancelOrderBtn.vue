<template>
  <div>

    <button id="reject" @click="reject_order(order)">Cancel Order</button> 
  
  </div>
</template>

<script setup>
import API from "../../api/index"; 
import { computed, reactive, toRefs, ref } from 'vue';
import { useInteractiveStore } from '@/stores/interactive';

const interactive_store = useInteractiveStore();

const props = defineProps({

  order: Object

});

const { order } = toRefs(props);

function reject_order(order) {

    interactive_store.toggle_cancel_order_modal(true,
    {
        order_id: order.order_id,
        user_id: order.user_id
    })
    
}

</script>

<style scoped>
/* General Styles for Buttons */
button {
  padding: 12px 25px;
  font-size: 16px;
  font-weight: 600;
  display: block;
  width: 30%;
  margin: auto;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  color: #fff;
  outline: none;
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.5); /* Focus effect for accessibility */
}

/* Reject Button Design */
#reject {
  background-color: #e57373; /* Soft red */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  border: 1px solid #e57373;
}

#reject:hover {
  background-color: #d32f2f; /* Darker red on hover */
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

#reject:active {
  background-color: #b71c1c; /* Even darker red on active */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

/* Responsive Design */
@media only screen and (max-width: 992px) {
  button {
    padding: 10px 20px;
    font-size: 14px;
  }
}

</style>
