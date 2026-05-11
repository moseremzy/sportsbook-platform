import { defineStore } from "pinia";

import API from "../api/index.js";


export const useCategoriesStore = defineStore("categories", {

    state: () => ({

       categories: []

    }),

    actions: {

      async fetch_categories() {

        const response = await API.fetch_categories(); // Axios interceptor handles errors

        this.categories = response.all_categories || []

      }
   }
})