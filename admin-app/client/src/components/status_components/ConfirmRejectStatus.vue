<template>
  
  <div>

  <div class = "confirm_reject">

      <button id = "reject" @click = "reject_order(order)">Reject</button> 
     
      <button id = "confirm" @click = "confirm_order(order)">Confirm</button>
  
  </div>

  </div>

</template>

<script setup>

import API from "../../api/index";

import { computed, reactive, toRefs, ref} from 'vue'

import { useInteractiveStore } from '@/stores/interactive'

const interactive_store = useInteractiveStore()

const props = defineProps({

  order: Object

})

const { order } = toRefs(props)

function reject_order(order) {

    interactive_store.toggle_cancel_order_modal(true,
    {
        order_id: order.order_id,
        user_id: order.user_id
    })
    
}


function confirm_order(order) {

    interactive_store.toggle_confirm_order_modal(true,
    {
        order_id: order.order_id,
        user_id: order.user_id
    })
    
}
 
</script>

<style scoped>
/*DESKTOP VIEW*/
@media only screen and (min-width: 992px) {
div.confirm_reject {
    float: right;
    margin: 5px 0 0px 0;
}
div.confirm_reject button{
    padding: 5px 20px;
    font-size: 15px;
    font-weight: bold;
    margin: 3px 0 5px 10px;
    color: white;
}
#reject {
    background-color: rgb(145, 76, 76);
    border: 1px solid rgb(145, 76, 76);
}
#confirm {
    background-color: green;
    border: 1px solid green;
}
}


/* MOBILE VIEW */
@media only screen and (max-width: 992px) {
div.confirm_reject {
    float: right;
    margin: 5px 0 20px 0;
}
div.confirm_reject button{
    padding: 5px 20px;
    font-size: 15px;
    font-weight: bold;
    margin: 3px 0 5px 10px;
    color: white;
}
#reject {
    background-color: rgb(145, 76, 76);
    border: 1px solid rgb(145, 76, 76);
}
#confirm {
    background-color: green;
    border: 1px solid green;
}
}
</style>