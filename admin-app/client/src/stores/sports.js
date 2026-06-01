import { defineStore } from "pinia";

import API from "../api/index.js";


export const useSportsStore = defineStore("sports", {

    state: () => ({

       sports: []

    }),

    getters: {

      total_sports: (state) => { //all users

      return state.sports.length
        
      }
        
   },

    actions: {

      async fetch_sports() {

        const response = await API.fetch_sports(); // Axios interceptor handles errors

        this.sports = response.all_sports || []

      }
   }
})