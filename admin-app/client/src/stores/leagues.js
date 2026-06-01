import { defineStore } from "pinia";

import API from "../api/index.js";


export const useLeaguesStore = defineStore("leagues", {

    state: () => ({

       leagues: []

    }),

    getters: {

      total_leagues: (state) => { //all users

      return state.leagues.length
        
      }
        
   },

    actions: {

      async fetch_leagues() {

        const response = await API.fetch_leagues(); // Axios interceptor handles errors

        this.leagues = response.all_leagues || []

      }
   }
})