import { defineStore } from "pinia";

import API from "../api/index.js";


export const usesportsStore = defineStore("sports", {

    state: () => ({

       sports: []

    }),

    actions: {

      async fetch_sports() {

        const response = await API.fetch_sports(); // Axios interceptor handles errors

        this.sports = response.all_sports || []

      }
   }
})