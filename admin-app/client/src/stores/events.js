import { defineStore } from "pinia";

import API from "../api/index.js";


export const useEventsStore = defineStore("events", {

    state: () => ({

       events: []

    }),

    actions: {

      async fetch_events() {

        const response = await API.fetch_events(); // Axios interceptor handles errors

        this.events = response.all_events || []

      }
   }
})