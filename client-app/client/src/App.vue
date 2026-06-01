<template>
  <router-view />
</template>

<script setup>

import { onMounted } from 'vue'

import { useUserStore } from './stores/user';
import { useSettingsStore } from './stores/settings';
import { useCountriesStore } from './stores/countries';
import { usesportsStore } from './stores/sports';
import { useLeaguesStore } from './stores/leagues';

import API from "./api/index";

const userStore = useUserStore();
const settings_store = useSettingsStore();
const countriesStore = useCountriesStore()
const sportsStore = usesportsStore();
const leaguesStore = useLeaguesStore();

onMounted(() => {

setInterval(async () => {   // In App.vue (your polling function)

  try {

    await userStore.fetch_user().catch(err => { // Try to fetch user but DON'T block the app if it fails

      console.log("User fetch failed (not logged in).", err); 
    
    });
  
    await Promise.all([ // fetch public data

      countriesStore.fetch_countries(),

      sportsStore.fetch_sports(),

      leaguesStore.fetch_leagues(),

      settings_store.fetch_settings()

    ])
  
  } catch (error) {
    
    console.error("Polling error:", error);
  
  }

}, 300000); // 5 minutes

})

</script>

