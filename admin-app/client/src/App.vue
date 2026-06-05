<template>
  <router-view />
</template>

<script setup>

import { onMounted, onUnmounted, ref, watch } from 'vue'

import { useAdminStore } from './stores/admin';
import { useSportsStore } from './stores/sports';
import { useCountriesStore } from './stores/countries';
import { useUsersStore } from '@/stores/users';
import { useLeaguesStore } from '@/stores/leagues';
import { useEventsStore } from '@/stores/events';
import { useSettingStore } from './stores/settings';
import { useTransactionsStore } from './stores/transactions';
import { useInteractiveStore } from './stores/interactive';

import API from "./api/index";

const admin_store = useAdminStore(); // Access the admin

const sports_store = useSportsStore(); 

const countries_store = useCountriesStore(); //Access the orders store

const users_store = useUsersStore()

const leagues_store = useLeaguesStore()

const events_store = useEventsStore()

const settings_store = useSettingStore();

const transactions_store = useTransactionsStore();

const interactive_store = useInteractiveStore();

const windowWidth = ref(window.innerWidth)

// Method to handle responsive sidebar logic
const responsiveSideBar = (width) => {
  if (width >= 992) { // for desktops
    interactive_store.side_bar_css = { "display": "block" }
    interactive_store.sub_container_css = { "width": "calc(100% - 250px)" }
    interactive_store.container_css = {
      "width": "100%",
      "height": "auto",
      "overflow-x": "auto",
      "overflow-y": "hidden"
    }
    interactive_store.open_hamburger_css = { "display": "none" }
    interactive_store.close_hamburger_css = { "display": "none" }
  } else {
    interactive_store.Close_Sidebar()
  }
}

// Watch for changes in window width
watch(windowWidth, (newWidth) => {

  responsiveSideBar(newWidth)

})

// Update the windowWidth ref on resize
const updateWindowWidth = () => {

  windowWidth.value = window.innerWidth

}

 
onMounted(() => {

window.addEventListener('resize', updateWindowWidth)

setInterval(async () => {   // In App.vue (your polling function)

  try {

    await admin_store.fetch_admin().catch(err => { // Try to fetch user but DON'T block the app if it fails

        console.log("Admin fetch failed (not logged in).", err); 
      
    });

    if (admin_store.isAuthenticated) {

        await Promise.all([

        sports_store.fetch_sports(),

        countries_store.fetch_countries(),

        leagues_store.fetch_leagues(),

        events_store.fetch_events(),

        users_store.fetch_users(),

        transactions_store.fetch_transactions(),

        settings_store.fetch_settings()

        ]);
    }       
  
  } catch (error) {
    
    console.error("Polling error:", error);
  
  }

}, 300000); // 5 minutes

})



onUnmounted(() => {

  window.removeEventListener('resize', updateWindowWidth)

})

</script>
