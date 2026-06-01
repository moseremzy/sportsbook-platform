import { defineStore } from "pinia";
import API from "../api/index.js";

export const useUserStore = defineStore("user", {
  
  state: () => ({
    
    isAuthenticated: false,
    
    user: null,
    
    isFetched: false, // 🔑 tracks whether fetch_user completed
  
  }),

  getters: {
    
    formattedPrice: (state) => {

      return (amount) => {
        
       return new Intl.NumberFormat(state.user?.locale || 'en-US', { style: 'currency', currency: state.user?.currency || 'USD' }).format(amount) 
    
    }

  }

  },
  
  actions: {
    
    logged_In(user, isAuthenticated) {
      
      this.user = user;
      
      this.isAuthenticated = isAuthenticated;
    
    },

    logged_Out() {

      this.user = null;
      
      this.isAuthenticated = false; // ✅ fix: set false directly
    
    },

    async fetch_user() {
      
      try {

        const response = await API.fetch_user(); // Axios interceptor handles errors
        
        this.logged_In(response.user, response.isAuthenticated);
      
      } catch (err) {
        
        this.logged_Out();
      
      } finally {
        
        this.isFetched = true; // 🔑 mark fetch as done
      
      }
    
    }

  }

});
