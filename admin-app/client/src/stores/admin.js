import { defineStore } from "pinia";

import API from "@/api";


export const useAdminStore = defineStore("admin", {

    state: () => ({

        isAuthenticated: false,

        admin: null, 

        isFetched: false, // 🔑 tracks whether fetch_admin completed

    }),


    actions: {
      
      authorized (roles)  {

        return roles.includes(this.admin.role)

      },
    
      logged_In (admin, isAuthenticated) {

        this.admin = admin
        
        this.isAuthenticated = isAuthenticated

      },


      logged_Out () {

        this.admin = null
        
        this.isAuthenticated = !this.isAuthenticated

      },


      async fetch_admin() {
      
        try {
  
          const response = await API.fetch_admin(); // Axios interceptor handles errors
          
          this.logged_In(response.admin, response.isAuthenticated);
        
        } catch (err) {
          
          this.logged_Out();
        
        } finally {
          
          this.isFetched = true; // 🔑 mark fetch as done
        
        }
      
      }
    }
})