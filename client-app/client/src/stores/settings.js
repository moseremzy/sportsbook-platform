import { defineStore } from "pinia";

import API from "../api/index.js";

export const useSettingsStore = defineStore("settings", {

    state: () => ({

       settings: []

    }),

    actions: {

      async fetch_settings() {

        const response = await API.fetch_settings(); // Axios interceptor handles errors

        this.settings = response.all_settings || []

      }
   }
})