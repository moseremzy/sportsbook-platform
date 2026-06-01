import { defineStore } from "pinia";

import API from "../api/index.js";


export const useCountriesStore = defineStore("countries", {

    state: () => ({

       countries: []

    }),

    actions: {

      async fetch_countries() {

        const response = await API.fetch_countries(); // Axios interceptor handles errors

        this.countries = response.all_countries || []

      }
   }
})