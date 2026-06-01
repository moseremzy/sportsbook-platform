import { defineStore } from "pinia";

import API from "../api/index";

export const useUsersStore = defineStore("users", {

    state: () => ({

        users: []

    }),

    getters: {

      total_users: (state) => { //all users

      return state.users.length
        
      }
        
     },
    
    actions: {

      async fetch_users() {

        const response = await API.fetch_users(); // Your API endpoint

        this.users = response.all_users

      }
   }
})