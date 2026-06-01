import { defineStore } from "pinia";

import API from "../api/index";

export const useSettingStore = defineStore("settings", {
    
    state: () => ({

      settings: {}

    }),
    
    actions: {

      async fetch_settings() {
        
        const response = await API.fetch_settings();

        this.settings = response.all_settings;

      }
    
    }
  
})