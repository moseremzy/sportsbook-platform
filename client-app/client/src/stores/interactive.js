import { defineStore } from 'pinia'

export const useInteractiveStore = defineStore("interactive", {

  state: () => ({

    backend_message: '',

    display_success_alert: false, 

    display_error_alert: false,

    display_loading_overlay: false,

    activeNav: null,

    page_to_go: ''

 }),


 actions: {
      
       display_success_alert_box() { //display success box if i add item succesfully

           this.display_success_alert = true

           setTimeout(() => {

           this.display_success_alert = false

           }, 3000)

       },

       display_error_alert_box() { //display error box if i add item succesfully

         this.display_error_alert = true

         setTimeout(() => {

         this.display_error_alert = false

         }, 3000)

     },


     toggle_loading_overlay(action) { //toggle overlay

         this.display_loading_overlay = action

     },

      closeAllNavs(){

         this.activeNav = null
      
     },

     toggleNav(navName){

         this.activeNav =
            this.activeNav === navName
               ? null
               : navName;

      },
      
      set_page_to_go(page) {
        
        this.page_to_go = page

      }

  }

})