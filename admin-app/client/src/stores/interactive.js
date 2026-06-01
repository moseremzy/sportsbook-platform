import { defineStore } from "pinia";

import API from "../api/index";

export const useInteractiveStore = defineStore("interactive", {
    
    state: () => ({
       
       side_bar_css: null,
       
       container_css: null,

       sub_container_css: null,

       open_hamburger_css: null,

       close_hamburger_css: null,

       backend_message: '',

       display_main_nav: false, //state of main nav

       display_myorders_nav: false, //state of my orders nav

       display_vieworders_nav: false, //state of my view orders nav

       display_success_alert: false, //for item added to cart

       display_error_alert: false, //for error adding item to cart

       display_success_modal: false,

       display_confirmation_modal: false,

       display_cancel_order_modal: false,

       display_confirm_order_modal: false,

       order_data: null, // data of order to be cancelled

       display_loading_overlay: false,

       query: '', //query for search box

       display_delivered_modal: false

    }),


    actions: {

        Open_Sidebar() { //for search box

           this.side_bar_css = {
               "display":"block"
            }

           this.container_css = {
                "height": "100vmax", 
                "width": "calc(100% + 250px)",
                "overflow-x": "auto",
                "overflow-y": "hidden"
            };

           this.sub_container_css = {
                "transition": "0.5s",
                "width": "calc(100% - 250px)"
            };
          
            this.open_hamburger_css = {"display": "none"}
          
            this.close_hamburger_css = {"display": "inline-block"}

        },


        Close_Sidebar() {

            this.side_bar_css = {"display":"none"}
        
            this.container_css = {
              "height": "auto", 
              "width": "100%",
            };
        
            this.sub_container_css = {
              "transition": "0s",
              "width": "100%",
            };
        
            this.close_hamburger_css = {"display": "none"}
        
            this.open_hamburger_css = {"display": "inline-block"}
        
            },

            display_success_alert_box() { //display success box if i add item succesfully

              this.display_success_alert = true
  
              setTimeout(() => {
  
              this.display_success_alert = false
  
              }, 2000)
  
          },

         
          display_error_alert_box() { //display error box if i add item succesfully
  
              this.display_error_alert = true
  
              setTimeout(() => {
  
              this.display_error_alert = false
  
              }, 3000)
  
          },

        toggle_loading_overlay(state) { //toggle main nav

            this.display_loading_overlay = state

        },

        toggle_cancel_order_modal(state, data) { //toggle cancel order modal

            this.display_cancel_order_modal = state

            this.order_data = data

        },


        toggle_confirm_order_modal(state, data) { //toggle cancel order modal

            this.display_confirm_order_modal = state

            this.order_data = data

        },

        toggle_confirmation_modal(state) { //toggle main nav

            this.display_confirmation_modal = state

        },

        display_success_modal_box(action) { //display error box if i add item succesfully
  
            this.display_success_modal = action

        },

        clearQuery() { //for search box

            this.query = ''
 
         },
    }
})