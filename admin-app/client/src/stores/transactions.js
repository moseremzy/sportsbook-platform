import { defineStore } from "pinia";

import API from "../api/index.js";


export const useTransactionsStore = defineStore("transactions", {

    state: () => ({

       transactions: []

    }),

    getters: {

      total_transactions: (state) => { //all users

      return state.transactions.length
        
      }
        
   },

    actions: {

      async fetch_transactions() {

        const response = await API.fetch_transactions(); // Axios interceptor handles errors

        this.transactions = response.all_transactions || []

        console.log(this.transactions)

      }
   }
})