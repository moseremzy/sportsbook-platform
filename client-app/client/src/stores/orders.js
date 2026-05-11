import { defineStore } from "pinia";

import API from "../api/index";

export const useOrdersStore = defineStore("orders", {

    state: () => ({
    
        order_items: [],

        orders: [],

        current_order_id: null

    }),

    getters: {

      current_order: (state) => {

        return state.order_items.filter((order) => {

          return order.order_id == state.current_order_id

        })
      
      },
        
    },
    
    actions: {
    
        async fetch_orders() {
    
            const response = await API.fetch_orders(); // Your API endpoint

            this.order_items = response.all_order_items || []

            console.log(this.order_items)

            this.orders = response.all_orders || []
    
        }
    }
})