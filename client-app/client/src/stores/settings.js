import { defineStore } from "pinia";

import API from "../api/index";

export const useSettingStore = defineStore("settings", {
    
    state: () => ({

      store_state: "",
      
      store_city: "",
      
      fee_same_state: 0,
      
      fee_same_city: 0,
      
      fee_other_state: 0,

      whatsapp: null

    }),
    
    actions: {

      async fetch_settings() {
        
        const response = await API.fetch_settings();

        Object.assign(this, response.all_settings);
      
      }
    
    }
  
})