import { defineStore } from "pinia";

import API from "../api/index";

import { useInteractiveStore } from './interactive'; // Import the cart store

import { useSettingStore } from './settings'; // Import the settings store

import { useUserStore } from '@/stores/user'

export const useProductStore = defineStore("products", {

    state: () => ({
    
       products: [],

       cart: JSON.parse(localStorage.getItem('cart_products')) || [] //get cart products from localstorage

    }),

    getters: {

        total_cart_products: (state) => state.cart.length,

        cart_subtotal_amount: (state) => {

          return state.cart.reduce((acc, current_product) => acc + current_product.total, 0);
        
        },

        delivery_fee: (state) => {

          const user_store = useUserStore()
          
          const setting_store = useSettingStore()

          if (user_store.user.city === setting_store.store_city) {
          
            return setting_store.fee_same_city
  
          }
  
          if (user_store.user.state === setting_store.store_state) {
            
            return setting_store.fee_same_state
  
          }
  
            return setting_store.fee_other_state
        
        },

        cart_total_amount: (state) => {

          return state.cart_subtotal_amount + state.delivery_fee
        
        },

        cart_products: (state) => {

          return state.cart || []

        }
        
     },
    
    actions: {

      async fetch_products() {

        const response = await API.fetch_products(); //Axios interceptor handles errors

        this.products = response.all_products || []
          
    },

    
    add_to_cart(product, quantity) {

      const interactive_store = useInteractiveStore(); // Access the interactive store

      try {

        let product_exists = this.cart.find(p => p.product_id === product.product_id);

        if (product_exists) { // If the product already exists in the cart, update its quantity and total
         
          product_exists.quantity += quantity;
         
          product_exists.total = product_exists.price * product_exists.quantity;
        
        } else { // If the product is new, add a fresh copy to the cart
         
          this.cart.unshift({
           
            category_name: product.category_name,
            
            description: product.description,
            
            main_image: product.main_image,
            
            name: product.name,
            
            price: product.price,
            
            product_condition: product.product_condition,
            
            product_id: product.product_id,
           
            quantity, // Add quantity
           
            total: product.price * quantity, // Calculate total
          
          });
        
        }

        this.save_cart_to_Lstorage() //store cart products for localstorage 

        interactive_store.backend_message = 'item added to cart'

        interactive_store.display_success_alert_box() //display success alert box

      } catch(err) { //if there is an error

        interactive_store.backend_message = 'error adding item to cart. try again'
        
        interactive_store.display_error_alert_box()

    }

  },  


  remove_from_cart(product) { //delete product from cart

    this.cart = this.cart.filter(p => p.product_id !== product.product_id);
    
    this.save_cart_to_Lstorage();
  
  },
  

  save_cart_to_Lstorage () { //store cart products for localstorage

    localStorage.setItem('cart_products', JSON.stringify(this.cart)); 

  }

 }
})