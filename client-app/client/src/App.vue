<template>
  <router-view />
</template>

<script setup>

import { onMounted } from 'vue'

import { useSettingStore } from '@/stores/settings'

import { useOrdersStore } from '@/stores/orders'

import { useUserStore } from '@/stores/user'

import { useProductStore } from './stores/products';

import { useCategoriesStore } from './stores/categories';

import API from "./api/index";

const settingStore = useSettingStore()

const orders_store = useOrdersStore()

const user_store = useUserStore()

const productStore = useProductStore();

const categoriesStore = useCategoriesStore();

onMounted(() => {

setInterval(async () => {   // In App.vue (your polling function)

  try {

    await user_store.fetch_user().catch(err => {

      console.log("Polling: User fetch failed", err);
    
    });
    
    
    if (user_store.user) { // Only fetch orders if user is authenticated
      
      await orders_store.fetch_orders().catch(err => {
        
        console.log("Polling: Orders fetch failed", err);
      
      });
    
    }
    
    
    await Promise.all([ // Refresh public data

      productStore.fetch_products(),
      
      categoriesStore.fetch_categories(),
      
      settingStore.fetch_settings()
    
    ]);
  
  } catch (error) {
    
    console.error("Polling error:", error);
  
  }

}, 300000); // 5 minutes

})

</script>

